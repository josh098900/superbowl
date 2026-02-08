import { motion } from 'framer-motion';
import patriotsHelmet from '../assets/new_england.png';
import seahawksHelmet from '../assets/seahawk.png';

/**
 * Cinematic helmet clash at the bottom of the dashboard.
 *
 * Image orientation (from the PNGs):
 *   - Patriots helmet faces LEFT (facemask pointing left)
 *   - Seahawks helmet faces RIGHT (facemask pointing right)
 *
 * To make them face EACH OTHER:
 *   - Patriots (left side): needs to face RIGHT → flip with scaleX: -1
 *   - Seahawks (right side): needs to face LEFT → flip with scaleX: -1
 */
export default function HelmetClash() {
  return (
    <div className="relative w-full overflow-hidden py-8 md:py-12 pointer-events-none select-none">
      {/* Gradient fade at top */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-dashboard-bg to-transparent z-10" />

      {/* Clash glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-32 h-32 md:w-48 md:h-48 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(251,191,36,0.05) 50%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Spark lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-t from-transparent via-gold-accent to-transparent"
            style={{ height: `${40 + i * 10}px`, rotate: `${i * 30}deg` }}
            animate={{ opacity: [0, 0.6, 0], scaleY: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* VS text */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <motion.span
          className="text-2xl md:text-4xl font-bold tracking-widest"
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.5))',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          VS
        </motion.span>
      </div>

      {/* Helmets */}
      <div className="relative z-10 flex items-center justify-center max-w-4xl mx-auto px-4">

        {/* Patriots — on the left, flipped to face RIGHT (toward center) */}
        <motion.div
          className="flex-1 flex justify-end"
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, type: 'spring', bounce: 0.3 }}
        >
          <motion.div
            animate={{ scaleX: [-1, -1.03, -1], scaleY: [1, 1.03, 1], x: [0, 6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src={patriotsHelmet}
              alt="New England Patriots helmet"
              className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain"
              style={{
                filter: 'drop-shadow(0 0 25px rgba(198,12,48,0.5)) drop-shadow(0 0 50px rgba(198,12,48,0.2))',
              }}
            />
          </motion.div>
        </motion.div>

        {/* Spacer */}
        <div className="w-24 md:w-36 shrink-0" />

        {/* Seahawks — on the right, flipped to face LEFT (toward center) */}
        <motion.div
          className="flex-1 flex justify-start -ml-10"
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, type: 'spring', bounce: 0.3 }}
        >
          <motion.div
            animate={{ scaleX: [-1, -1.03, -1], scaleY: [1, 1.03, 1], x: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <img
              src={seahawksHelmet}
              alt="Seattle Seahawks helmet"
              className="w-60 h-60 sm:w-72 sm:h-72 md:w-[22rem] md:h-[22rem] object-contain"
              style={{
                filter: 'drop-shadow(0 0 25px rgba(105,190,40,0.5)) drop-shadow(0 0 50px rgba(105,190,40,0.2))',
              }}
            />
          </motion.div>
        </motion.div>

      </div>

      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-dashboard-bg to-transparent z-10" />
    </div>
  );
}
