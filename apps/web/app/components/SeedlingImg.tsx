'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  id: number;
  className?: string;
  style?: React.CSSProperties;
  startAfter: number;
};

export default function SeedlingImg({ id, className, style, startAfter }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  // Stop between 85–100% through the animation so they're all nearly fully grown but slightly varied
  const stopAt = useMemo(() => 0.85 + Math.random() * 0.15, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), startAfter);
    return () => clearTimeout(t);
  }, [startAfter]);

  useEffect(() => {
    if (!visible) return;
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      video.currentTime = 0;
      video.play();

      // Stop at stopAt% through the duration
      const checkTime = () => {
        if (video.currentTime >= video.duration * stopAt) {
          video.pause();
        }
      };
      video.addEventListener('timeupdate', checkTime);
      return () => video.removeEventListener('timeupdate', checkTime);
    };

    if (video.readyState >= 1) {
      onLoaded();
    } else {
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
    }
  }, [visible, stopAt]);

  if (!visible) return null;

  return (
    <video
      ref={videoRef}
      src={`/seedling.webm?v=${id}`}
      className={className}
      style={style}
      muted
      playsInline
      loop={false}
      preload="auto"
    />
  );
}
