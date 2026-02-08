export default function PropTracker({ teamStats, scores, plays }) {
  const totalPoints = (scores?.away?.score ?? 0) + (scores?.home?.score ?? 0);
  const longestPlay = computeLongestPlay(plays);
  const totalSacks = (teamStats?.home?.sacks ?? 0) + (teamStats?.away?.sacks ?? 0);
  const totalTurnovers = (teamStats?.home?.turnovers ?? 0) + (teamStats?.away?.turnovers ?? 0);

  const overUnder = totalPoints > 47.5 ? 'Over' : 'Under';

  const props = [
    { label: 'Total Points O/U 47.5', value: `${totalPoints} (${overUnder})` },
    { label: 'Longest Play', value: `${longestPlay} yds` },
    { label: 'Total Sacks', value: String(totalSacks) },
    { label: 'Total Turnovers', value: String(totalTurnovers) },
  ];

  return (
    <div className="card-glass rounded-xl p-4">
      <h2 className="text-lg font-bold mb-3">Prop Tracker</h2>
      <div className="flex flex-col gap-2">
        {props.map((p) => (
          <div key={p.label} data-testid={`prop-${p.label}`} className="flex justify-between text-sm">
            <span className="text-gray-400">{p.label}</span>
            <span className="font-semibold">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function computeLongestPlay(plays) {
  if (!plays || plays.length === 0) return 0;
  return Math.max(...plays.map((p) => Math.abs(p.yardLine || 0)));
}
