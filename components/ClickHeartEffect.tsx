"use client"

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Position {
  x: number;
  y: number;
  id: number;
}

export default function ClickHeartEffect() {
  const [clicks, setClicks] = useState<Position[]>([]);
  const nextId = useRef(0);
  const animationCount = useRef<{[key: number]: number}>({});

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const id = nextId.current++;
      setClicks(prev => [...prev, { x: e.clientX, y: e.clientY, id }]);
      animationCount.current[id] = 12; // Number of hearts per click
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleAnimationComplete = (clickId: number) => {
    animationCount.current[clickId]--;
    if (animationCount.current[clickId] === 0) {
      setClicks(prev => prev.filter(click => click.id !== clickId));
      delete animationCount.current[clickId];
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {clicks.map((click) => (
          <div key={click.id}>
            {[...Array(12)].map((_, i) => {
              const angle = (i * Math.PI * 2) / 12 + Math.random() * 0.5;
              const distance = 100 + Math.random() * 100;
              const duration = 1 + Math.random() * 0.5;
              const initialScale = 0.5 + Math.random() * 1;
              
              return (
                <motion.div
                  key={`${click.id}-${i}`}
                  initial={{
                    x: click.x,
                    y: click.y,
                    scale: initialScale,
                    opacity: 1,
                    rotate: Math.random() * 360
                  }}
                  animate={{
                    x: click.x + Math.cos(angle) * distance,
                    y: click.y + Math.sin(angle) * distance,
                    scale: 0,
                    rotate: Math.random() * 720 - 360
                  }}
                  transition={{
                    duration: duration,
                    ease: "easeOut"
                  }}
                  onAnimationComplete={() => handleAnimationComplete(click.id)}
                  className="absolute"
                  style={{ 
                    x: click.x, 
                    y: click.y,
                    transform: `translate(-50%, -50%)`
                  }}
                >
                  <svg 
                    className="text-[#b35151] fill-current"
                    width={24} 
                    height={24} 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </motion.div>
              );
            })}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}