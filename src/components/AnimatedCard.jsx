import { useEffect, useRef, useState } from 'react';

export default function AnimatedCard({ children, delay = 0, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        hover:scale-[1.01] hover:shadow-lg hover:shadow-slate-900/50
        ${className}`}
    >
      {children}
    </div>
  );
}
