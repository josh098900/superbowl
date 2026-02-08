import { useState, useCallback } from 'react';
import { useGameData } from './hooks/useGameData';
import SplashScreen from './components/SplashScreen';
import ScoringCelebration from './components/ScoringCelebration';
import AnimatedCard from './components/AnimatedCard';
import LiveScore from './components/LiveScore';
import PlayByPlay from './components/PlayByPlay';
import PlayerStats from './components/PlayerStats';
import WinProbability from './components/WinProbability';
import TeamStats from './components/TeamStats';
import DriveTracker from './components/DriveTracker';
import QuarterBreakdown from './components/QuarterBreakdown';
import PredictionCard from './components/PredictionCard';
import PropTracker from './components/PropTracker';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  const {
    eventId,
    gameStatus,
    scores,
    clock,
    plays,
    playerStats,
    teamStats,
    winProbability,
    currentDrive,
    quarterScores,
    isLoading,
    consecutiveErrors,
  } = useGameData();

  if (!isLoading && eventId === null) {
    return (
      <div className="min-h-screen bg-dashboard-bg text-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Super Bowl LX</h1>
          <p className="text-gray-400" data-testid="game-not-found">
            Super Bowl LX game not found. Please check back closer to game time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg text-white relative overflow-hidden">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <ScoringCelebration plays={plays} />

      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-seahawks-green/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-patriots-red/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-accent/3 rounded-full blur-3xl" />
      </div>

      {/* Error states */}
      {consecutiveErrors >= 3 && (
        <div
          data-testid="error-banner"
          className="relative z-10 w-full bg-red-600 text-white text-center py-2 text-sm font-semibold"
        >
          Unable to reach ESPN. Showing cached data.
        </div>
      )}
      {consecutiveErrors > 0 && consecutiveErrors < 3 && (
        <div
          data-testid="error-indicator"
          className="relative z-10 w-full text-center py-1 text-xs text-yellow-400"
        >
          Reconnecting to ESPN...
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
        <AnimatedCard delay={100}>
          <LiveScore scores={scores} clock={clock} gameStatus={gameStatus} />
        </AnimatedCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4">
            <AnimatedCard delay={200}>
              <DriveTracker currentDrive={currentDrive} />
            </AnimatedCard>
            <AnimatedCard delay={400}>
              <WinProbability winProbability={winProbability} />
            </AnimatedCard>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatedCard delay={300}>
              <PlayByPlay plays={plays} />
            </AnimatedCard>
          </div>

          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <AnimatedCard delay={350}>
              <TeamStats teamStats={teamStats} />
            </AnimatedCard>
            <AnimatedCard delay={450}>
              <QuarterBreakdown quarterScores={quarterScores} />
            </AnimatedCard>
            <AnimatedCard delay={550}>
              <PredictionCard gameStatus={gameStatus} scores={scores} playerStats={playerStats} />
            </AnimatedCard>
            <AnimatedCard delay={650}>
              <PropTracker teamStats={teamStats} scores={scores} plays={plays} />
            </AnimatedCard>
          </div>
        </div>

        <AnimatedCard delay={700}>
          <div className="mt-4">
            <PlayerStats playerStats={playerStats} />
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}

export default App;
