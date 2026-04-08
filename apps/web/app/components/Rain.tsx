'use client';
import { useMemo } from 'react';
import styles from '../page.module.css';

const DROP_COUNT = 45;

export default function Rain() {
  const drops = useMemo(
    () =>
      Array.from({ length: DROP_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 0.5 + Math.random() * 0.6,
        delay: Math.random() * 2.5,
        opacity: 0.5 + Math.random() * 0.4,
        height: 12 + Math.random() * 16,
      })),
    []
  );

  return (
    <div className={styles.rain}>
      {drops.map((drop) => (
        <div
          key={drop.id}
          className={styles.raindrop}
          style={{
            left: `${drop.left}%`,
            animationDuration: `${drop.duration}s`,
            animationDelay: `${drop.delay}s`,
            opacity: drop.opacity,
            height: `${drop.height}px`,
          }}
        />
      ))}
    </div>
  );
}
