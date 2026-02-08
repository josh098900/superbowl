import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ROTATE_INTERVAL = 5000;

function getStatLine(player) {
  const s = player.stats || {};
  switch (player.position) {
    case 'QB':
      return `${s.completionsAttempts || '0/0'} · ${s.yards || 0} YDS · ${s.touchdowns || 0} TD · ${s.interceptions || 0} INT`;
    case 'WR':
      return `${s.receptions || 0} REC · ${s.yards || 0} YDS · ${s.touchdowns || 0} TD`;
    case 'RB':
      return `${s.carries || 0} CAR · ${s.yards || 0} YDS · ${s.touchdowns || 0} TD`;
    default:
      return '';
  }
}

const teamColors = {
  SEA: { border: 'border-seahawks-green/50', glow: 'shadow-[0_0_20px_rgba(105,190,40,0.25)]', badge: 'bg-seahawks-green/20 text-seahawks-green' },
  NE: { border: 'border-patriots-red/50', glow: 'shadow-[0_0_20px_rgba(198,12,48,0.25)]', badge: 'bg-patriots-red/20 text-patriots-red' },
};

export default function PlayerCarousel({ playerStats, scores }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const players = [];
  if (playerStats) {
    for (const pos of ['qb', 'wr', 'rb']) {
      for (const side of ['home', 'away']) {
        const p = playerStats[pos]?.[side];
        if (p && p.name !== 'N/A') players.push(p);
      }
    }
  }

  // Pregame fallback: show team info cards when no player data yet
  const fallbackCards = [];
  if (players.length === 0 && scores) {
    if (scores.home?.name !== 'Home') {
      fallbackCards.push({
        name: scores.home.name,
        team: scores.home.abbreviation,
        headshot: scores.home.logo,
        position: 'HOME',
        stats: {},
        isFallback: true,
      });
    }
    if (scores.away?.name !== 'Away') {
      fallbackCards.push({
        name: scores.away.name,
        team: scores.away.abbreviation,
        headshot: scores.away.logo,
        position: 'AWAY',
        stats: {},
        isFallback: true,
      });
    }
  }

  const displayItems = players.length > 0 ? players : fallbackCards;

  const advance = useCallback(() => {
    if (displayItems.length > 0) setIndex((i) => (i + 1) % displayItems.length);
  }, [displayItems.length]);

  useEffect(() => {
    if (isPaused || displayItems.length <= 1) return;
    const timer = setInterval(advance, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [advance, isPaused, displayItems.length]);

  if (displayItems.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-4 text-center text-gray-500 text-sm">
        Player data available once the game begins
      </div>
    );
  }

  const player = displayItems[index % displayItems.length];
  const colors = teamColors[player.team] || teamColors.NE;

  return (
    <div
      className="glass-panel rounded-xl overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {players.length > 0 ? 'Key Players' : 'Matchup'}
        </h3>
        <div className="flex gap-1">
          {displayItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === index % displayItems.length ? 'bg-gold-accent w-4' : 'bg-gray-600'
              }`}
              aria-label={`Go to player ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={player.name + player.team}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-4 p-4"
        >
          {/* Headshot */}
          <div className={`relative shrink-0 w-16 h-16 rounded-full border-2 ${colors.border} ${colors.glow} overflow-hidden bg-dashboard-surface`}>
            {player.headshot ? (
              <img
                src={player.headshot}
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-gray-500">
                🏈
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-white truncate">{player.name}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.badge}`}>
                {player.team}
              </span>
            </div>
            <div className="text-xs text-gray-400 mb-1">{player.position}</div>
            <div className="text-sm text-gray-200 font-mono">
              {player.isFallback ? 'Stats available at kickoff' : getStatLine(player)}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
