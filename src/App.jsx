import { useState, useCallback } from 'react';
import { useGameData } from './hooks/useGameData';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import ScoringCelebration from './components/ScoringCelebration';
import LiveScore from './components/LiveScore';
import PlayByPlay from './components/PlayByPlay';
import PlayerStats from './components/PlayerStats';
import WinProbability from './components/WinProbability';
import TeamStats from './components/TeamStats';
import DriveTracker from './components/DriveTracker';
import QuarterBreakdown from './components/QuarterBreakdown';
import PredictionCard from './components/PredictionCard';
import PropTracker from './components/PropTracker';
import StadiumBackground from './components/StadiumBackground';
import AnimatedCard from './components/AnimatedCard';
import PlayerCarousel from './components/PlayerCarousel';
import NewsCarousel from './components/NewsCarousel';
import GameLeaders from './components/GameLeaders';
import DriveHistory from './components/DriveHistory';
import HelmetClash from './components/HelmetClash';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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
    driveHistory,
    quarterScores,
    gameInfo,
    isLoading,
    consecutiveErrors,
  } = useGameData();

  if (!isLoading && eventId === null) {
    return (
      <div className="min-h-screen bg-dashboard-bg text-white flex items-center justify-center">
        <StadiumBackground />
        <div className="text-center p-8 relative z-10 glass-panel rounded-2xl">
          <h1 className="text-4xl font-broadcast mb-4">Super Bowl LX</h1>
          <p className="text-gray-400" data-testid="game-not-found">
            Game data not found. Coverage begins soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden font-inter selection:bg-gold-accent/30">
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <ScoringCelebration plays={plays} />
      <StadiumBackground />

      {/* Main Content */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 py-6">

        {/* Header / Jumbotron */}
        <div className="mb-8">
          <LiveScore scores={scores} clock={clock} gameStatus={gameStatus} gameInfo={gameInfo} />
        </div>

        {/* Carousels Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <AnimatedCard delay={150}>
            <PlayerCarousel playerStats={playerStats} scores={scores} />
          </AnimatedCard>
          <AnimatedCard delay={200}>
            <GameLeaders leaders={gameInfo.leaders} />
          </AnimatedCard>
          <AnimatedCard delay={250}>
            <NewsCarousel />
          </AnimatedCard>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Game State */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <AnimatedCard delay={200}>
              <DriveTracker currentDrive={currentDrive} />
            </AnimatedCard>
            <AnimatedCard delay={250}>
              <DriveHistory driveHistory={driveHistory} />
            </AnimatedCard>
            <AnimatedCard delay={400}>
              <WinProbability winProbability={winProbability} />
            </AnimatedCard>
            <AnimatedCard delay={550}>
              <PredictionCard gameStatus={gameStatus} scores={scores} playerStats={playerStats} plays={plays} />
            </AnimatedCard>
          </div>

          {/* Center Column: Play-by-Play (Widest) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <AnimatedCard delay={300}>
              <PlayByPlay plays={plays} />
            </AnimatedCard>
            <AnimatedCard delay={700}>
              <PlayerStats playerStats={playerStats} />
            </AnimatedCard>
          </div>

          {/* Right Column: Analytics */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <AnimatedCard delay={350}>
              <TeamStats teamStats={teamStats} />
            </AnimatedCard>
            <AnimatedCard delay={450}>
              <QuarterBreakdown quarterScores={quarterScores} />
            </AnimatedCard>
            <AnimatedCard delay={650}>
              <PropTracker teamStats={teamStats} scores={scores} plays={plays} />
            </AnimatedCard>
          </div>

        </div>
      </div>

      {/* Helmet Clash — cinematic battle section */}
      <HelmetClash />

      {/* Connection Status */}
      <AnimatePresence>
        {consecutiveErrors > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            data-testid={consecutiveErrors >= 3 ? "error-banner" : "reconnecting-banner"}
            className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg glass-panel-heavy border-l-4 border-red-500 text-sm font-semibold"
          >
            {consecutiveErrors >= 3
              ? "Connection Lost. Showing cached data."
              : "Reconnecting..."}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
