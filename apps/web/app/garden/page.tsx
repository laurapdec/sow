'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import BottomNav from '@/app/components/BottomNav'
import styles from './garden.module.css'

// ─── Types ────────────────────────────────────────────────────────────────

type OfferingStatus = 'active' | 'paused' | 'fulfilled'

interface MyOffering {
  id: string
  title: string
  category: string
  reachOuts: number
  status: OfferingStatus
  createdAt: Date
  description: string
}

interface MySeeking {
  id: string
  title: string
  category: string
  responses: number
  status: OfferingStatus
  createdAt: Date
  description: string
}

interface Exchange {
  id: string
  type: 'given' | 'received'
  what: string
  withName: string
  withInitial: string
  neighborhood: string
  date: Date
  gratitudeNote?: string
  hasGratitude: boolean
}

interface SavedOffering {
  id: string
  title: string
  offererName: string
  offererInitial: string
  neighborhood: string
  category: string
  savedAt: Date
  isStillActive: boolean
}

// ─── Placeholder data ─────────────────────────────────────────────────────

const MY_OFFERINGS: MyOffering[] = [
  {
    id: 'o1',
    title: 'Sourdough loaves — baked fresh Fridays',
    category: 'Food & nourishment',
    reachOuts: 7,
    status: 'active',
    createdAt: new Date('2026-03-10'),
    description: 'I bake every Friday and usually have 2–3 extra loaves. Come pick up in Bed-Stuy.',
  },
  {
    id: 'o2',
    title: 'CV + cover letter editing',
    category: 'Skills & knowledge',
    reachOuts: 12,
    status: 'active',
    createdAt: new Date('2026-02-18'),
    description: 'Happy to review and give feedback — especially for folks pivoting careers.',
  },
  {
    id: 'o3',
    title: 'Moving boxes (30+)',
    category: 'Material goods',
    reachOuts: 3,
    status: 'fulfilled',
    createdAt: new Date('2026-01-05'),
    description: 'Found a home! Thanks to everyone who reached out.',
  },
]

const MY_SEEKINGS: MySeeking[] = [
  {
    id: 's1',
    title: 'Seeking a short-term sublet in Brooklyn, May–June',
    category: 'Housing & space',
    responses: 4,
    status: 'active',
    createdAt: new Date('2026-03-28'),
    description: 'Looking for something unfurnished or partially furnished, under $1800/mo.',
  },
]

const EXCHANGES: Exchange[] = [
  {
    id: 'e1',
    type: 'given',
    what: 'Sourdough loaf',
    withName: 'Nadia R.',
    withInitial: 'N',
    neighborhood: 'Crown Heights',
    date: new Date('2026-04-05'),
    hasGratitude: true,
    gratitudeNote: 'This was the best bread I\'ve had in years — thank you so much 🌱',
  },
  {
    id: 'e2',
    type: 'received',
    what: 'Tarot reading session',
    withName: 'Simone K.',
    withInitial: 'S',
    neighborhood: 'Bushwick',
    date: new Date('2026-04-01'),
    hasGratitude: false,
  },
  {
    id: 'e3',
    type: 'given',
    what: 'CV editing session',
    withName: 'Tasha O.',
    withInitial: 'T',
    neighborhood: 'Flatbush',
    date: new Date('2026-03-22'),
    hasGratitude: true,
    gratitudeNote: 'Got the job offer 48 hours later. You changed my life a little.',
  },
  {
    id: 'e4',
    type: 'received',
    what: 'Plant cuttings (monstera, pothos)',
    withName: 'Jun H.',
    withInitial: 'J',
    neighborhood: 'Bed-Stuy',
    date: new Date('2026-03-15'),
    hasGratitude: true,
    gratitudeNote: 'They\'re already rooting! Thank you for trusting me with them.',
  },
  {
    id: 'e5',
    type: 'given',
    what: 'Sourdough loaf',
    withName: 'Priya M.',
    withInitial: 'P',
    neighborhood: 'Park Slope',
    date: new Date('2026-03-08'),
    hasGratitude: false,
  },
  {
    id: 'e6',
    type: 'received',
    what: 'Herbal medicine consult',
    withName: 'Liora B.',
    withInitial: 'L',
    neighborhood: 'Fort Greene',
    date: new Date('2026-02-28'),
    hasGratitude: true,
    gratitudeNote: 'The tincture recipe you gave me has become part of my ritual. ✨',
  },
]

const SAVED_OFFERINGS: SavedOffering[] = [
  {
    id: 'sv1',
    title: 'Wheel-thrown ceramic mugs — pick one',
    offererName: 'Kezia A.',
    offererInitial: 'K',
    neighborhood: 'Bushwick',
    category: 'Art & creativity',
    savedAt: new Date('2026-04-02'),
    isStillActive: true,
  },
  {
    id: 'sv2',
    title: 'Traditional Ethiopian cooking lessons',
    offererName: 'Miriam T.',
    offererInitial: 'M',
    neighborhood: 'Crown Heights',
    category: 'Food & nourishment',
    savedAt: new Date('2026-03-30'),
    isStillActive: true,
  },
  {
    id: 'sv3',
    title: 'Free portraits — 35mm film',
    offererName: 'Camille D.',
    offererInitial: 'C',
    neighborhood: 'Williamsburg',
    category: 'Art & creativity',
    savedAt: new Date('2026-03-18'),
    isStillActive: false,
  },
]

// ─── Status badge ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OfferingStatus }) {
  const labels: Record<OfferingStatus, string> = {
    active: 'active',
    paused: 'paused',
    fulfilled: 'fulfilled',
  }
  return (
    <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
      {labels[status]}
    </span>
  )
}

// ─── My Offering card ─────────────────────────────────────────────────────

function MyOfferingCard({
  offering,
  onTogglePause,
}: {
  offering: MyOffering
  onTogglePause: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`${styles.myCard} ${offering.status === 'fulfilled' ? styles.myCardFulfilled : ''}`}
      onClick={() => setExpanded(e => !e)}
    >
      <div className={styles.myCardTop}>
        <div className={styles.myCardMeta}>
          <span className={styles.myCardCategory}>{offering.category}</span>
          <StatusBadge status={offering.status} />
        </div>
        <h3 className={styles.myCardTitle}>{offering.title}</h3>
        <div className={styles.myCardStats}>
          <span className={styles.reachOutCount}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5C4 1.5 1.5 3.7 1.5 6.5C1.5 7.7 2 8.8 2.8 9.7L2 12.5L5 11.8C5.6 12 6.3 12.2 7 12.2C10 12.2 12.5 10 12.5 7.2C12.5 4.4 10 2.2 7 2.2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            {offering.reachOuts} reached out
          </span>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            className={styles.myCardExpanded}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={e => e.stopPropagation()}
          >
            <p className={styles.myCardDesc}>{offering.description}</p>
            {offering.status !== 'fulfilled' && (
              <button
                className={styles.toggleBtn}
                onClick={() => onTogglePause(offering.id)}
              >
                {offering.status === 'active' ? 'Pause offering' : 'Reactivate offering'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── My Seeking card ──────────────────────────────────────────────────────

function MySeekingCard({ seeking }: { seeking: MySeeking }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={styles.myCard} onClick={() => setExpanded(e => !e)}>
      <div className={styles.myCardTop}>
        <div className={styles.myCardMeta}>
          <span className={styles.myCardCategory}>{seeking.category}</span>
          <StatusBadge status={seeking.status} />
        </div>
        <h3 className={styles.myCardTitle}>{seeking.title}</h3>
        <div className={styles.myCardStats}>
          <span className={styles.reachOutCount}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5C4 1.5 1.5 3.7 1.5 6.5C1.5 7.7 2 8.8 2.8 9.7L2 12.5L5 11.8C5.6 12 6.3 12.2 7 12.2C10 12.2 12.5 10 12.5 7.2C12.5 4.4 10 2.2 7 2.2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            {seeking.responses} responded
          </span>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            className={styles.myCardExpanded}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={e => e.stopPropagation()}
          >
            <p className={styles.myCardDesc}>{seeking.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Exchange entry ───────────────────────────────────────────────────────

function ExchangeEntry({ exchange }: { exchange: Exchange }) {
  const [gratitudeOpen, setGratitudeOpen] = useState(false)

  const dateStr = exchange.date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className={styles.exchangeEntry}>
      <div className={`${styles.exchangeDot} ${exchange.type === 'given' ? styles.dotGiven : styles.dotReceived}`} />
      <div className={styles.exchangeBody}>
        <div className={styles.exchangeHeader}>
          <div className={styles.exchangeAvatar}>{exchange.withInitial}</div>
          <div className={styles.exchangeInfo}>
            <span className={styles.exchangeWhat}>{exchange.what}</span>
            <span className={styles.exchangeWith}>
              {exchange.type === 'given' ? 'given to' : 'received from'} {exchange.withName} · {exchange.neighborhood} · {dateStr}
            </span>
          </div>
          <span className={`${styles.exchangeType} ${exchange.type === 'given' ? styles.typeGiven : styles.typeReceived}`}>
            {exchange.type === 'given' ? '↑ gave' : '↓ received'}
          </span>
        </div>
        {exchange.hasGratitude && (
          <button
            className={styles.gratitudeToggle}
            onClick={() => setGratitudeOpen(o => !o)}
          >
            {gratitudeOpen ? 'hide gratitude' : 'read gratitude note'}
          </button>
        )}
        <AnimatePresence>
          {gratitudeOpen && exchange.gratitudeNote && (
            <motion.blockquote
              className={styles.gratitudeQuote}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {'"'}{exchange.gratitudeNote}{'"'}
            </motion.blockquote>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Saved offering card ──────────────────────────────────────────────────

function SavedCard({ offering }: { offering: SavedOffering }) {
  return (
    <div className={`${styles.savedCard} ${!offering.isStillActive ? styles.savedCardInactive : ''}`}>
      <div className={styles.savedCardLeft}>
        <div className={styles.savedAvatar}>{offering.offererInitial}</div>
      </div>
      <div className={styles.savedCardBody}>
        <span className={styles.savedCategory}>{offering.category}</span>
        <h4 className={styles.savedTitle}>{offering.title}</h4>
        <span className={styles.savedMeta}>{offering.offererName} · {offering.neighborhood}</span>
        {!offering.isStillActive && (
          <span className={styles.savedGone}>no longer available</span>
        )}
      </div>
      {offering.isStillActive && (
        <button className={styles.savedReach}>reach out</button>
      )}
    </div>
  )
}

// ─── Reciprocity Portrait SVG ─────────────────────────────────────────────

function ReciprocityPortrait({
  given,
  received,
}: {
  given: number
  received: number
}) {
  const total = given + received
  const givenFrac = total === 0 ? 0.5 : given / total
  const receivedFrac = total === 0 ? 0.5 : received / total

  // Branch heights scale with fraction, 20–80px
  const givenH = 20 + givenFrac * 60
  const receivedH = 20 + receivedFrac * 60

  return (
    <div className={styles.portrait}>
      <svg
        viewBox="0 0 200 120"
        className={styles.portraitSvg}
        fill="none"
      >
        {/* Ground line */}
        <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* Central stem */}
        <motion.path
          d="M100 100 L100 60"
          stroke="#b87333"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />

        {/* Left branch — giving */}
        <motion.path
          d={`M100 ${100 - givenH * 0.3} C90 ${100 - givenH * 0.5} 70 ${100 - givenH * 0.7} 50 ${100 - givenH}`}
          stroke="#c9a84c"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.5 }}
        />
        {/* Left leaf */}
        <motion.ellipse
          cx="47"
          cy={100 - givenH}
          rx="6"
          ry="4"
          fill="#c9a84c"
          opacity="0.6"
          transform={`rotate(-30 47 ${100 - givenH})`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        />

        {/* Right branch — receiving */}
        <motion.path
          d={`M100 ${100 - receivedH * 0.3} C110 ${100 - receivedH * 0.5} 130 ${100 - receivedH * 0.7} 150 ${100 - receivedH}`}
          stroke="#a07850"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.7 }}
        />
        {/* Right leaf */}
        <motion.ellipse
          cx="153"
          cy={100 - receivedH}
          rx="6"
          ry="4"
          fill="#a07850"
          opacity="0.6"
          transform={`rotate(30 153 ${100 - receivedH})`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 0.4, delay: 1.6 }}
        />

        {/* Root tendrils */}
        <motion.path
          d="M100 100 C95 108 85 112 80 118"
          stroke="rgba(184,115,51,0.4)"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        <motion.path
          d="M100 100 C105 110 115 113 120 118"
          stroke="rgba(184,115,51,0.4)"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <motion.path
          d="M100 100 C100 112 100 115 100 120"
          stroke="rgba(184,115,51,0.3)"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        />
      </svg>

      <div className={styles.portraitStats}>
        <div className={styles.portraitStat}>
          <span className={styles.portraitStatNum} style={{ color: '#c9a84c' }}>{given}</span>
          <span className={styles.portraitStatLabel}>given</span>
        </div>
        <div className={styles.portraitDivider} />
        <div className={styles.portraitStat}>
          <span className={styles.portraitStatNum} style={{ color: '#a07850' }}>{received}</span>
          <span className={styles.portraitStatLabel}>received</span>
        </div>
      </div>

      <p className={styles.portraitCaption}>
        {given === 0 && received === 0
          ? 'Your reciprocity story begins with a first exchange.'
          : given > received
          ? 'You give freely. This community is nourished by you.'
          : received > given
          ? 'You\'ve received generously. When you\'re ready, the circle continues.'
          : 'A balanced rhythm — giving and receiving in kind.'}
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function GardenPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [offerings, setOfferings] = useState<MyOffering[]>(MY_OFFERINGS)
  const [activeTab, setActiveTab] = useState<'exchanges' | 'saved'>('exchanges')

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/auth')
      else setAuthChecked(true)
    })
  }, [router])

  function togglePause(id: string) {
    setOfferings(prev =>
      prev.map(o =>
        o.id === id
          ? { ...o, status: o.status === 'active' ? 'paused' : 'active' }
          : o,
      ),
    )
  }

  const givenCount = EXCHANGES.filter(e => e.type === 'given').length
  const receivedCount = EXCHANGES.filter(e => e.type === 'received').length

  if (!authChecked) return null

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Your garden</h1>
        <p className={styles.subtitle}>What you&apos;ve planted, what&apos;s blooming, what you can harvest</p>
      </header>

      <main className={styles.main}>

        {/* ── Section 1: Your active offerings ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Growing</h2>
            <span className={styles.sectionCount}>{offerings.filter(o => o.status === 'active').length} active</span>
          </div>
          <p className={styles.sectionSub}>Your offerings in the community</p>
          <div className={styles.cardList}>
            {offerings.map(o => (
              <MyOfferingCard key={o.id} offering={o} onTogglePause={togglePause} />
            ))}
          </div>
          <button className={styles.addBtn}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add an offering
          </button>
        </section>

        {/* ── Section 2: Active seekings ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Seeking</h2>
            <span className={styles.sectionCount}>{MY_SEEKINGS.filter(s => s.status === 'active').length} active</span>
          </div>
          <p className={styles.sectionSub}>What you&apos;ve asked for from the community</p>
          <div className={styles.cardList}>
            {MY_SEEKINGS.map(s => (
              <MySeekingCard key={s.id} seeking={s} />
            ))}
          </div>
          <button className={styles.addBtn}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Post a seeking
          </button>
        </section>

        {/* ── Section 3 + 4: Exchanges / Saved toggle ── */}
        <section className={styles.section}>
          <div className={styles.tabRow}>
            <button
              className={`${styles.sectionTab} ${activeTab === 'exchanges' ? styles.sectionTabActive : ''}`}
              onClick={() => setActiveTab('exchanges')}
            >
              Seeds sown
            </button>
            <button
              className={`${styles.sectionTab} ${activeTab === 'saved' ? styles.sectionTabActive : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'exchanges' ? (
              <motion.div
                key="exchanges"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <p className={styles.sectionSub} style={{ marginTop: 0, marginBottom: '1.2rem' }}>
                  Every exchange, in order
                </p>
                <div className={styles.timeline}>
                  {EXCHANGES.map(e => (
                    <ExchangeEntry key={e.id} exchange={e} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <p className={styles.sectionSub} style={{ marginTop: 0, marginBottom: '1.2rem' }}>
                  Offerings you&apos;ve bookmarked
                </p>
                <div className={styles.savedList}>
                  {SAVED_OFFERINGS.map(s => (
                    <SavedCard key={s.id} offering={s} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Section 5: Reciprocity portrait ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Reciprocity portrait</h2>
          </div>
          <p className={styles.sectionSub}>
            Not accounting — just a picture of how you move through this community
          </p>
          <ReciprocityPortrait given={givenCount} received={receivedCount} />
        </section>

      </main>

      <BottomNav active="garden" />
    </div>
  )
}
