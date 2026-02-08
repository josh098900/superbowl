import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNews } from '../utils/espnApi';

const ROTATE_INTERVAL = 8000;

export default function NewsCarousel() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { data: articles = [] } = useQuery({
    queryKey: ['superbowl-news'],
    queryFn: fetchNews,
    staleTime: 5 * 60 * 1000, // 5 min
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
  });

  const advance = useCallback(() => {
    if (articles.length > 0) setIndex((i) => (i + 1) % articles.length);
  }, [articles.length]);

  useEffect(() => {
    if (isPaused || articles.length <= 1) return;
    const timer = setInterval(advance, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [advance, isPaused, articles.length]);

  if (articles.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-4 text-center text-gray-500 text-sm">
        Loading Super Bowl news...
      </div>
    );
  }

  const article = articles[index % articles.length];

  return (
    <div
      className="glass-panel rounded-xl overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Super Bowl News
        </h3>
        <div className="flex gap-1">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === index % articles.length ? 'bg-gold-accent w-4' : 'bg-gray-600'
              }`}
              aria-label={`Go to article ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.a
          key={article.headline}
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
          className="flex gap-4 p-4 group cursor-pointer"
        >
          {/* Thumbnail */}
          {article.image && (
            <div className="shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-dashboard-surface">
              <img
                src={article.image}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-gold-accent transition-colors">
              {article.headline}
            </p>
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
              {article.description}
            </p>
          </div>
        </motion.a>
      </AnimatePresence>
    </div>
  );
}
