const RESULT_LABELS = {
  touchdown: '🏈 Touchdown!',
  field_goal: '✅ Field Goal',
  punt: '📤 Punt',
  turnover: '🔄 Turnover',
};

export default function DriveTracker({ currentDrive }) {
  if (!currentDrive) {
    return (
      <div className="card-gold rounded-xl p-4">
        <h2 className="text-lg font-bold mb-3">Current Drive</h2>
        <p className="text-gray-400 text-sm">No active drive.</p>
      </div>
    );
  }

  const { team, plays, yards, timeElapsed, down, distance, yardLine, isActive, result } = currentDrive;

  return (
    <div className="card-gold rounded-xl p-4">
      <h2 className="text-lg font-bold mb-3">Current Drive</h2>
      <div className="text-sm font-semibold text-gold-accent mb-3">{team}</div>

      {isActive ? (
        <div className="flex flex-col gap-2">
          {/* Down & Distance visual */}
          <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-600/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gold-accent font-bold text-lg" data-testid="drive-down-distance">
                {down}{ordinal(down)} & {distance}
              </span>
              <span className="text-gray-400 text-xs" data-testid="drive-field-position">
                Ball on {yardLine} yd line
              </span>
            </div>
            {/* Down progress bar */}
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-accent/80 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, ((10 - distance) / 10) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>LOS</span>
              <span>1st Down</span>
            </div>
          </div>

          {/* Mini field position */}
          <div className="bg-slate-900/40 rounded-lg p-2">
            <div className="relative h-3 bg-gradient-to-r from-seahawks-green/20 via-slate-600/30 to-patriots-red/20 rounded-full overflow-hidden">
              <div
                className="absolute top-0 w-2.5 h-3 bg-gold-accent rounded-full shadow-lg transition-all duration-300"
                style={{ left: `${Math.max(0, Math.min(97, (yardLine / 100) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Own 0</span>
              <span>50</span>
              <span>Opp 0</span>
            </div>
          </div>

          {/* Drive stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900/40 rounded-lg p-2">
              <div className="text-xs text-gray-400">Plays</div>
              <div className="font-bold" data-testid="drive-plays">{plays}</div>
            </div>
            <div className="bg-slate-900/40 rounded-lg p-2">
              <div className="text-xs text-gray-400">Yards</div>
              <div className="font-bold" data-testid="drive-yards">{yards}</div>
            </div>
            <div className="bg-slate-900/40 rounded-lg p-2">
              <div className="text-xs text-gray-400">Time</div>
              <div className="font-bold" data-testid="drive-time">{timeElapsed}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm bg-slate-900/40 rounded-lg p-3 text-center">
          <span data-testid="drive-result" className="font-bold text-gold-accent text-lg">
            {RESULT_LABELS[result] || result}
          </span>
        </div>
      )}
    </div>
  );
}

function ordinal(n) {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}
