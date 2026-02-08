import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

const ROTATE_INTERVAL = 4000;

const teamColors = {
  SEA: 'text-seahawks-green',
  NE: 'text-patriots-red',
};

const categoryIcons = {
  passingYards: '🎯',
  rushingYards: '🏃',
  receivingYards: '🙌',
};

export default function GameLeaders({ leaders = [] }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const advance = useCallback(() => {
    if (leaders.length > 0) setIndex((i) => (i + 1) % leaders.length);
  }, [leaders.length]);

  useEffect(() => {
    if (isPaused || leaders.length <= 1) return;
    const timer = setInterval(advance, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [advance, isPaused, leaders.length]);

  if (leaders.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-4 text-center text-gray-500 text-sm">
        Game leaders available at kickoff
      </div>
    );
  }

  const leader = leaders[index % leaders.length];
  const teamColor = teamColors[leader.team] || 'text-white';
  const icon = categoryIcons[leader.category] || '⭐';

  return (
    <div
      className="glass-panel rounded-xl overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Game Leaders
        </h3>
        <div className="flex gap-1">
          {leaders.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === index % leaders.length ? 'bg-gold-accent w-4' : 'bg-gray-600'
              }`}
              aria-label={`Leader ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={leader.name + leader.category}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 px-4 pb-4 pt-2"
        >
          <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-dashboard-surface border border-white/10">
            {leader.headshot ? (
              <img src={leader.headshot} alt={leader.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">{icon}</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              {icon} {leader.category.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white truncate">{leader.name}</span>
              <span className={`text-[10px] font-bold ${teamColor}`}>{leader.team}</span>
            </div>
            <div className="text-sm text-gold-accent font-mono">{leader.value}</div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
