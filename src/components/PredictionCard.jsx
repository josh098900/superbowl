const PREDICTIONS = [
  { label: 'Final Score', predicted: 'SEA 27, NE 20' },
  { label: 'MVP', predicted: 'Jaxon Smith-Njigba' },
  { label: 'Total Points', predicted: '47' },
  { label: 'First TD', predicted: 'Zach Charbonnet' },
];

export default function PredictionCard({ gameStatus, scores, playerStats }) {
  const isLive = gameStatus !== 'pregame';

  const predictions = PREDICTIONS.map((p) => ({
    ...p,
    actual: isLive ? getActual(p.label, scores, playerStats) : null,
    isCorrect: isLive ? checkCorrect(p.label, scores, playerStats) : null,
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

function getActual(label, scores, playerStats) {
  if (!scores) return null;
  switch (label) {
    case 'Final Score':
      return `SEA ${scores.away?.score ?? '?'}, NE ${scores.home?.score ?? '?'}`;
    case 'Total Points':
      return String((scores.away?.score ?? 0) + (scores.home?.score ?? 0));
    case 'MVP':
    case 'First TD':
      return null;
    default:
      return null;
  }
}

function checkCorrect(label, scores) {
  if (!scores) return null;
  switch (label) {
    case 'Total Points': {
      const total = (scores.away?.score ?? 0) + (scores.home?.score ?? 0);
      return total === 47 ? true : total > 47 ? false : null;
    }
    default:
      return null;
  }
}
