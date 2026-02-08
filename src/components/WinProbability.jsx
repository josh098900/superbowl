import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

export default function WinProbability({ winProbability }) {
  return (
    <div className="card-glass rounded-xl p-4">
      <h2 className="text-lg font-bold mb-3">Win Probability</h2>
      {winProbability.length === 0 ? (
        <p className="text-gray-400 text-sm">No win probability data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={winProbability}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="gameTime"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={formatGameTime}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
            />
            <ReferenceLine y={50} stroke="#475569" strokeDasharray="6 3" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
              labelFormatter={formatGameTime}
              formatter={(value, name) => [`${value}%`, name]}
            />
            <Legend wrapperStyle={{ color: '#f8fafc' }} />
            <Line
              type="monotone"
              dataKey="homeWinPct"
              name="Patriots"
              stroke="#C60C30"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="awayWinPct"
              name="Seahawks"
              stroke="#69BE28"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function formatGameTime(value) {
  if (value === undefined || value === null) return '';
  const str = String(value);
  // If it looks like a quarter-based time (e.g. "Q1 12:00"), pass through
  if (str.startsWith('Q')) return str;
  // If it's a numeric play index, convert to a play label
  const num = Number(str);
  if (!isNaN(num)) return `Play ${num}`;
  return str;
}
