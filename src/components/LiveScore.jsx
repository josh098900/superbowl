import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function LiveScore({ scores, clock, gameStatus }) {
  const isLive = !['pregame', 'final', 'halftime'].includes(gameStatus);
  const statusText = gameStatus === 'final' ? 'FINAL' :
    gameStatus === 'pregame' ? 'PREGAME' :
      gameStatus === 'halftime' ? 'HALFTIME' : 'LIVE';

  const statusColorClass = gameStatus === 'final' ? "bg-slate-700/20 border-slate-600 text-slate-400" :
    gameStatus === 'pregame' ? "bg-blue-600/20 border-blue-500/50 text-blue-400" :
      "bg-red-600/20 border-red-500/50 text-red-500 animate-pulse";

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
      className="relative w-full overflow-hidden rounded-3xl border border-slate-700/50 bg-dashboard-card shadow-2xl"
    >
      {/* Decor borders — inside the overflow-hidden container so they clip to rounded corners */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-seahawks-green via-white/20 to-patriots-red z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-seahawks-green via-white/20 to-patriots-red opacity-50 z-20" />

      <div className="flex flex-col md:flex-row items-stretch">

        {/* Home Team */}
        <div className="flex-1 relative group p-6 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-700/30 bg-gradient-to-br from-patriots-navy/80 to-dashboard-card">
          <div className="absolute inset-0 bg-patriots-red/5 group-hover:bg-patriots-red/10 transition-colors duration-500" />
          <motion.img
            src={scores.home.logo || "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png"}
            alt={scores.home.name}
            className="relative z-10 w-20 h-20 md:w-32 md:h-32 object-contain mb-4 drop-shadow-[0_0_15px_rgba(198,12,48,0.4)]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <h2 className="relative z-10 text-3xl md:text-5xl font-bold tracking-widest text-white mb-2">
            {scores.home.abbreviation || "NE"}
          </h2>
          <div className="relative z-10 text-patriots-red text-sm font-bold tracking-wider uppercase text-center">
            {scores.home.name}
          </div>
        </div>

        {/* Center Scoreboard */}
        <div className="w-full md:w-[440px] flex flex-col items-center justify-center p-8 md:p-10 bg-black/40 backdrop-blur-md relative z-10">
          <div className="text-white/60 text-lg mb-4 tracking-[0.2em] uppercase">Super Bowl LX</div>

          <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14 w-full px-4">
            <motion.div
              key={`home-${scores.home.score}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl sm:text-7xl md:text-8xl font-bold text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
            >
              {scores.home.score}
            </motion.div>
            <div className="text-slate-600 text-3xl md:text-4xl font-light select-none">—</div>
            <motion.div
              key={`away-${scores.away.score}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl sm:text-7xl md:text-8xl font-bold text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
            >
              {scores.away.score}
            </motion.div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <div className={clsx(
              "px-4 py-1 rounded-full border text-sm font-bold tracking-widest transition-colors duration-500",
              statusColorClass
            )}>
              {statusText}
            </div>
            <div className="text-2xl font-mono text-gold-accent tracking-widest drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
              {gameStatus === 'pregame' ? 'FEB 08 • 6:30 PM' :
                gameStatus === 'final' ? 'FINAL SCORE' :
                  `Q${clock?.quarter || 1} • ${clock?.timeRemaining || '15:00'}`}
            </div>
          </div>
        </div>

        {/* Away Team */}
        <div className="flex-1 relative group p-6 md:p-10 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-700/30 bg-gradient-to-bl from-seahawks-navy/80 to-dashboard-card">
          <div className="absolute inset-0 bg-seahawks-green/5 group-hover:bg-seahawks-green/10 transition-colors duration-500" />
          <motion.img
            src={scores.away.logo || "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png"}
            alt={scores.away.name}
            className="relative z-10 w-20 h-20 md:w-32 md:h-32 object-contain mb-4 drop-shadow-[0_0_15px_rgba(105,190,40,0.4)]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          />
          <h2 className="relative z-10 text-3xl md:text-5xl font-bold tracking-widest text-white mb-2">
            {scores.away.abbreviation || "SEA"}
          </h2>
          <div className="relative z-10 text-seahawks-green text-sm font-bold tracking-wider uppercase text-center">
            {scores.away.name}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
