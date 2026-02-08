const resultColors = {
  Touchdown: 'text-green-400 bg-green-400/10',
  'Field Goal': 'text-gold-accent bg-gold-accent/10',
  Punt: 'text-gray-400 bg-gray-400/10',
  Fumble: 'text-red-400 bg-red-400/10',
  Interception: 'text-red-400 bg-red-400/10',
  'Missed FG': 'text-red-400 bg-red-400/10',
  Downs: 'text-orange-400 bg-orange-400/10',
  'End of Half': 'text-gray-500 bg-gray-500/10',
  'End of Game': 'text-gray-500 bg-gray-500/10',
};

const teamBorder = {
  SEA: 'border-l-seahawks-green',
  NE: 'border-l-patriots-red',
};

export default function DriveHistory({ driveHistory = [] }) {
  if (driveHistory.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Drive Summary
        </h3>
        <p className="text-gray-500 text-sm text-center">Drive history available once the game begins</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
        Drive Summary
      </h3>
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {driveHistory.map((drive, i) => {
          const colors = resultColors[drive.result] || 'text-gray-400 bg-gray-400/10';
          const border = teamBorder[drive.team] || 'border-l-gray-500';
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border-l-2 ${border}`}
            >
              <span className="text-xs font-bold text-white/60 w-8 shrink-0">{drive.team}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${colors}`}>
                    {drive.result}
                  </span>
                  <span className="text-gray-400">
                    {drive.plays} plays · {drive.yards} yds · {drive.timeElapsed}
                  </span>
                </div>
              </div>
              {drive.quarter > 0 && (
                <span className="text-[10px] text-gray-500 shrink-0">Q{drive.quarter}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
