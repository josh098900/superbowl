import { useState, useEffect } from 'react';

const TEAM_COLORS = {
  SEA: { primary: '#69BE28', secondary: '#002244' },
  NE: { primary: '#C60C30', secondary: '#B0B7BC' },
};

export default function ScoringCelebration({ plays }) {
  const [celebration, setCelebration] = useState(null);
  const [lastPlayCount, setLastPlayCount] = useState(0);

  useEffect(() => {
    if (!plays || plays.length === 0) return;
    if (plays.length <= lastPlayCount) {
      setLastPlayCount(plays.length);
      return;
    }

    // Check new plays for scoring
    const newPlays = plays.slice(lastPlayCount);
    setLastPlayCount(plays.length);

    const scoringPlay = newPlays.find((p) => p.isScoring);
    if (scoringPlay) {
      const team = scoringPlay.team?.toUpperCase() || 'SEA';
      const colors = TEAM_COLORS[team] || TEAM_COLORS.SEA;
      setCelebration({ description: scoringPlay.description, team, colors });
      setTimeout(() => setCelebration(null), 3000);
    }
  }, [plays, lastPlayCount]);

  if (!celebration) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
              background: i % 3 === 0
                ? celebration.colors.primary
                : i % 3 === 1
                ? celebration.colors.secondary
                : '#fbbf24',
              borderRadius: i % 2 === 0 ? '50%' : '2px',
              animation: `confettiFall ${2 + Math.random() * 2}s ease-in forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* Score flash */}
      <div className="animate-scoreFlash text-center">
        <div
          className="text-4xl sm:text-6xl font-black uppercase tracking-wider mb-2"
          style={{ color: celebration.colors.primary, textShadow: `0 0 40px ${celebration.colors.primary}80` }}
        >
          {celebration.description?.includes('TOUCHDOWN') ? '🏈 TOUCHDOWN!' :
           celebration.description?.includes('GOOD') ? '✅ FIELD GOAL!' :
           '⭐ SCORE!'}
        </div>
        <div className="text-lg text-gray-300">{celebration.team}</div>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes scoreFlash {
          0% { transform: scale(0.3); opacity: 0; }
          30% { transform: scale(1.2); opacity: 1; }
          60% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-scoreFlash {
          animation: scoreFlash 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
