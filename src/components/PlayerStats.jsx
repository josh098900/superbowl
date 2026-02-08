const POSITION_CONFIGS = {
  qb: {
    title: 'QB Comparison',
    statLabels: [
      ['completionsAttempts', 'Comp/Att'],
      ['yards', 'Yards'],
      ['touchdowns', 'TDs'],
      ['interceptions', 'INTs'],
      ['rating', 'Rating'],
    ],
  },
  wr: {
    title: 'WR Comparison',
    statLabels: [
      ['receptions', 'Rec'],
      ['yards', 'Yards'],
      ['touchdowns', 'TDs'],
      ['targets', 'Targets'],
    ],
  },
  rb: {
    title: 'RB Comparison',
    statLabels: [
      ['carries', 'Carries'],
      ['yards', 'Yards'],
      ['touchdowns', 'TDs'],
      ['yardsPerCarry', 'YPC'],
    ],
  },
};

export default function PlayerStats({ playerStats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {Object.entries(POSITION_CONFIGS).map(([pos, config]) => (
        <ComparisonCard
          key={pos}
          title={config.title}
          home={playerStats[pos]?.home}
          away={playerStats[pos]?.away}
          statLabels={config.statLabels}
        />
      ))}
    </div>
  );
}

function ComparisonCard({ title, home, away, statLabels }) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-4">
      <h3 className="text-sm font-bold text-gold-accent mb-3">{title}</h3>
      <div className="flex justify-between mb-2">
        <span className="text-seahawks-green font-semibold text-sm">
          {away?.name || 'N/A'}
        </span>
        <span className="text-patriots-red font-semibold text-sm">
          {home?.name || 'N/A'}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {statLabels.map(([key, label]) => (
          <div key={key} className="flex justify-between text-sm">
            <span>{formatStat(away?.stats?.[key])}</span>
            <span className="text-gray-400 text-xs">{label}</span>
            <span>{formatStat(home?.stats?.[key])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatStat(val) {
  if (val === undefined || val === null) return '-';
  return String(val);
}
