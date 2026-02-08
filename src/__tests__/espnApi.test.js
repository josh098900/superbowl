import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property 1: Event ID extraction from any scoreboard response
 *
 * For any ESPN scoreboard response containing a list of events,
 * if exactly one event name includes "Super Bowl", fetchScoreboard()
 * shall return that event's ID. If no event name includes "Super Bowl",
 * it shall signal an error.
 *
 * **Validates: Requirements 1.1, 1.2**
 */

// Mock axios before importing espnApi
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Ensure mock data mode is off so we go through axios
vi.stubEnv('VITE_USE_MOCK_DATA', '');

describe('Property 1: Event ID extraction from any scoreboard response', () => {
  let axios;
  let fetchScoreboard;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('VITE_USE_MOCK_DATA', '');
    axios = (await import('axios')).default;
    const espnApi = await import('../utils/espnApi.js');
    fetchScoreboard = espnApi.fetchScoreboard;
  });

  // Arbitrary for a non-Super-Bowl event
  const nonSuperBowlEvent = fc.record({
    id: fc.stringMatching(/^[a-z0-9]{4,12}$/),
    name: fc.stringMatching(/^[A-Za-z0-9 ]{1,30}$/).filter(
      (name) => !name.toLowerCase().includes('super bowl')
    ),
  });

  // Arbitrary for a Super Bowl event
  const superBowlEvent = fc.record({
    id: fc.stringMatching(/^[a-z0-9]{4,12}$/),
    name: fc.stringMatching(/^[A-Za-z0-9 ]{0,20}$/).map(
      (prefix) => `${prefix} Super Bowl LX`
    ),
  });

  it('returns the correct event ID when exactly one Super Bowl event exists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(nonSuperBowlEvent, { minLength: 0, maxLength: 10 }),
        superBowlEvent,
        fc.nat({ max: 10 }),
        async (otherEvents, sbEvent, insertIndex) => {
          // Insert the Super Bowl event at a random position
          const events = [...otherEvents];
          const idx = Math.min(insertIndex, events.length);
          events.splice(idx, 0, sbEvent);

          axios.get.mockResolvedValueOnce({ data: { events } });

          const result = await fetchScoreboard();
          expect(result).toBe(sbEvent.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('throws an error when no Super Bowl event exists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(nonSuperBowlEvent, { minLength: 0, maxLength: 10 }),
        async (events) => {
          axios.get.mockResolvedValueOnce({ data: { events } });

          await expect(fetchScoreboard()).rejects.toThrow(
            'Super Bowl LX game not found'
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 3: Polling interval matches game status
 *
 * For any GameStatus value, the polling interval returned by getPollingInterval shall be:
 * 5000ms when status is q1, q2, q3, q4, or overtime;
 * 30000ms when status is pregame or halftime;
 * false (disabled) when status is final.
 *
 * **Validates: Requirements 2.4, 2.5, 2.6**
 */
describe('Property 3: Polling interval matches game status', () => {
  let getPollingInterval;

  beforeEach(async () => {
    vi.resetModules();
    const espnApi = await import('../utils/espnApi.js');
    getPollingInterval = espnApi.getPollingInterval;
  });

  const liveStatuses = fc.constantFrom('q1', 'q2', 'q3', 'q4', 'overtime');
  const slowStatuses = fc.constantFrom('pregame', 'halftime');

  it('returns 5000ms for live game statuses (q1, q2, q3, q4, overtime)', () => {
    fc.assert(
      fc.property(liveStatuses, (status) => {
        expect(getPollingInterval(status)).toBe(5000);
      }),
      { numRuns: 100 }
    );
  });

  it('returns 30000ms for pregame and halftime', () => {
    fc.assert(
      fc.property(slowStatuses, (status) => {
        expect(getPollingInterval(status)).toBe(30000);
      }),
      { numRuns: 100 }
    );
  });

  it('returns false for final', () => {
    expect(getPollingInterval('final')).toBe(false);
  });
});


/**
 * Property 17: ESPN API normalization preserves data integrity
 *
 * For any valid ESPN Summary API response, normalizeGameData(rawData) shall produce
 * an object where every team score in the output matches the corresponding score in
 * the raw input, and every play description in the output matches the corresponding
 * description in the raw input.
 *
 * **Validates: Requirements 1.1, 2.1, 3.3**
 */
describe('Property 17: ESPN API normalization preserves data integrity', () => {
  let normalizeGameData;

  beforeEach(async () => {
    vi.resetModules();
    const espnApi = await import('../utils/espnApi.js');
    normalizeGameData = espnApi.normalizeGameData;
  });

  // Arbitrary: a score string like ESPN returns (e.g. "0", "14", "42")
  const scoreArb = fc.nat({ max: 99 }).map(String);

  // Arbitrary: a play object matching ESPN's structure
  const playArb = fc.record({
    id: fc.nat({ max: 99999 }).map(String),
    text: fc.stringMatching(/^[A-Za-z0-9 .]{1,60}$/),
    scoringPlay: fc.boolean(),
    start: fc.record({
      down: fc.integer({ min: 1, max: 4 }),
      distance: fc.integer({ min: 1, max: 30 }),
      yardLine: fc.integer({ min: 1, max: 99 }),
      team: fc.record({ abbreviation: fc.constantFrom('SEA', 'NE') }),
    }),
    period: fc.record({ number: fc.integer({ min: 1, max: 4 }) }),
    clock: fc.record({
      displayValue: fc.constantFrom('14:52', '10:30', '7:23', '2:00', '0:05'),
    }),
  });

  // Arbitrary: a competitor object matching ESPN's structure
  const competitorArb = (homeAway) =>
    fc.record({
      homeAway: fc.constant(homeAway),
      score: scoreArb,
      possession: fc.boolean(),
      team: fc.record({
        displayName: fc.constant(homeAway === 'home' ? 'New England Patriots' : 'Seattle Seahawks'),
        abbreviation: fc.constant(homeAway === 'home' ? 'NE' : 'SEA'),
        logos: fc.constant([{ href: `https://example.com/${homeAway}.png` }]),
      }),
      linescores: fc.constant([]),
    });

  // Arbitrary: a full ESPN-like raw response
  const rawDataArb = fc.record({
    header: fc.record({
      competitions: fc.tuple(competitorArb('home'), competitorArb('away')).map(
        ([home, away]) => [
          {
            status: {
              type: { name: 'STATUS_IN_PROGRESS' },
              period: 2,
              displayClock: '7:23',
            },
            competitors: [home, away],
          },
        ]
      ),
    }),
    plays: fc.record({
      allPlays: fc.array(playArb, { minLength: 0, maxLength: 20 }),
    }),
    scoringPlays: fc.constant([]),
    boxscore: fc.constant({ players: [], teams: [] }),
    winprobability: fc.constant([]),
    drives: fc.constant({}),
  });

  it('preserves team scores from raw input', () => {
    fc.assert(
      fc.property(rawDataArb, (rawData) => {
        const result = normalizeGameData(rawData);
        const competitors = rawData.header.competitions[0].competitors;
        const homeComp = competitors.find((c) => c.homeAway === 'home');
        const awayComp = competitors.find((c) => c.homeAway === 'away');

        expect(result.scores.home.score).toBe(parseInt(homeComp.score, 10));
        expect(result.scores.away.score).toBe(parseInt(awayComp.score, 10));
      }),
      { numRuns: 100 }
    );
  });

  it('preserves play descriptions from raw input', () => {
    fc.assert(
      fc.property(rawDataArb, (rawData) => {
        const result = normalizeGameData(rawData);
        const rawPlays = rawData.plays.allPlays;

        expect(result.plays.length).toBe(rawPlays.length);
        for (let i = 0; i < rawPlays.length; i++) {
          expect(result.plays[i].description).toBe(rawPlays[i].text);
        }
      }),
      { numRuns: 100 }
    );
  });
});
