'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NEIGHBORHOODS } from '@/lib/neighborhoods'
import RootsAnimation from './RootsAnimation'
import styles from './NeighborhoodPromptModal.module.css'

const DISMISSED_KEY = 'sow_neighborhood_prompt_dismissed'

interface Props {
  hasNeighborhoods: boolean
  onSave: (neighborhoods: string[]) => void
}

export default function NeighborhoodPromptModal({ hasNeighborhoods, onSave }: Props) {
  const [visible, setVisible] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [showAnimation, setShowAnimation] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasNeighborhoods) return
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (!dismissed) setVisible(true)
  }, [hasNeighborhoods])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return NEIGHBORHOODS.slice(0, 12)
    return NEIGHBORHOODS.filter((n: string) => n.toLowerCase().includes(q))
  }, [search])

  const toggle = (n: string) => {
    setSelected(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  }

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  const plant = () => {
    if (selected.length === 0) return
    setShowAnimation(true)
  }

  const handleAnimationComplete = () => {
    onSave(selected)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          {showAnimation ? (
            <div className={styles.animationWrap}>
              <RootsAnimation
                neighborhoods={selected}
                variant="modal"
                context="first-ever"
                onComplete={handleAnimationComplete}
              />
              <motion.button
                className={styles.continueLinkBtn}
                onClick={handleAnimationComplete}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                Continue to the map →
              </motion.button>
            </div>
          ) : (
            <>
              <h2 className={styles.heading}>Where do your roots thrive?</h2>
              <p className={styles.subtext}>
                Choosing a neighborhood helps us show you what's growing nearby.
                You can always change this — roots are meant to spread.
              </p>

              <div className={styles.searchWrap} ref={wrapRef}>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Search neighborhoods…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setDropdownOpen(true) }}
                  onFocus={() => setDropdownOpen(true)}
                  autoComplete="off"
                />
                {dropdownOpen && filtered.length > 0 && (
                  <div className={styles.dropdown}>
                    {filtered.map((n: string) => (
                      <button
                        key={n}
                        type="button"
                        className={`${styles.option} ${selected.includes(n) ? styles.optionSelected : ''}`}
                        onMouseDown={e => { e.preventDefault(); toggle(n) }}
                      >
                        {n}
                        {selected.includes(n) && <span className={styles.check}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selected.length > 0 && (
                <div className={styles.chips}>
                  {selected.map(n => (
                    <span key={n} className={styles.chip}>
                      🌱 {n}
                      <button className={styles.chipRemove} onClick={() => toggle(n)}>×</button>
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.actions}>
                <button
                  className={styles.plantBtn}
                  onClick={plant}
                  disabled={selected.length === 0}
                >
                  Plant my roots
                </button>
                <button className={styles.dismissBtn} onClick={dismiss}>
                  I'll explore first
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
