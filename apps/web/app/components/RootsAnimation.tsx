'use client'

import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getNeighborhoodPosition } from '@/lib/neighborhoods'
import styles from './RootsAnimation.module.css'

export type RootsAnimationVariant = 'full-screen' | 'inline' | 'modal'

export type RootsAnimationContext =
  | 'post-signup'
  | 'first-ever'
  | 'adding'
  | 'profile-visit'

export interface RootsAnimationProps {
  neighborhoods: string[]
  variant: RootsAnimationVariant
  onComplete?: () => void
  existingNeighborhoods?: string[]
  context?: RootsAnimationContext
}

// ── Borough silhouette paths (thin organic outlines, 280×260 viewBox) ────────

const BOROUGH_PATHS = [
  // Manhattan — narrow vertical island
  'M 122 230 C 112 215 108 198 108 180 C 108 160 112 140 116 120 C 118 108 119 95 121 82 C 122 74 124 68 126 68 C 128 68 130 74 131 82 C 132 95 130 108 129 120 C 126 140 126 160 128 180 C 130 198 128 215 122 230',
  // Brooklyn
  'M 122 228 C 115 222 108 222 104 230 C 100 240 104 256 116 264 C 128 272 148 276 166 273 C 184 270 198 260 198 246 C 198 232 186 220 174 217 C 162 214 148 213 138 215 C 128 216 124 222 122 228 Z',
  // Queens
  'M 138 215 C 143 204 152 193 160 182 C 168 171 176 162 185 155 C 194 148 208 143 222 143 C 236 143 248 150 254 162 C 260 174 256 188 244 197 C 232 206 216 212 200 215 C 186 218 174 218 162 216 C 150 214 142 214 138 215 Z',
  // The Bronx
  'M 128 88 C 136 76 150 68 166 63 C 182 58 200 62 214 72 C 228 82 234 98 228 113 C 222 128 206 136 190 138 C 174 140 158 135 146 126 C 134 117 126 103 128 95 Z',
  // Staten Island
  'M 62 248 C 68 234 80 224 95 224 C 110 224 120 236 118 250 C 116 264 103 272 88 274 C 73 276 62 266 62 254 Z',
]

// ── Root path generation ───────────────────────────────────────────────────

function makeRootPaths(x: number, y: number, i: number): string[] {
  const s = (i * 7) % 14 - 7 // variation offset per neighborhood
  return [
    // Main taproot
    `M ${x} ${y+3} C ${x+s-2} ${y+18} ${x+s-8} ${y+34} ${x+s-5} ${y+50} C ${x+s-2} ${y+62} ${x+s+5} ${y+68} ${x+s+2} ${y+78}`,
    // Left lateral
    `M ${x+s-5} ${y+34} C ${x+s-18} ${y+42} ${x+s-28} ${y+40} ${x+s-33} ${y+52}`,
    // Right lateral
    `M ${x+s-5} ${y+34} C ${x+s+8} ${y+46} ${x+s+18} ${y+50} ${x+s+15} ${y+62}`,
  ]
}

function makeSproutPaths(x: number, y: number): { stem: string; lLeaf: string; rLeaf: string } {
  return {
    stem: `M ${x} ${y-3} L ${x} ${y-24}`,
    lLeaf: `M ${x} ${y-15} C ${x-10} ${y-28} ${x-16} ${y-19} ${x-9} ${y-12}`,
    rLeaf: `M ${x} ${y-15} C ${x+10} ${y-28} ${x+16} ${y-19} ${x+9} ${y-12}`,
  }
}

// ── Connection paths between neighborhoods (underground arcs) ─────────────

function makeConnectionPath(
  [x1, y1]: [number, number],
  [x2, y2]: [number, number]
): string {
  const mx = (x1 + x2) / 2
  const my = Math.max(y1, y2) + 42
  return `M ${x1} ${y1+50} C ${x1+10} ${my} ${x2-10} ${my} ${x2} ${y2+50}`
}

// ── Heading text by context ────────────────────────────────────────────────

function getHeading(context: RootsAnimationContext): string {
  switch (context) {
    case 'post-signup':   return 'Your roots are planted'
    case 'first-ever':    return 'Your first roots!'
    case 'adding':        return 'New roots, new ground'
    case 'profile-visit': return 'Your roots run deep'
  }
}

// ── Component ─────────────────────────────────────────────────────────────

export default function RootsAnimation({
  neighborhoods,
  variant,
  onComplete,
  existingNeighborhoods = [],
  context = 'post-signup',
}: RootsAnimationProps) {
  // Compute positions for new neighborhoods
  const newPositions = useMemo(
    () => neighborhoods.map((n, i) => ({ name: n, pos: getNeighborhoodPosition(n, i) })),
    [neighborhoods]
  )
  const existingPositions = useMemo(
    () => existingNeighborhoods.map((n, i) => ({ name: n, pos: getNeighborhoodPosition(n, i + 50) })),
    [existingNeighborhoods]
  )
  const allPositions = [...existingPositions, ...newPositions]

  // Auto-complete for full-screen
  useEffect(() => {
    if (variant !== 'full-screen') return
    const t = setTimeout(() => onComplete?.(), 4200)
    return () => clearTimeout(t)
  }, [variant, onComplete])

  const showHeading = variant === 'full-screen' || context !== 'profile-visit'
  const heading = getHeading(context)

  const svg = (
    <svg
      viewBox="0 0 280 260"
      className={styles.svg}
      aria-hidden="true"
    >
      {/* Borough outlines */}
      {BOROUGH_PATHS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="rgba(184,115,51,0.22)"
          strokeWidth={0.65}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeInOut' }}
        />
      ))}

      {/* Existing neighborhood roots (faint, pre-drawn) */}
      {existingPositions.map(({ pos }, i) => {
        const paths = makeRootPaths(pos[0], pos[1], i)
        return paths.map((d, pi) => (
          <motion.path
            key={`er-${i}-${pi}`}
            d={d}
            fill="none"
            stroke="rgba(184,115,51,0.25)"
            strokeWidth={0.7}
            strokeLinecap="round"
            initial={{ pathLength: 1 }}
            animate={{ pathLength: 1 }}
          />
        ))
      })}

      {/* Underground connections between all neighborhoods */}
      {allPositions.length > 1 && allPositions.slice(0, -1).map((a, i) =>
        allPositions.slice(i + 1).map((b, j) => (
          <motion.path
            key={`conn-${i}-${j}`}
            d={makeConnectionPath(a.pos, b.pos)}
            fill="none"
            stroke="rgba(184,115,51,0.35)"
            strokeWidth={0.8}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 1.2, ease: 'easeInOut' }}
          />
        ))
      )}

      {/* New neighborhood seeds + roots + sprouts */}
      {newPositions.map(({ pos }, i) => {
        const [x, y] = pos
        const rootPaths = makeRootPaths(x, y, i)
        const { stem, lLeaf, rLeaf } = makeSproutPaths(x, y)
        const rootDelay = 0.9 + i * 0.15
        const sproutDelay = rootDelay + 1.3

        return (
          <g key={`n-${i}`}>
            {/* Seed glow */}
            <motion.circle
              cx={x} cy={y} r={8}
              fill="rgba(201,168,76,0.18)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.1, ease: 'backOut' }}
            />
            {/* Seed */}
            <motion.circle
              cx={x} cy={y} r={3.5}
              fill="#b87333"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.72 + i * 0.1, ease: 'backOut' }}
            />
            {/* Roots */}
            {rootPaths.map((d, pi) => (
              <motion.path
                key={pi}
                d={d}
                fill="none"
                stroke={pi === 0 ? '#b87333' : 'rgba(184,115,51,0.65)'}
                strokeWidth={pi === 0 ? 0.9 : 0.6}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: pi === 0 ? 1.4 : 0.9, delay: rootDelay + pi * 0.2, ease: 'easeInOut' }}
              />
            ))}
            {/* Stem */}
            <motion.path
              d={stem}
              fill="none"
              stroke="#6d8a5a"
              strokeWidth={1.1}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, delay: sproutDelay, ease: 'easeOut' }}
            />
            {/* Left leaf */}
            <motion.path
              d={lLeaf}
              fill="rgba(109,138,90,0.45)"
              stroke="#6d8a5a"
              strokeWidth={0.7}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: sproutDelay + 0.45, ease: 'easeOut' }}
            />
            {/* Right leaf */}
            <motion.path
              d={rLeaf}
              fill="rgba(109,138,90,0.45)"
              stroke="#6d8a5a"
              strokeWidth={0.7}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: sproutDelay + 0.65, ease: 'easeOut' }}
            />
          </g>
        )
      })}
    </svg>
  )

  const inner = (
    <div className={styles.inner}>
      {svg}
      {showHeading && (
        <motion.p
          className={styles.heading}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 3.0 }}
        >
          {heading}
        </motion.p>
      )}
    </div>
  )

  if (variant === 'full-screen') {
    return (
      <motion.div
        className={styles.fullScreen}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {inner}
      </motion.div>
    )
  }

  if (variant === 'inline') {
    return <div className={styles.inlineWrap}>{inner}</div>
  }

  // modal variant: just the inner content, container handled by parent
  return <div className={styles.modalWrap}>{inner}</div>
}
