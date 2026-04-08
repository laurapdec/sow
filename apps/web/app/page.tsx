'use client';

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Word from './components/Word';
import Rain from './components/Rain';
import SeedlingImg from './components/SeedlingImg';
import styles from './page.module.css';

export default function LoadingScreen() {
  const router = useRouter();

  const [phase, setPhase] = useState<'idle' | 'animate'>('idle');
  const [targets, setTargets] = useState<number[]>([]);

  const smallSeedlings = useMemo(() => {
    // Random positions from 25% to 95%, minimum 8% apart, avoiding the large seedling zone
    const positions: number[] = [];
    let attempts = 0;
    while (positions.length < 8 && attempts < 200) {
      attempts++;
      const pos = 25 + Math.random() * 70;
      if (positions.every((p) => Math.abs(p - pos) >= 8)) {
        positions.push(pos);
      }
    }
    return positions.map((left) => ({
      left,
      delay: Math.random() * 2.0,
      size: 55 + Math.random() * 35, // 55–90px, slight size variety
    }));
  }, []);

  // Calculate center targets for SOW letters
  useLayoutEffect(() => {
    const center = window.innerWidth / 2;
    const spacing = 50;
    setTargets([
      center - spacing, // S
      center,           // O
      center + spacing, // W
    ]);
  }, []);

  // Start animation
  useEffect(() => {
    const timer = setTimeout(() => setPhase('animate'), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Redirect after animation finishes + extra wait
  useEffect(() => {
    if (phase !== 'animate') return;

    const animationDuration = 2000; // match Word component duration
    const waitAfter = 1500;        // wait to let users process SOW
    const totalWait = animationDuration + waitAfter;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/check', { cache: 'no-store' });
        const data = await res.json();
        if (data.loggedIn) router.push('/map');
        else router.push('/auth');
      } catch {
        router.push('/auth');
      }
    }, totalWait);

    return () => clearTimeout(timer);
  }, [phase, router]);

  return (
    <div className={styles.container}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/stars.svg" alt="" className={styles.star} />
      {phase === 'animate' && <Rain />}
      {/* Big seedling — 500ms after rain, GIF starts exactly then, freezes before loop */}
      {phase === 'animate' && (
        <SeedlingImg
          id={0}
          className={styles.seedlingLarge}
          startAfter={500}
        />
      )}
      {/* Small seedlings — each mounts when phase starts, GIF & rise both begin at startAfter */}
      {phase === 'animate' && smallSeedlings.map((s, i) => {
        const startAfter = Math.round((0.5 + s.delay) * 1000);
        return (
          <div
            key={i}
            className={styles.seedlingWrap}
            style={{
              left: `${s.left}%`,
              width: `${s.size}px`,
              animationDelay: `${startAfter / 1000}s`,
            }}
          >
            <SeedlingImg
              id={i + 1}
              className={styles.seedlingSmall}
              startAfter={startAfter}
            />
          </div>
        );
      })}
      <div className={styles.centerBox}>
        {targets.length > 0 && (
          <>
            <Word upper="S" lower="haring" phase={phase} index={0} targetPositions={targets} />
            <Word upper="O" lower="ur" phase={phase} index={1} targetPositions={targets} />
            <Word upper="W" lower="ealth" phase={phase} index={2} targetPositions={targets} />
          </>
        )}
      </div>
    </div>
  );
}