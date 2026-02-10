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
import seahawksHelmet from './assets/seahawk.png';

// Set to true after the season ends to stop all ESPN API calls
const SEASON_OVER = true;

function ThankYouPage() {
  return (
    <div className="min-h-screen text-white relative overflow-hidden font-inter flex flex-col items-center justify-center">
      <StadiumBackground />
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: 'spring' }}
        >
          <h1
            className="text-5xl md:text-7xl font-bold mb-4 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.4))',
            }}
          >
            Super Bowl LX
          </h1>
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl text-white/80 mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Thank you for using my dashboard
        </motion.p>

        <motion.p
          className="text-lg md:text-xl text-white/50 mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          See you again next year at the SoFi 🏟️
        </motion.p>

        {/* Champion helmet */}
        <motion.div
          className="relative my-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 1, type: 'spring' }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(105,190,40,0.3) 0%, rgba(105,190,40,0.05) 50%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <img
            src={seahawksHelmet}
            alt="Seattle Seahawks - Super Bowl LX Champions"
            className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 object-contain relative z-10"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(105,190,40,0.5)) drop-shadow(0 0 60px rgba(105,190,40,0.2))',
            }}
          />
        </motion.div>

        <motion.p
          className="text-lg md:text-xl font-bold text-seahawks-green"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          🏆 Super Bowl LX Champions
        </motion.p>

        <motion.p
          className="text-sm text-white/30 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          Super Bowl LXI · SoFi Stadium · Inglewood, CA
        </motion.p>
      </div>
    </div>
  );
}

function App() {
  if (SEASON_OVER) {
    return <ThankYouPage />;
  }

  return <Dashboard />;
}

function Dashboard() {
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
