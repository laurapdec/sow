'use client';
import { motion } from 'framer-motion';

export default function SproutingSeedling() {
  return (
    <motion.svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{ overflow: 'visible' }}
    >
      {/* Stem */}
      <motion.line
        x1="100"
        y1="180"
        x2="100"
        y2="180"
        stroke="#2e7d32"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ y2: 120 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />

      {/* Left Leaf */}
      <motion.path
        d="M100,140 C90,140 85,130 100,125"
        fill="none"
        stroke="#388e3c"
        strokeWidth="3"
        strokeLinecap="round"
        animate={{ d: 'M100,140 C80,140 70,120 100,125' }}
        transition={{ delay: 2, duration: 1.5, ease: 'easeOut' }}
      />

      {/* Right Leaf */}
      <motion.path
        d="M100,140 C110,140 115,130 100,125"
        fill="none"
        stroke="#388e3c"
        strokeWidth="3"
        strokeLinecap="round"
        animate={{ d: 'M100,140 C120,140 130,120 100,125' }}
        transition={{ delay: 2, duration: 1.5, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}
