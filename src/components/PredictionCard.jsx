const PREDICTIONS = [
  { label: 'Final Score', predicted: 'SEA 27, NE 20' },
  { label: 'MVP', predicted: 'Jaxon Smith-Njigba' },
  { label: 'Total Points', predicted: '47' },
  { label: 'First TD', predicted: 'Zach Charbonnet' },
];

export default function PredictionCard({ gameStatus, scores, playerStats, plays }) {
  const isLive = gameStatus !== 'pregame';

  const predictions = PREDICTIONS.map((p) => ({
    ...p,
    actual: isLive ? getActual(p.label, scores, playerStats, plays, gameStatus) : null,
    isCorrect: isLive ? checkCorrect(p.label, scores, plays, gameStatus) : null,
  }));

  return (
    <div className="card-gold rounded-xl p-4">
      <h2 className="text-lg font-bold mb-3">Predictions</h2>
      <div className="flex flex-col gap-3">
        {predictions.map((p) => (
          <div key={p.label} data-testid={`prediction-${p.label}`} className="flex items-center justify-between text-sm">
            <div className="flex-1">
              <div className="text-gray-400 text-xs">{p.label}</div>
              <div className="font-semibold">{p.predicted}</div>
              {p.actual !== null && (
                <div className="text-xs text-gray-300">Actual: {p.actual}</div>
              )}
            </div>
            <Indicator isCorrect={p.isCorrect} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Indicator({ isCorrect }) {
  if (isCorrect === null) {
    return (
      <span data-testid="indicator-pending" className="text-gray-500 text-lg" title="Pending">
        ⏳
      </span>
    );
  }
  if (isCorrect) {
    return (
      <span data-testid="indicator-correct" className="text-green-400 text-lg font-bold" title="Correct">
        ✓
      </span>
    );
  }
  return (
    <span data-testid="indicator-incorrect" className="text-red-400 text-lg font-bold" title="Incorrect">
      ✗
    </span>
  );
}

function getActual(label, scores, playerStats, plays, gameStatus) {
  if (!scores) return null;
  switch (label) {
    case 'Final Score':
      return `SEA ${scores.away?.score ?? '?'}, NE ${scores.home?.score ?? '?'}`;
    case 'Total Points':
      return String((scores.away?.score ?? 0) + (scores.home?.score ?? 0));
    case 'First TD': {
      const firstTD = findFirstTouchdown(plays);
      return firstTD || (gameStatus === 'final' ? 'Unknown' : null);
    }
    case 'MVP':
      return null;
    default:
      return null;
  }
}

function checkCorrect(label, scores, plays, gameStatus) {
  if (!scores) return null;
  switch (label) {
    case 'Total Points': {
      const total = (scores.away?.score ?? 0) + (scores.home?.score ?? 0);
      if (gameStatus === 'final') return total === 47;
      return total > 47 ? false : null;
    }
    case 'Final Score': {
      if (gameStatus !== 'final') return null;
      const awayScore = scores.away?.score ?? 0;
      const homeScore = scores.home?.score ?? 0;
      return awayScore === 27 && homeScore === 20;
    }
    case 'First TD': {
      const firstTD = findFirstTouchdown(plays);
      if (!firstTD) return null;
      return firstTD.toLowerCase().includes('charbonnet');
    }
    default:
      return null;
  }
}

/**
 * Finds the scorer of the first touchdown from the play-by-play data.
 * Looks for the first scoring play with "TOUCHDOWN" in the description.
 */
function findFirstTouchdown(plays) {
  if (!plays || plays.length === 0) return null;
  const tdPlay = plays.find(
    (p) => p.isScoring && p.description.toLowerCase().includes('touchdown')
  );
  if (!tdPlay) return null;
  // Try to extract the player name from the description
  // Common patterns: "Player for X yards TOUCHDOWN", "Player pass to Receiver TOUCHDOWN"
  const desc = tdPlay.description;
  // Look for "to PlayerName" pattern (pass plays)
  const passMatch = desc.match(/(?:pass.*?to|complete to)\s+([A-Z][\w.''-]+(?:\s+[A-Z][\w.''-]+)*)/i);
  if (passMatch) return passMatch[1];
  // Look for "PlayerName up the middle/left end/right tackle" pattern (rush plays)
  const rushMatch = desc.match(/^([A-Z][\w.''-]+(?:\s+[A-Z][\w.''-]+)*)\s+(?:up|left|right|middle)/i);
  if (rushMatch) return rushMatch[1];
  // Fallback: return the team abbreviation
  return tdPlay.team ? `${tdPlay.team} player` : null;
}
