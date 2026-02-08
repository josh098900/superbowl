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
    <div className="card-glass rounded-xl p-4 max-h-[500px] overflow-y-auto">
      <h2 className="text-lg font-bold mb-3">Play-by-Play</h2>
      {recentPlays.length === 0 && (
        <p className="text-gray-400 text-sm">No plays yet.</p>
      )}
      <div className="flex flex-col gap-2">
        <div ref={topRef} />
        {[...recentPlays].reverse().map((play, index) => (
          <div
            key={play.id}
            data-testid="play-item"
            className={`rounded-lg p-3 text-sm animate-playSlideIn ${
              play.isScoring
                ? 'bg-gold-accent/20 border border-gold-accent'
                : 'bg-slate-700/50'
            }`}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Q{play.quarter} · {play.clock}</span>
              <span>
                {play.down > 0 && `${play.down}${ordinal(play.down)} & ${play.distance}`}
                {play.yardLine > 0 && ` at ${play.yardLine} yd line`}
              </span>
            </div>
            <p>{highlightOutcome(play.description)}</p>
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

/**
 * Highlights key outcome words in play descriptions to make results pop.
 */
function highlightOutcome(description) {
  if (!description) return description;
  const outcomes = /\b(TOUCHDOWN|GOOD|INTERCEPTED|FUMBLE|SACKED|INCOMPLETE|NO GOOD|SAFETY|PENALTY)\b/gi;
  const parts = description.split(outcomes);
  if (parts.length === 1) return description;

  return parts.map((part, i) => {
    if (outcomes.test(part)) {
      outcomes.lastIndex = 0;
      return (
        <span key={i} className="font-bold text-gold-accent">
          {part}
        </span>
      );
    }
    return part;
  });
}

// Inject play slide-in animation
const playStyle = document.createElement('style');
playStyle.textContent = `
  @keyframes playSlideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .animate-playSlideIn {
    animation: playSlideIn 0.4s ease-out both;
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('play-slide-style')) {
  playStyle.id = 'play-slide-style';
  document.head.appendChild(playStyle);
}
