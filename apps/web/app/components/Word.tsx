'use client';

import { motion } from 'framer-motion';
import { useRef, useLayoutEffect, useState } from 'react';

type Props = {
  upper: string;
  lower: string;
  phase: 'idle' | 'animate';
  index: number;
  targetPositions: number[];
};

export default function Word({ upper, lower, phase, index, targetPositions }: Props) {
  const upperRef = useRef<HTMLSpanElement>(null);
  const [startX, setStartX] = useState(0);

  useLayoutEffect(() => {
    if (upperRef.current) {
      const rect = upperRef.current.getBoundingClientRect();
      setStartX(rect.left);
    }
  }, []);

  const deltaX = (targetPositions[index] ?? 0) - startX;

  return (
    <motion.span
      style={{
        display: 'inline-flex',
        position: 'relative',
      }}
      initial={false}
      animate={
        phase === 'idle'
          ? { x: 0 }
          : { x: deltaX } // Move uppercase + mask together
      }
      transition={{
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
    }}
    >
      {/* UPPERCASE */}
      <span
        ref={upperRef}
        style={{
          display: 'inline-block',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {upper}
      </span>

      {/* LOWERCASE MASK */}
      <span
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          position: 'relative',
          whiteSpace: 'nowrap',
        }}
      >
        <motion.span
          style={{
            display: 'inline-block',
          }}
          initial={false}
          animate={
            phase === 'idle'
              ? { x: 0 }
              : { x: '-100%' } // Slide out left inside moving mask
          }
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {lower}
        </motion.span>
      </span>
    </motion.span>
  );
}