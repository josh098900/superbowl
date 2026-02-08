const STATUS_LABELS = {
  pregame: 'Pregame',
  q1: 'Q1',
  q2: 'Q2',
  halftime: 'Halftime',
  q3: 'Q3',
  q4: 'Q4',
  overtime: 'OT',
  final: 'Final',
};

export default function LiveScore({ scores, clock, gameStatus }) {
  const statusLabel = STATUS_LABELS[gameStatus] || gameStatus;
  const showClock = !['pregame', 'halftime', 'final'].includes(gameStatus);

  return (
    <div className="w-full bg-slate-800/60 rounded-xl p-6 mb-4">
      <div className="flex items-center justify-between gap-4">
        {/* Away team */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {scores.away.logo && (
            <img
              src={scores.away.logo}
              alt={`${scores.away.name} logo`}
              className="w-16 h-16 object-contain"
            />
          )}
          <span className="text-seahawks-green font-semibold text-lg">
            {scores.away.name}
          </span>
          <span className="text-5xl font-bold">{scores.away.score}</span>
        </div>

        {/* Center: status + clock */}
        <div className="flex flex-col items-center gap-1">
          <span className="px-3 py-1 rounded-full bg-gold-accent text-dashboard-bg text-sm font-bold">
            {statusLabel}
          </span>
          {showClock && (
            <>
              <span className="text-sm text-gray-400">
                Quarter {clock.quarter}
              </span>
              <span className="text-lg font-mono">{clock.timeRemaining}</span>
            </>
          )}
        </div>

        {/* Home team */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {scores.home.logo && (
            <img
              src={scores.home.logo}
              alt={`${scores.home.name} logo`}
              className="w-16 h-16 object-contain"
            />
          )}
          <span className="text-patriots-red font-semibold text-lg">
            {scores.home.name}
          </span>
          <span className="text-5xl font-bold">{scores.home.score}</span>
        </div>
      </div>
    </div>
  );
}
