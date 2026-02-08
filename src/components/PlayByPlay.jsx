import { useEffect, useRef } from 'react';

export default function PlayByPlay({ plays }) {
  const topRef = useRef(null);
  const recentPlays = plays.slice(-15);

  useEffect(() => {
    if (typeof topRef.current?.scrollIntoView === 'function') {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [recentPlays.length]);

  return (
    <div className="bg-slate-800/60 rounded-xl p-4 max-h-[500px] overflow-y-auto">
      <h2 className="text-lg font-bold mb-3">Play-by-Play</h2>
      {recentPlays.length === 0 && (
        <p className="text-gray-400 text-sm">No plays yet.</p>
      )}
      <div className="flex flex-col gap-2">
        <div ref={topRef} />
        {[...recentPlays].reverse().map((play) => (
          <div
            key={play.id}
            data-testid="play-item"
            className={`rounded-lg p-3 text-sm ${
              play.isScoring
                ? 'bg-gold-accent/20 border border-gold-accent'
                : 'bg-slate-700/50'
            }`}
          >
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Q{play.quarter} · {play.clock}</span>
              <span>
                {play.down > 0 && `${play.down}${ordinal(play.down)} & ${play.distance}`}
                {play.yardLine > 0 && ` at ${play.yardLine} yd line`}
              </span>
            </div>
            <p>{play.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ordinal(n) {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}
