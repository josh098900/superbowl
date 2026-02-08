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

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

function isUnderTwoMinutes(timeRemaining) {
  if (!timeRemaining) return false;
  const parts = timeRemaining.split(':');
  if (parts.length !== 2) return false;
  const minutes = parseInt(parts[0], 10);
  return minutes < 2;
}

export default function LiveScore({ scores, clock, gameStatus }) {
  const statusLabel = STATUS_LABELS[gameStatus] || gameStatus;
  const showClock = !['pregame', 'halftime', 'final'].includes(gameStatus);
  const possession = clock?.possession;
  const urgentClock = showClock && isUnderTwoMinutes(clock?.timeRemaining);
  const awayScore = useAnimatedNumber(scores.away.score);
  const homeScore = useAnimatedNumber(scores.home.score);

  return (
    <div className="w-full card-glass rounded-2xl p-4 sm:p-8 mb-6">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Away team */}
        <div className="flex-1 flex flex-col items-center gap-1 sm:gap-2 min-w-0">
          {scores.away.logo && (
            <img
              src={scores.away.logo}
              alt={`${scores.away.name} logo`}
              className="w-12 h-12 sm:w-20 sm:h-20 object-contain drop-shadow-lg"
            />
          )}
          <div className="flex items-center gap-1 min-w-0">
            {possession === 'away' && (
              <span className="shrink-0 animate-possessionPulse" title="Has possession">🏈</span>
            )}
            <span className="text-seahawks-green font-bold text-sm sm:text-xl truncate">
              {scores.away.abbreviation || scores.away.name}
            </span>
          </div>
          <span className={`text-5xl sm:text-7xl font-extrabold tracking-tight tabular-nums transition-all duration-500 ${
            possession === 'away' ? 'drop-shadow-[0_0_15px_rgba(105,190,40,0.4)]' : ''
          }`}>
            {awayScore}
          </span>
        </div>

        {/* Center: status + clock */}
        <div className="flex flex-col items-center gap-1 sm:gap-2 shrink-0">
          <span className="px-2 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gold-accent text-dashboard-bg text-xs sm:text-sm font-black uppercase tracking-wider">
            {statusLabel}
          </span>
          {showClock && (
            <div className={`flex flex-col items-center rounded-lg px-2 sm:px-4 py-1 sm:py-2 border transition-all duration-300 ${
              urgentClock
                ? 'bg-red-900/40 border-red-500/60 animate-clockPulse'
                : 'bg-slate-900/60 border-slate-600/40'
            }`}>
              <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">
                Quarter {clock.quarter}
              </span>
              <span className={`text-lg sm:text-2xl font-mono font-bold tracking-wider ${
                urgentClock ? 'text-red-400' : ''
              }`}>
                {clock.timeRemaining}
              </span>
            </div>
          )}
        </div>

        {/* Home team */}
        <div className="flex-1 flex flex-col items-center gap-1 sm:gap-2 min-w-0">
          {scores.home.logo && (
            <img
              src={scores.home.logo}
              alt={`${scores.home.name} logo`}
              className="w-12 h-12 sm:w-20 sm:h-20 object-contain drop-shadow-lg"
            />
          )}
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-patriots-red font-bold text-sm sm:text-xl truncate">
              {scores.home.abbreviation || scores.home.name}
            </span>
            {possession === 'home' && (
              <span className="shrink-0 animate-possessionPulse" title="Has possession">🏈</span>
            )}
          </div>
          <span className={`text-5xl sm:text-7xl font-extrabold tracking-tight tabular-nums transition-all duration-500 ${
            possession === 'home' ? 'drop-shadow-[0_0_15px_rgba(198,12,48,0.4)]' : ''
          }`}>
            {homeScore}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes possessionPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
        .animate-possessionPulse {
          animation: possessionPulse 1.5s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes clockPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          50% { box-shadow: 0 0 12px 2px rgba(239, 68, 68, 0.3); }
        }
        .animate-clockPulse {
          animation: clockPulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
