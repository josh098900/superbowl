import axios from 'axios';
import mockScoreboard from '../mocks/mockScoreboard.json';
import mockSummary from '../mocks/mockSummary.json';

const SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
const SUMMARY_URL =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * Returns the appropriate polling interval based on game status.
 * - Live quarters/overtime: 5000ms
 * - Pregame/halftime: 30000ms
 * - Final: false (stop polling)
 */
export function getPollingInterval(gameStatus) {
  switch (gameStatus) {
    case 'q1':
    case 'q2':
    case 'q3':
    case 'q4':
    case 'overtime':
      return 5000;
    case 'pregame':
    case 'halftime':
      return 30000;
    case 'final':
      return false;
    default:
      return 30000;
  }
}

/**
 * Fetches the ESPN scoreboard and finds the Super Bowl LX event ID.
 */
export async function fetchScoreboard() {
  const data = USE_MOCK_DATA
    ? mockScoreboard
    : (await axios.get(SCOREBOARD_URL)).data;
  const events = data?.events || [];
  const superBowlEvent = events.find((event) => {
    // Check event name
    if ((event.name || '').toLowerCase().includes('super bowl')) return true;
    // Check competition notes (ESPN puts "Super Bowl LX" here)
    const competitions = event.competitions || [];
    for (const comp of competitions) {
      const notes = comp.notes || [];
      for (const note of notes) {
        if ((note.headline || '').toLowerCase().includes('super bowl')) return true;
      }
    }
    return false;
  });

  if (!superBowlEvent) {
    throw new Error('Super Bowl LX game not found');
  }

  return superBowlEvent.id;
}

/**
 * Fetches the ESPN game summary for a given event ID.
 */
export async function fetchGameSummary(eventId) {
  if (USE_MOCK_DATA) {
    return mockSummary;
  }
  const { data } = await axios.get(SUMMARY_URL, {
    params: { event: eventId },
  });
  return data;
}

/**
 * Maps ESPN status type to our GameStatus enum.
 */
function parseGameStatus(statusType, period) {
  const type = (statusType || '').toLowerCase();
  if (type.includes('pre')) return 'pregame';
  if (type.includes('final') || type.includes('post')) return 'final';
  if (type.includes('halftime')) return 'halftime';
  if (type.includes('in') || type.includes('progress')) {
    switch (period) {
      case 1: return 'q1';
      case 2: return 'q2';
      case 3: return 'q3';
      case 4: return 'q4';
      default: return period > 4 ? 'overtime' : 'pregame';
    }
  }
  return 'pregame';
}

/**
 * Normalizes raw ESPN JSON into our typed data models.
 */
export function normalizeGameData(rawData) {
  const header = rawData?.header;
  const boxscore = rawData?.boxscore;
  const plays = rawData?.plays;
  const winprobability = rawData?.winprobability;
  const drives = rawData?.drives;
  const scoringPlays = rawData?.scoringPlays || [];

  // Game status
  const competition = header?.competitions?.[0];
  const statusDetail = competition?.status;
  const statusType = statusDetail?.type?.name || '';
  const period = statusDetail?.period || 0;
  const gameStatus = parseGameStatus(statusType, period);

  // Scores
  const competitors = competition?.competitors || [];
  const homeComp = competitors.find((c) => c.homeAway === 'home') || competitors[0] || {};
  const awayComp = competitors.find((c) => c.homeAway === 'away') || competitors[1] || {};

  const scores = {
    home: {
      name: homeComp.team?.displayName || 'Home',
      abbreviation: homeComp.team?.abbreviation || 'HOM',
      score: parseInt(homeComp.score || '0', 10),
      logo: homeComp.team?.logos?.[0]?.href || '',
    },
    away: {
      name: awayComp.team?.displayName || 'Away',
      abbreviation: awayComp.team?.abbreviation || 'AWY',
      score: parseInt(awayComp.score || '0', 10),
      logo: awayComp.team?.logos?.[0]?.href || '',
    },
  };

  // Clock
  const clock = {
    quarter: period,
    timeRemaining: statusDetail?.displayClock || '0:00',
    possession: homeComp.possession ? 'home' : awayComp.possession ? 'away' : null,
  };

  // Plays
  const scoringPlayIds = new Set(scoringPlays.map((sp) => String(sp.id)));
  const allPlays = (plays?.allPlays || []).map((play) => ({
    id: String(play.id || ''),
    description: play.text || play.description || '',
    down: play.start?.down || 0,
    distance: play.start?.distance || 0,
    yardLine: play.start?.yardLine || 0,
    isScoring: play.scoringPlay === true || scoringPlayIds.has(String(play.id)),
    team: play.start?.team?.abbreviation || '',
    quarter: play.period?.number || 0,
    clock: play.clock?.displayValue || '0:00',
  }));

  // Player stats
  const playerStats = normalizePlayerStats(boxscore);

  // Team stats
  const teamStats = normalizeTeamStats(boxscore, homeComp, awayComp);

  // Win probability
  const winProbability = (winprobability || []).map((wp) => ({
    gameTime: String(wp.playId || wp.sequenceNumber || ''),
    homeWinPct: Math.round((wp.homeWinPercentage || 0) * 100),
    awayWinPct: Math.round((1 - (wp.homeWinPercentage || 0)) * 100),
  }));

  // Current drive
  const currentDrive = normalizeDrive(drives);

  // Quarter scores
  const quarterScores = normalizeQuarterScores(competitors);

  return {
    gameStatus,
    scores,
    clock,
    plays: allPlays,
    playerStats,
    teamStats,
    winProbability,
    currentDrive,
    quarterScores,
  };
}

/**
 * Extracts player stats from boxscore for QB, WR, RB comparisons.
 */
function normalizePlayerStats(boxscore) {
  const defaultLine = { name: 'N/A', team: '', stats: {} };
  const result = {
    qb: { home: { ...defaultLine }, away: { ...defaultLine } },
    wr: { home: { ...defaultLine }, away: { ...defaultLine } },
    rb: { home: { ...defaultLine }, away: { ...defaultLine } },
  };

  const players = boxscore?.players || [];
  players.forEach((teamBlock) => {
    const teamAbbr = teamBlock.team?.abbreviation || '';
    const side = teamBlock.homeAway === 'home' ? 'home' : 'away';
    const stats = teamBlock.statistics || [];

    stats.forEach((statGroup) => {
      const category = (statGroup.name || '').toLowerCase();
      const athletes = statGroup.athletes || [];
      if (athletes.length === 0) return;

      if (category === 'passing' && athletes[0]) {
        const a = athletes[0];
        const s = a.stats || [];
        result.qb[side] = {
          name: a.athlete?.displayName || 'N/A',
          team: teamAbbr,
          stats: {
            completionsAttempts: s[0] || '0/0',
            yards: parseInt(s[1] || '0', 10),
            touchdowns: parseInt(s[3] || '0', 10),
            interceptions: parseInt(s[4] || '0', 10),
            rating: parseFloat(s[7] || '0'),
          },
        };
      }

      if (category === 'receiving' && athletes[0]) {
        const a = athletes[0];
        const s = a.stats || [];
        result.wr[side] = {
          name: a.athlete?.displayName || 'N/A',
          team: teamAbbr,
          stats: {
            receptions: parseInt(s[0] || '0', 10),
            yards: parseInt(s[1] || '0', 10),
            touchdowns: parseInt(s[3] || '0', 10),
            targets: parseInt(s[5] || '0', 10),
          },
        };
      }

      if (category === 'rushing' && athletes[0]) {
        const a = athletes[0];
        const s = a.stats || [];
        result.rb[side] = {
          name: a.athlete?.displayName || 'N/A',
          team: teamAbbr,
          stats: {
            carries: parseInt(s[0] || '0', 10),
            yards: parseInt(s[1] || '0', 10),
            touchdowns: parseInt(s[3] || '0', 10),
            yardsPerCarry: parseFloat(s[4] || '0'),
          },
        };
      }
    });
  });

  return result;
}

/**
 * Extracts team-level stats from boxscore.
 */
function normalizeTeamStats(boxscore, homeComp, awayComp) {
  const defaultStats = {
    totalYards: 0,
    firstDowns: 0,
    turnovers: 0,
    thirdDownPct: '0%',
    redZonePct: '0%',
    timeOfPossession: '0:00',
    sacks: 0,
  };

  const teams = boxscore?.teams || [];
  const result = { home: { ...defaultStats }, away: { ...defaultStats } };

  teams.forEach((teamBlock) => {
    const side = teamBlock.homeAway === 'home' ? 'home' : 'away';
    const stats = teamBlock.statistics || [];

    const findStat = (name) =>
      stats.find((s) => (s.name || '').toLowerCase() === name.toLowerCase());

    const totalYards = findStat('totalYards');
    const firstDowns = findStat('firstDowns');
    const turnovers = findStat('turnovers');
    const thirdDownEff = findStat('thirdDownEff');
    const redZoneEff = findStat('redZoneAttempts') || findStat('redZonePct');
    const possession = findStat('possessionTime');
    const sacks = findStat('sacks');

    result[side] = {
      totalYards: parseInt(totalYards?.displayValue || '0', 10),
      firstDowns: parseInt(firstDowns?.displayValue || '0', 10),
      turnovers: parseInt(turnovers?.displayValue || '0', 10),
      thirdDownPct: thirdDownEff?.displayValue || '0%',
      redZonePct: redZoneEff?.displayValue || '0%',
      timeOfPossession: possession?.displayValue || '0:00',
      sacks: parseInt(sacks?.displayValue || '0', 10),
    };
  });

  return result;
}

/**
 * Extracts current drive data.
 */
function normalizeDrive(drives) {
  const current = drives?.current;
  if (!current) return null;

  return {
    team: current.team?.abbreviation || '',
    plays: current.plays?.length || 0,
    yards: current.yards || 0,
    timeElapsed: current.timeElapsed?.displayValue || '0:00',
    down: current.start?.down || 0,
    distance: current.start?.distance || 0,
    yardLine: current.start?.yardLine || 0,
    isActive: current.isComplete === false || current.isComplete === undefined,
    result: current.result || null,
  };
}

/**
 * Extracts quarter-by-quarter scoring from competitor linescores.
 */
function normalizeQuarterScores(competitors) {
  const homeComp = competitors.find((c) => c.homeAway === 'home') || competitors[0] || {};
  const awayComp = competitors.find((c) => c.homeAway === 'away') || competitors[1] || {};

  const homeLinescores = homeComp.linescores || [];
  const awayLinescores = awayComp.linescores || [];
  const maxQuarters = Math.max(homeLinescores.length, awayLinescores.length);

  const quarters = [];
  for (let i = 0; i < maxQuarters; i++) {
    quarters.push({
      quarter: i + 1,
      homeScore: parseInt(homeLinescores[i]?.displayValue || '0', 10),
      awayScore: parseInt(awayLinescores[i]?.displayValue || '0', 10),
    });
  }

  return { quarters };
}
