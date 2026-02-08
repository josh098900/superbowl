const STAT_ROWS = [
  ['totalYards', 'Total Yards'],
  ['firstDowns', 'First Downs'],
  ['turnovers', 'Turnovers'],
  ['thirdDownPct', '3rd Down %'],
  ['redZonePct', 'Red Zone %'],
  ['timeOfPossession', 'Time of Possession'],
];

export default function TeamStats({ teamStats }) {
  return (
    <div className="card-glass rounded-xl p-4">
      <h2 className="text-lg font-bold mb-3">Team Stats</h2>
      <div className="flex justify-between mb-3 text-sm font-semibold">
        <span className="text-seahawks-green">SEA</span>
        <span className="text-patriots-red">NE</span>
      </div>
      <div className="flex flex-col gap-3">
        {STAT_ROWS.map(([key, label]) => {
          const awayVal = teamStats.away?.[key];
          const homeVal = teamStats.home?.[key];
          const awayNum = parseFloat(awayVal) || 0;
          const homeNum = parseFloat(homeVal) || 0;
          const total = awayNum + homeNum;
          const awayPct = total > 0 ? (awayNum / total) * 100 : 50;
          const homePct = total > 0 ? (homeNum / total) * 100 : 50;

          return (
            <div key={key} data-testid={`stat-${key}`}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{format(awayVal)}</span>
                <span className="text-gray-400 text-xs">{label}</span>
                <span className="font-medium">{format(homeVal)}</span>
              </div>
              {/* Micro-bar */}
              <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-700/50">
                <div
                  className="bg-seahawks-green/70 transition-all duration-500"
                  style={{ width: `${awayPct}%` }}
                />
                <div
                  className="bg-patriots-red/70 transition-all duration-500"
                  style={{ width: `${homePct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function format(val) {
  if (val === undefined || val === null) return '-';
  return String(val);
}
