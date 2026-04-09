'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import BottomNav from '@/app/components/BottomNav'
import styles from './events.module.css'

// ─── Types ────────────────────────────────────────────────────────────────

type EventType =
  | 'community-meal' | 'workshop' | 'skill-share' | 'movement'
  | 'healing' | 'book-club' | 'volunteer' | 'social'
  | 'market' | 'music' | 'other'

type PriceType = 'free' | 'pwyw' | 'community' | 'sliding'
type Visibility = 'all' | 'kindred' | 'invitation'

interface GatheringEvent {
  id: string
  name: string
  type: EventType
  convener: string
  convenerInitial: string
  convenerBio?: string
  convenerTags?: string[]
  neighborhood: string
  venue: string
  date: Date
  endDate: Date
  recurring?: string
  price: PriceType
  priceMin?: number
  priceMax?: number
  priceNote?: string
  hardshipWaiver?: boolean
  description: string
  whatToBring?: string
  accessibilityTags?: string[]
  capacity?: number
  gathererCount: number
  kindredAttending?: Array<{ name: string; initial: string }>
  isConvenedByMe?: boolean
  isFull?: boolean
}

interface NewGathering {
  type: EventType | null
  name: string
  description: string
  whatToBring: string
  accessibility: string[]
  date: string
  startTime: string
  endTime: string
  recurring: string | null
  locationType: 'sow' | 'other' | 'virtual'
  venue: string
  address: string
  neighborhood: string
  capacity: string
  visibility: Visibility
  price: PriceType
  priceMin: string
  priceMax: string
  priceAmount: string
  priceNote: string
  hardshipWaiver: boolean
  paymentMethod: string
}

// ─── Config ───────────────────────────────────────────────────────────────

const EVENT_TYPES: { value: EventType; label: string; icon: string }[] = [
  { value: 'workshop',       label: 'Workshop',          icon: '🌿' },
  { value: 'skill-share',    label: 'Skill-share',       icon: '🧵' },
  { value: 'community-meal', label: 'Community meal',    icon: '🍲' },
  { value: 'movement',       label: 'Movement & dance',  icon: '🌊' },
  { value: 'healing',        label: 'Healing & wellness',icon: '🌙' },
  { value: 'book-club',      label: 'Book club',         icon: '📚' },
  { value: 'volunteer',      label: 'Volunteer',         icon: '🤝' },
  { value: 'social',         label: 'Social',            icon: '✨' },
  { value: 'market',         label: 'Market / popup',    icon: '🌸' },
  { value: 'music',          label: 'Music',             icon: '🎶' },
  { value: 'other',          label: 'Other',             icon: '🌱' },
]

const FILTER_LABELS: Record<EventType | 'all', string> = {
  all: 'All', workshop: 'Workshops', 'skill-share': 'Skill-shares',
  'community-meal': 'Community meals', movement: 'Movement & dance',
  healing: 'Healing & wellness', 'book-club': 'Book clubs',
  volunteer: 'Volunteer', social: 'Social', market: 'Markets',
  music: 'Music', other: 'Other',
}

const ACCESS_TAGS = [
  'Wheelchair accessible', 'ASL interpreted', 'Fragrance-free',
  'Children welcome', 'Sober space', 'Other',
]

const TYPE_HERO_COLORS: Record<EventType, string> = {
  'community-meal': 'rgba(155, 80, 30, 0.6)',
  workshop:         'rgba(90, 120, 70, 0.5)',
  'skill-share':    'rgba(130, 90, 60, 0.5)',
  movement:         'rgba(60, 100, 130, 0.5)',
  healing:          'rgba(90, 70, 120, 0.5)',
  'book-club':      'rgba(110, 75, 40, 0.55)',
  volunteer:        'rgba(70, 110, 70, 0.5)',
  social:           'rgba(155, 110, 40, 0.5)',
  market:           'rgba(150, 85, 70, 0.5)',
  music:            'rgba(80, 80, 120, 0.5)',
  other:            'rgba(128, 47, 31, 0.5)',
}

// ─── Dates ────────────────────────────────────────────────────────────────

function d(year: number, month: number, day: number, h = 0, m = 0) {
  return new Date(year, month - 1, day, h, m)
}

// ─── Placeholder events ───────────────────────────────────────────────────

const EVENTS: GatheringEvent[] = [
  {
    id: 'e1', name: 'Jollof & Joy Community Dinner',
    type: 'community-meal', convener: "Iya's Kitchen", convenerInitial: 'IK',
    convenerBio: 'Iya means mother in Yoruba. Every dish is a hug from home.',
    convenerTags: ['Black-owned', 'Women-owned'],
    neighborhood: 'Bed-Stuy', venue: "Iya's Kitchen",
    date: d(2026, 4, 12, 18), endDate: d(2026, 4, 12, 21),
    price: 'free',
    description: 'Come eat, come laugh, come be held. Iya cooks enough for the whole block.\n\nThis is a monthly gathering that started in Iya\'s living room and has grown into something the whole neighborhood shows up for. No agenda. Just good food, good people, and the particular magic that happens when strangers become kindred over a shared pot.',
    gathererCount: 28,
    kindredAttending: [{ name: 'Luz', initial: 'L' }, { name: 'Fatou', initial: 'F' }],
  },
  {
    id: 'e2', name: 'Moving Through Grief Dance Workshop',
    type: 'movement', convener: 'Root & Ritual', convenerInitial: 'RR',
    convenerBio: 'Healing is remembering what your body already knows.',
    convenerTags: ['Queer-owned', 'Black-owned'],
    neighborhood: 'Crown Heights', venue: 'Root & Ritual',
    date: d(2026, 4, 13, 11), endDate: d(2026, 4, 13, 13),
    price: 'sliding', priceMin: 10, priceMax: 25,
    hardshipWaiver: true,
    description: 'Your body remembers what your mind forgets. Let\'s move through it together.\n\nThis workshop is not a dance class. There\'s no choreography, no right way to move. We\'ll be guided through somatic exercises and free movement as a way of processing grief — in all its forms. Loss of a person, a relationship, a version of yourself.',
    whatToBring: 'Comfortable clothes you can move in. Water. Tissues if you need them.',
    accessibilityTags: ['Wheelchair accessible', 'Fragrance-free'],
    capacity: 15, gathererCount: 11,
  },
  {
    id: 'e3', name: 'Seed Library Swap',
    type: 'social', convener: 'Lavender & Thyme', convenerInitial: 'LT',
    convenerBio: 'We believe every living thing deserves tenderness.',
    convenerTags: ['Queer-owned', 'Women-owned'],
    neighborhood: 'West Village', venue: 'Lavender & Thyme',
    date: d(2026, 4, 12, 10), endDate: d(2026, 4, 12, 12),
    price: 'free',
    description: 'Bring seeds, take seeds. Bring stories, take stories.\n\nOur monthly seed swap is an excuse to gather, trade cuttings, and talk about what we\'re growing — in our gardens and in our lives. Seeds will be organized by type. Bring extras of anything you have too much of.',
    accessibilityTags: ['Children welcome'],
    gathererCount: 9,
  },
  {
    id: 'e4', name: 'Bread of Home Baking Workshop',
    type: 'workshop', convener: 'Manos del Pueblo', convenerInitial: 'MP',
    convenerBio: 'Four women from Puebla, baking the bread of home.',
    convenerTags: ['Immigrant-owned', 'Cooperative'],
    neighborhood: 'Jackson Heights', venue: 'Manos del Pueblo',
    date: d(2026, 4, 20, 14), endDate: d(2026, 4, 20, 17),
    price: 'community', priceMin: 15,
    priceNote: 'Covers materials and space rental',
    description: 'Learn to make pan de yema the way our grandmothers did. Flour will get everywhere. That\'s the point.\n\nPan de yema is an egg-yolk bread from Oaxaca — golden, slightly sweet, with a crust that shatters at first bite. We\'ll make it together from scratch. Every person leaves with their own loaf.',
    whatToBring: 'An apron. A good mood. Maybe a container to bring your bread home in.',
    capacity: 12, gathererCount: 8,
  },
  {
    id: 'e5', name: 'Baldwin at Dusk Reading Circle',
    type: 'book-club', convener: 'Sister Circle Books', convenerInitial: 'SC',
    convenerBio: 'Every shelf is a conversation waiting to happen.',
    convenerTags: ['Women-owned', 'Black-owned'],
    neighborhood: 'Fort Greene', venue: 'Sister Circle Books',
    date: d(2026, 4, 10, 19), endDate: d(2026, 4, 10, 20, 30),
    recurring: 'Every Thursday',
    price: 'free',
    description: 'This month: Giovanni\'s Room. Bring your annotations and your feelings.\n\nOur Thursday reading circle has been meeting for three years. We move slowly through books, we argue, we cry sometimes. New members always welcome — come for one session or stay forever.',
    capacity: 20, gathererCount: 14,
    kindredAttending: [{ name: 'Priya', initial: 'P' }],
  },
  {
    id: 'e6', name: 'Mending Circle — Drop-in Repair Cafe',
    type: 'skill-share', convener: 'The Copper Needle', convenerInitial: 'CN',
    convenerBio: 'Three generations of stitching stories into fabric.',
    convenerTags: ['Women-owned'],
    neighborhood: 'Harlem', venue: 'The Copper Needle',
    date: d(2026, 4, 19, 13), endDate: d(2026, 4, 19, 16),
    price: 'pwyw',
    description: 'Bring something torn, leave with something whole. We\'ll teach you to stitch.\n\nThis is a drop-in gathering — come whenever, leave whenever. Bring clothes, bags, anything with fabric that needs attention. Our team will sit with you and teach you basic mending. You do the work. We\'re just here to guide.',
    accessibilityTags: ['Children welcome'],
    gathererCount: 22,
  },
  {
    id: 'e7', name: 'Full Moon Sound Bath',
    type: 'healing', convener: 'Root & Ritual', convenerInitial: 'RR',
    convenerBio: 'Healing is remembering what your body already knows.',
    convenerTags: ['Queer-owned', 'Black-owned'],
    neighborhood: 'Crown Heights', venue: 'Root & Ritual',
    date: d(2026, 4, 14, 20), endDate: d(2026, 4, 14, 21, 30),
    price: 'sliding', priceMin: 15, priceMax: 35,
    hardshipWaiver: true,
    priceNote: 'No one turned away for lack of funds',
    description: 'Singing bowls, breathwork, and stillness under tonight\'s moon.\n\nWe hold a sound bath on or near each full moon. Bring a yoga mat or blanket and lie down for 90 minutes of sound healing. No experience needed. Just bring your body.',
    accessibilityTags: ['Fragrance-free', 'Sober space'],
    capacity: 10, gathererCount: 10,
  },
  {
    id: 'e8', name: 'Spring Mercadito',
    type: 'market', convener: 'Sol y Luna + community vendors', convenerInitial: 'SL',
    convenerBio: "Coffee from our grandmother's mountain, brewed with love.",
    convenerTags: ['Immigrant-owned', 'Women-owned'],
    neighborhood: 'Bushwick', venue: 'Sol y Luna',
    date: d(2026, 4, 26, 11), endDate: d(2026, 4, 26, 17),
    price: 'free',
    description: 'Handmade goods, street food, live music, and community. Bring your neighbor.\n\nOur spring mercadito brings together 20+ vendors from across Brooklyn and Queens — ceramics, textiles, food, plants, and more. Sol y Luna will have coffee and pan dulce. Live music from 1–4 PM.',
    gathererCount: 45,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function fmtDateLong(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function sameWeek(a: Date, today: Date) {
  const end = new Date(today); end.setDate(today.getDate() + 7)
  return a >= today && a <= end
}

function priceSummary(ev: GatheringEvent): string {
  switch (ev.price) {
    case 'free':      return 'Free'
    case 'pwyw':      return 'Pay what you can'
    case 'community': return `Community price: $${ev.priceMin}`
    case 'sliding':   return `Sliding scale: $${ev.priceMin}–$${ev.priceMax}`
  }
}

function priceClass(ev: GatheringEvent, s: typeof styles) {
  if (ev.price === 'free') return `${s.priceTag} ${s.priceFree}`
  if (ev.isFull ?? ev.gathererCount >= (ev.capacity ?? Infinity)) return `${s.priceTag} ${s.priceFull}`
  return s.priceTag
}

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ─── Small shared components ───────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
      onClick={onToggle}
      type="button"
      aria-pressed={on}
    >
      <div className={`${styles.toggleKnob} ${on ? styles.toggleKnobOn : ''}`} />
    </button>
  )
}

function TypePill({ type }: { type: EventType }) {
  const cfg = EVENT_TYPES.find(t => t.value === type)
  return <span className={styles.typePill}>{cfg?.icon} {cfg?.label ?? type}</span>
}

function PriceDisplay({ ev, large = false }: { ev: GatheringEvent; large?: boolean }) {
  const isFull = ev.isFull ?? (ev.capacity !== undefined && ev.gathererCount >= ev.capacity)
  if (large) {
    return (
      <div>
        {ev.price === 'free' && <p className={styles.priceLarge} style={{ color: 'rgba(109,138,90,0.9)' }}>Free</p>}
        {ev.price === 'pwyw' && (
          <>
            <p className={styles.priceLarge}>Pay what you can</p>
            {ev.priceMin && <p className={styles.priceNote}>Suggested: ${ev.priceMin}</p>}
          </>
        )}
        {ev.price === 'community' && (
          <>
            <p className={styles.priceLarge}>Community price: ${ev.priceMin}</p>
            {ev.priceNote && <p className={styles.priceNote}>{ev.priceNote}</p>}
          </>
        )}
        {ev.price === 'sliding' && (
          <>
            <p className={styles.priceLarge}>Sliding scale: ${ev.priceMin}–${ev.priceMax}</p>
            {ev.priceNote && <p className={styles.priceNote}>{ev.priceNote}</p>}
          </>
        )}
        {ev.hardshipWaiver && (
          <p className={styles.hardshipNote}>Can't pay? That's okay — just show up.</p>
        )}
        {ev.capacity && (
          <div className={styles.capacityRow}>
            <div className={styles.capacityBar}>
              <div
                className={styles.capacityFill}
                style={{ width: `${Math.min(100, (ev.gathererCount / ev.capacity) * 100)}%` }}
              />
            </div>
            <span className={styles.capacityText}>
              {isFull
                ? <span className={styles.fullLabel}>This gathering is full</span>
                : `${ev.capacity} spots · ${ev.gathererCount} gatherers`
              }
            </span>
          </div>
        )}
        {!ev.capacity && (
          <p className={styles.priceNote} style={{ marginTop: 8 }}>
            Open gathering — {ev.gathererCount} gatherers so far
          </p>
        )}
      </div>
    )
  }
  return (
    <span className={priceClass(ev, styles)}>
      {isFull ? 'This gathering is full' : priceSummary(ev)}
    </span>
  )
}

// ─── Event card ───────────────────────────────────────────────────────────

function EventCard({ ev, onClick }: { ev: GatheringEvent; onClick: () => void }) {
  const isFull = ev.isFull ?? (ev.capacity !== undefined && ev.gathererCount >= ev.capacity)
  return (
    <motion.div
      className={styles.eventCard}
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      layout
    >
      {/* Date badge */}
      <div className={styles.dateBadge}>
        <span className={styles.badgeDow}>{DOW[ev.date.getDay()]}</span>
        <span className={styles.badgeNum}>{ev.date.getDate()}</span>
        <span className={styles.badgeMon}>{MON[ev.date.getMonth()]}</span>
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <p className={styles.cardName}>{ev.name}</p>
        <p className={styles.cardConvener}>Convened by {ev.convener}</p>
        <div className={styles.cardMeta}>
          <span className={styles.cardMetaText}>{fmtTime(ev.date)} – {fmtTime(ev.endDate)}</span>
          <span className={styles.cardMetaDot}>·</span>
          <span className={styles.locationPill}>{ev.neighborhood} · {ev.venue}</span>
          {ev.recurring && <span className={styles.recurringBadge}>↻ {ev.recurring}</span>}
          <TypePill type={ev.type} />
        </div>

        <div className={styles.cardBottom}>
          <PriceDisplay ev={ev} />
          <span className={styles.cardMetaDot}>·</span>
          <span className={styles.gathererCount}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="5" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 10.5C1 8.6 2.8 7 5 7C7.2 7 9 8.6 9 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="9" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
              <path d="M9 6.5C10.5 6.5 11.5 7.7 11.5 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            {isFull ? 'Full' : `${ev.gathererCount} gatherers`}
          </span>

          {ev.kindredAttending && ev.kindredAttending.length > 0 && (
            <span className={styles.kindredNote}>
              <span className={styles.kindredAvatarStack}>
                {ev.kindredAttending.slice(0, 3).map((k, i) => (
                  <span key={i} className={styles.kindredAvatarTiny}>{k.initial}</span>
                ))}
              </span>
              {ev.kindredAttending.map(k => k.name).join(', ')}
              {ev.kindredAttending.length > 1 ? ' are going' : ' is going'}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Event detail overlay ─────────────────────────────────────────────────

function EventDetail({
  ev,
  joined,
  reminded,
  onJoin,
  onStepBack,
  onToggleRemind,
  onClose,
}: {
  ev: GatheringEvent
  joined: boolean
  reminded: boolean
  onJoin: () => void
  onStepBack: () => void
  onToggleRemind: () => void
  onClose: () => void
}) {
  const [descExpanded, setDescExpanded] = useState(false)
  const isFull = ev.isFull ?? (ev.capacity !== undefined && ev.gathererCount >= ev.capacity)
  const descLines = ev.description.split('\n')
  const descShort = descLines[0]
  const heroColor = TYPE_HERO_COLORS[ev.type]

  return (
    <motion.div
      className={styles.detailOverlay}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
    >
      {/* Hero */}
      <div className={styles.detailHero} style={{ background: heroColor }}>
        <div className={styles.detailTopBar}>
          <button className={styles.detailTopBtn} onClick={onClose}>←</button>
          <button className={styles.detailTopBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 2L6 9M13 2H9M13 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 3H3C2.4 3 2 3.4 2 4V13C2 13.6 2.4 14 3 14H12C12.6 14 13 13.6 13 13V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <span className={styles.detailHeroIcon}>
          {EVENT_TYPES.find(t => t.value === ev.type)?.icon ?? '🌱'}
        </span>
        <div className={styles.detailHeroGradient} />
      </div>

      {/* Body */}
      <div className={styles.detailBody}>
        <TypePill type={ev.type} />
        {ev.recurring && (
          <span className={styles.recurringBadge} style={{ marginLeft: 6 }}>↻ {ev.recurring}</span>
        )}
        <h1 className={styles.detailName}>{ev.name}</h1>

        <div className={styles.detailMetaRow}>
          <span className={styles.detailMetaText}>
            {fmtDateLong(ev.date)} · {fmtTime(ev.date)} – {fmtTime(ev.endDate)}
          </span>
        </div>
        <div className={styles.detailMetaRow} style={{ marginBottom: 16 }}>
          <span className={styles.locationPill}>📍 {ev.neighborhood} · {ev.venue}</span>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(184,115,51,0.65)', fontSize: '0.75rem', padding: 0, fontFamily: 'inherit' }}
          >
            View on map →
          </button>
        </div>

        {/* Convener */}
        <div className={styles.detailCard}>
          <p className={styles.detailCardLabel}>Convened by</p>
          <div className={styles.convenerRow}>
            <div className={styles.convenerAvatar}>{ev.convenerInitial}</div>
            <div style={{ flex: 1 }}>
              <p className={styles.convenerName}>{ev.convener}</p>
              {ev.convenerBio && <p className={styles.convenerBio}>{ev.convenerBio}</p>}
            </div>
          </div>
          {ev.convenerTags && ev.convenerTags.length > 0 && (
            <div className={styles.convenerTagRow}>
              {ev.convenerTags.map(t => (
                <span key={t} className={styles.convenerTag}>{t}</span>
              ))}
              <span className={styles.onMapNote}>🗺 On the Sow map →</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className={styles.detailCard}>
          <p className={styles.detailCardLabel}>About this gathering</p>
          <p className={styles.detailDesc}>
            {descExpanded ? ev.description : descShort}
          </p>
          {descLines.length > 1 && (
            <button className={styles.readMoreBtn} onClick={() => setDescExpanded(v => !v)}>
              {descExpanded ? 'Show less' : 'Read more →'}
            </button>
          )}
        </div>

        {/* What to bring */}
        {(ev.whatToBring || ev.accessibilityTags?.length) && (
          <div className={styles.detailCard}>
            <p className={styles.detailCardLabel}>What to know</p>
            {ev.whatToBring && (
              <p className={styles.detailDesc} style={{ marginBottom: ev.accessibilityTags?.length ? 10 : 0 }}>
                🌿 {ev.whatToBring}
              </p>
            )}
            {ev.accessibilityTags && ev.accessibilityTags.length > 0 && (
              <div className={styles.whatToKnowList}>
                {ev.accessibilityTags.map(t => (
                  <span key={t} className={styles.accessTag}>{t}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price + capacity */}
        <div className={styles.detailCard}>
          <p className={styles.detailCardLabel}>Gathering details</p>
          <PriceDisplay ev={ev} large />
        </div>

        {/* Kindred attending */}
        {ev.kindredAttending && ev.kindredAttending.length > 0 && (
          <div className={styles.detailCard}>
            <p className={styles.detailCardLabel}>From your kindred</p>
            <div className={styles.kindredAttendingRow}>
              {ev.kindredAttending.map((k, i) => (
                <div key={i} className={styles.kindredAttendee}>
                  <div className={styles.kindredAtAvatar}>{k.initial}</div>
                  <span>{k.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remind me */}
        <div className={styles.detailCard}>
          <div className={styles.remindRow}>
            <div>
              <span className={styles.remindLabel}>
                🔔 Remind me
              </span>
              {reminded && <p className={styles.remindNote}>We'll nudge you the day before</p>}
            </div>
            <Toggle on={reminded} onToggle={onToggleRemind} />
          </div>
        </div>

        {/* Convener tools */}
        {ev.isConvenedByMe && (
          <div className={styles.detailCard}>
            <p className={styles.detailCardLabel}>Convener tools</p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,220,170,0.7)', marginBottom: 10 }}>
              {ev.gathererCount} gatherers have joined
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(184,115,51,0.38)', background: 'transparent', color: 'rgba(255,220,170,0.7)', fontFamily: 'inherit', fontSize: '0.82rem', cursor: 'pointer' }}>
                Edit gathering
              </button>
              <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(184,115,51,0.28)', background: 'transparent', color: 'rgba(255,220,170,0.5)', fontFamily: 'inherit', fontSize: '0.82rem', cursor: 'pointer' }}>
                Send a note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky RSVP bar */}
      <div className={styles.rsvpBar}>
        {joined ? (
          <>
            <div className={styles.rsvpJoinedBtn}>
              <span style={{ fontSize: '1.1rem' }}>🌱</span> You're going
            </div>
            <button className={styles.stepBackBtn} onClick={onStepBack}>
              Step back from this gathering
            </button>
          </>
        ) : isFull ? (
          <div className={styles.rsvpFullBtn}>This gathering is full — but more are always growing</div>
        ) : (
          <button className={styles.rsvpJoinBtn} onClick={onJoin}>
            {ev.price === 'free' ? "I'll be there" : 'Join this gathering'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Confirmation overlay ─────────────────────────────────────────────────

function ConfirmationOverlay({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      className={styles.confirmOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      <motion.div
        className={styles.confirmCard}
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <motion.span
          className={styles.confirmSprout}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.1 }}
        >
          🌱
        </motion.span>
        <h2 className={styles.confirmTitle}>You're planted</h2>
        <p className={styles.confirmSub}>
          We'll see you there. The gathering grows with you in it.
        </p>
        <div className={styles.confirmActions}>
          <button className={styles.confirmActionBtn}>Add to calendar</button>
          <button className={styles.confirmActionBtn}>Share</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Plant a gathering flow ───────────────────────────────────────────────

const INITIAL_GATHERING: NewGathering = {
  type: null, name: '', description: '', whatToBring: '',
  accessibility: [], date: '', startTime: '', endTime: '',
  recurring: null, locationType: 'other', venue: '', address: '', neighborhood: '',
  capacity: '', visibility: 'all',
  price: 'free', priceMin: '', priceMax: '', priceAmount: '', priceNote: '',
  hardshipWaiver: false, paymentMethod: '',
}

function PlantGathering({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [g, setG] = useState<NewGathering>(INITIAL_GATHERING)
  const [planted, setPlanted] = useState(false)
  const totalSteps = 6

  const set = (patch: Partial<NewGathering>) => setG(prev => ({ ...prev, ...patch }))

  const canContinue = useMemo(() => {
    if (step === 1) return g.type !== null
    if (step === 2) return g.name.trim().length > 0
    if (step === 3) return g.date.length > 0 && g.startTime.length > 0
    return true
  }, [step, g])

  const handlePlant = () => {
    setPlanted(true)
    setTimeout(onClose, 2500)
  }

  const stepContent = () => {
    switch (step) {
      case 1: return (
        <>
          <h2 className={styles.stepHeading}>What are you planting?</h2>
          <p className={styles.stepSubtext}>Choose the spirit of your gathering</p>
          <div className={styles.typeGrid}>
            {EVENT_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                className={`${styles.typeCard} ${g.type === t.value ? styles.typeCardActive : ''}`}
                onClick={() => set({ type: t.value })}
              >
                <span className={styles.typeCardIcon}>{t.icon}</span>
                <span className={`${styles.typeCardLabel} ${g.type === t.value ? styles.typeCardLabelActive : ''}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )

      case 2: return (
        <>
          <h2 className={styles.stepHeading}>Tell us about it</h2>
          <p className={styles.stepSubtext}>Help people understand what they're being invited into</p>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Gathering name</label>
            <input
              className={styles.formInput}
              placeholder="Give your gathering a name"
              value={g.name}
              onChange={e => set({ name: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea
              className={styles.formTextarea}
              rows={5}
              placeholder="What should people know? What will you do together? What's the spirit of this gathering?"
              value={g.description}
              onChange={e => set({ description: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Cover image (optional)</label>
            <div className={styles.imageUpload}>
              <span style={{ fontSize: '1.5rem' }}>🌿</span>
              <span>Add a cover image</span>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>What to bring / What to know (optional)</label>
            <textarea
              className={styles.formTextarea}
              rows={2}
              placeholder="Anything gatherers should bring or be aware of?"
              value={g.whatToBring}
              onChange={e => set({ whatToBring: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Accessibility</label>
            <div className={styles.accessTagChips}>
              {ACCESS_TAGS.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.accessTagChip} ${g.accessibility.includes(t) ? styles.accessTagChipActive : ''}`}
                  onClick={() => set({
                    accessibility: g.accessibility.includes(t)
                      ? g.accessibility.filter(x => x !== t)
                      : [...g.accessibility, t]
                  })}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </>
      )

      case 3: return (
        <>
          <h2 className={styles.stepHeading}>When and where?</h2>
          <p className={styles.stepSubtext}>Ground the gathering in time and place</p>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Date</label>
              <input type="date" className={styles.formInput} value={g.date} onChange={e => set({ date: e.target.value })} />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Start time</label>
              <input type="time" className={styles.formInput} value={g.startTime} onChange={e => set({ startTime: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>End time</label>
              <input type="time" className={styles.formInput} value={g.endTime} onChange={e => set({ endTime: e.target.value })} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Does this gathering repeat?</span>
              <Toggle on={g.recurring !== null} onToggle={() => set({ recurring: g.recurring === null ? 'weekly' : null })} />
            </div>
            {g.recurring !== null && (
              <select
                className={styles.formInput}
                value={g.recurring}
                onChange={e => set({ recurring: e.target.value })}
                style={{ marginTop: 8 }}
              >
                <option value="weekly">Every week</option>
                <option value="biweekly">Every two weeks</option>
                <option value="monthly">Every month</option>
              </select>
            )}
          </div>
          <div className={styles.formCard}>
            <p className={styles.formCardTitle}>Location</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {(['sow', 'other', 'virtual'] as const).map(lt => (
                <button
                  key={lt}
                  type="button"
                  onClick={() => set({ locationType: lt })}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 10, border: '1px solid',
                    borderColor: g.locationType === lt ? '#c9a84c' : 'rgba(184,115,51,0.25)',
                    background: g.locationType === lt ? 'rgba(201,168,76,0.14)' : 'transparent',
                    color: g.locationType === lt ? 'rgba(255,240,210,0.95)' : 'rgba(255,220,170,0.5)',
                    fontFamily: 'inherit', fontSize: '0.75rem', cursor: 'pointer',
                  }}
                >
                  {lt === 'sow' ? 'On Sow map' : lt === 'virtual' ? 'Virtual' : 'Other address'}
                </button>
              ))}
            </div>
            {g.locationType !== 'virtual' && (
              <>
                <div className={styles.formGroup}>
                  <input className={styles.formInput} placeholder="Venue name" value={g.venue} onChange={e => set({ venue: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <input className={styles.formInput} placeholder="Neighborhood" value={g.neighborhood} onChange={e => set({ neighborhood: e.target.value })} style={{ marginTop: 8 }} />
                </div>
              </>
            )}
            {g.locationType === 'virtual' && (
              <input className={styles.formInput} placeholder="Meeting link" value={g.address} onChange={e => set({ address: e.target.value })} />
            )}
          </div>
        </>
      )

      case 4: return (
        <>
          <h2 className={styles.stepHeading}>Who's invited?</h2>
          <p className={styles.stepSubtext}>Set the gathering's shape and visibility</p>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Gathering size</label>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>No limit — open gathering</span>
              <Toggle on={g.capacity === ''} onToggle={() => set({ capacity: g.capacity === '' ? '20' : '' })} />
            </div>
            {g.capacity !== '' && (
              <input
                type="number"
                className={styles.formInput}
                placeholder="How many gatherers can join?"
                value={g.capacity}
                onChange={e => set({ capacity: e.target.value })}
                style={{ marginTop: 8 }}
              />
            )}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Visibility</label>
            <div className={styles.visibilityOptions}>
              {([
                { v: 'all' as Visibility, label: 'Everyone on Sow', sub: 'Any member can see and join this gathering' },
                { v: 'kindred' as Visibility, label: 'Your kindred only', sub: 'Only people in your kindred will see this gathering' },
                { v: 'invitation' as Visibility, label: 'By invitation', sub: 'You choose who to invite from your kindred' },
              ]).map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  className={`${styles.visibilityBtn} ${g.visibility === opt.v ? styles.visibilityBtnActive : ''}`}
                  onClick={() => set({ visibility: opt.v })}
                >
                  <div>
                    <p className={styles.visibilityBtnLabel}>{opt.label}</p>
                    <p className={styles.visibilityBtnSub}>{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )

      case 5: return (
        <>
          <h2 className={styles.stepHeading}>What's the offering?</h2>
          <p className={styles.stepSubtext}>Be transparent about cost — and generous where you can</p>
          <div className={styles.priceTypeGrid}>
            {([
              { v: 'free' as PriceType, label: 'Free — the best price' },
              { v: 'pwyw' as PriceType, label: 'Pay what you can' },
              { v: 'community' as PriceType, label: 'Community price (fixed amount)' },
              { v: 'sliding' as PriceType, label: 'Sliding scale (min–max)' },
            ]).map(opt => (
              <button
                key={opt.v}
                type="button"
                className={`${styles.priceTypeBtn} ${g.price === opt.v ? styles.priceTypeBtnActive : ''}`}
                onClick={() => set({ price: opt.v })}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {g.price === 'pwyw' && (
            <div className={styles.formGroup} style={{ marginTop: 16 }}>
              <label className={styles.formLabel}>Suggested amount (optional)</label>
              <input className={styles.formInput} placeholder="e.g. 15" value={g.priceAmount} onChange={e => set({ priceAmount: e.target.value })} />
            </div>
          )}
          {g.price === 'community' && (
            <>
              <div className={styles.formGroup} style={{ marginTop: 16 }}>
                <label className={styles.formLabel}>Amount ($)</label>
                <input className={styles.formInput} placeholder="e.g. 20" value={g.priceAmount} onChange={e => set({ priceAmount: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>What does this cover? (optional)</label>
                <input className={styles.formInput} placeholder="e.g. Covers materials and space rental" value={g.priceNote} onChange={e => set({ priceNote: e.target.value })} />
              </div>
            </>
          )}
          {g.price === 'sliding' && (
            <div className={styles.formRow} style={{ marginTop: 16 }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Minimum ($)</label>
                <input className={styles.formInput} placeholder="10" value={g.priceMin} onChange={e => set({ priceMin: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Maximum ($)</label>
                <input className={styles.formInput} placeholder="35" value={g.priceMax} onChange={e => set({ priceMax: e.target.value })} />
              </div>
            </div>
          )}
          {g.price !== 'free' && (
            <>
              <div className={styles.toggleRow} style={{ marginTop: 8 }}>
                <span className={styles.toggleLabel}>Allow members to attend even if they can't pay</span>
                <Toggle on={g.hardshipWaiver} onToggle={() => set({ hardshipWaiver: !g.hardshipWaiver })} />
              </div>
              <div className={styles.formGroup} style={{ marginTop: 12 }}>
                <label className={styles.formLabel}>How should gatherers pay?</label>
                <input
                  className={styles.formInput}
                  placeholder="e.g. Venmo @yourname, or pay at the door"
                  value={g.paymentMethod}
                  onChange={e => set({ paymentMethod: e.target.value })}
                />
              </div>
            </>
          )}
        </>
      )

      case 6: return (
        <>
          <h2 className={styles.stepHeading}>Review and plant</h2>
          <p className={styles.stepSubtext}>Make sure everything feels right</p>
          <div className={styles.reviewCard}>
            <p className={styles.reviewName}>{g.name || 'Your gathering'}</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {g.type && <TypePill type={g.type} />}
              {g.recurring && <span className={styles.recurringBadge}>↻ Recurring</span>}
            </div>
            <p className={styles.reviewMeta}>
              {g.date && `${g.date} · `}{g.startTime && `${g.startTime}`}{g.endTime && ` – ${g.endTime}`}
              {(g.venue || g.neighborhood) && <><br />{[g.venue, g.neighborhood].filter(Boolean).join(' · ')}</>}
              <br />
              {g.price === 'free' && 'Free'}
              {g.price === 'pwyw' && `Pay what you can${g.priceAmount ? ` (suggested: $${g.priceAmount})` : ''}`}
              {g.price === 'community' && `Community price: $${g.priceAmount}`}
              {g.price === 'sliding' && `Sliding scale: $${g.priceMin}–$${g.priceMax}`}
              {g.capacity && ` · ${g.capacity} spots`}
              {!g.capacity && ' · Open gathering'}
            </p>
            {g.description && (
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,220,170,0.55)', marginTop: 10, lineHeight: 1.6 }}>
                "{g.description.slice(0, 120)}{g.description.length > 120 ? '…' : ''}"
              </p>
            )}
          </div>
          <button
            className={styles.continueBtn}
            style={{ width: '100%', marginTop: 20, padding: '16px' }}
            onClick={handlePlant}
          >
            🌱 Plant this gathering
          </button>
        </>
      )
    }
  }

  return (
    <motion.div
      className={styles.creationOverlay}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
    >
      {/* Header */}
      <div className={styles.creationHeader}>
        <div className={styles.creationHeaderRow}>
          <h2 className={styles.creationTitle}>Plant a gathering</h2>
          <button className={styles.closeCreationBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.progressBar}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`${styles.progressDot} ${
                i < step - 1 ? styles.progressDotDone :
                i === step - 1 ? styles.progressDotActive : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className={styles.creationBody}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          {stepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Footer nav (not on step 6 which has its own button) */}
      {step < 6 && (
        <div className={styles.creationFooter}>
          {step > 1 ? (
            <button className={styles.backBtn} onClick={() => setStep(v => v - 1)}>Back</button>
          ) : (
            <div style={{ flex: 1 }} />
          )}
          <button
            className={styles.continueBtn}
            onClick={() => setStep(v => v + 1)}
            disabled={!canContinue}
          >
            Continue
          </button>
        </div>
      )}

      {/* Planted confirmation */}
      <AnimatePresence>
        {planted && (
          <motion.div
            className={styles.plantedOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.plantedCard}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            >
              <motion.div
                style={{ fontSize: '3rem' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.1 }}
              >
                🌱
              </motion.div>
              <h2 className={styles.plantedTitle}>Your gathering is planted</h2>
              <p className={styles.plantedSub}>It's growing. People will find it.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Date selector ────────────────────────────────────────────────────────

function DateSelector({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (d: string | null) => void
}) {
  const today = useMemo(() => new Date(2026, 3, 8), [])
  const days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() + i); return d
    })
  }, [today])

  return (
    <div className={styles.dateSelector}>
      <button
        className={`${styles.dateBtn} ${styles.dateBtnAll} ${selected === null ? styles.dateBtnActive : ''}`}
        onClick={() => onSelect(null)}
      >
        All upcoming
      </button>
      {days.map(d => {
        const key = d.toISOString().slice(0, 10)
        const isToday = isSameDay(d, today)
        return (
          <button
            key={key}
            className={`${styles.dateBtn} ${selected === key ? styles.dateBtnActive : ''}`}
            onClick={() => onSelect(selected === key ? null : key)}
          >
            <span className={styles.dateBtnDow}>{DOW[d.getDay()]}</span>
            <span className={styles.dateBtnNum}>{d.getDate()}</span>
            <span className={styles.dateBtnMon}>{isToday ? 'today' : MON[d.getMonth()]}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function EventsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Set<EventType | 'all'>>(new Set(['all']))
  const [selectedEvent, setSelectedEvent] = useState<GatheringEvent | null>(null)
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set())
  const [showConfirm, setShowConfirm] = useState(false)
  const [showCreation, setShowCreation] = useState(false)

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth')
      else setLoading(false)
    })
  }, [router])

  const toggleFilter = (f: EventType | 'all') => {
    if (f === 'all') {
      setActiveFilters(new Set(['all']))
    } else {
      setActiveFilters(prev => {
        const next = new Set(prev)
        next.delete('all')
        next.has(f) ? next.delete(f) : next.add(f)
        if (next.size === 0) next.add('all')
        return next
      })
    }
  }

  const today = useMemo(() => new Date(2026, 3, 8), [])

  const filtered = useMemo(() => {
    return EVENTS.filter(ev => {
      if (selectedDate) {
        const key = ev.date.toISOString().slice(0, 10)
        if (key !== selectedDate) return false
      }
      if (!activeFilters.has('all') && !activeFilters.has(ev.type)) return false
      return true
    })
  }, [selectedDate, activeFilters])

  const todayEvents = useMemo(() =>
    filtered.filter(ev => !ev.recurring && isSameDay(ev.date, today)),
    [filtered, today]
  )
  const thisWeekEvents = useMemo(() =>
    filtered.filter(ev => !ev.recurring && !isSameDay(ev.date, today) && sameWeek(ev.date, today)),
    [filtered, today]
  )
  const horizonEvents = useMemo(() =>
    filtered.filter(ev => !ev.recurring && !sameWeek(ev.date, today) && !isSameDay(ev.date, today)),
    [filtered, today]
  )
  const recurringEvents = useMemo(() =>
    EVENTS.filter(ev => ev.recurring),
    []
  )

  const handleJoin = () => {
    if (!selectedEvent) return
    setJoinedIds(prev => new Set([...prev, selectedEvent.id]))
    setShowConfirm(true)
  }

  const handleStepBack = () => {
    if (!selectedEvent) return
    setJoinedIds(prev => { const n = new Set(prev); n.delete(selectedEvent.id); return n })
  }

  const handleToggleRemind = () => {
    if (!selectedEvent) return
    setRemindedIds(prev => {
      const n = new Set(prev)
      n.has(selectedEvent.id) ? n.delete(selectedEvent.id) : n.add(selectedEvent.id)
      return n
    })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#802f1f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ fontFamily: 'var(--font-catchy-mager, CatchyMager, sans-serif)', fontSize: '2rem', color: '#b87333' }}
        >
          SOW
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.page}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarRow}>
            <div>
              <h1 className={styles.topBarTitle}>Gatherings</h1>
              <p className={styles.topBarSubtext}>What's growing near you</p>
            </div>
            <button className={styles.plantBtn} onClick={() => setShowCreation(true)}>
              🌱 Plant a gathering
            </button>
          </div>

          <DateSelector selected={selectedDate} onSelect={setSelectedDate} />

          <div className={styles.filterRow}>
            {(['all', ...Object.keys(FILTER_LABELS).filter(k => k !== 'all')] as Array<EventType | 'all'>).map(f => (
              <button
                key={f}
                className={`${styles.filterChip} ${activeFilters.has(f) ? styles.filterChipActive : ''}`}
                onClick={() => toggleFilter(f)}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className={styles.feed}>
          {/* Today */}
          {todayEvents.length > 0 && (
            <>
              <p className={styles.sectionHead}>Happening today</p>
              {todayEvents.map(ev => (
                <EventCard key={ev.id} ev={ev} onClick={() => setSelectedEvent(ev)} />
              ))}
            </>
          )}

          {/* This week */}
          {thisWeekEvents.length > 0 && (
            <>
              <p className={styles.sectionHead}>This week</p>
              {thisWeekEvents.map(ev => (
                <EventCard key={ev.id} ev={ev} onClick={() => setSelectedEvent(ev)} />
              ))}
            </>
          )}

          {/* On the horizon */}
          {horizonEvents.length > 0 && (
            <>
              <p className={styles.sectionHead}>On the horizon</p>
              {horizonEvents.map(ev => (
                <EventCard key={ev.id} ev={ev} onClick={() => setSelectedEvent(ev)} />
              ))}
            </>
          )}

          {/* Recurring */}
          {recurringEvents.length > 0 && (
            <>
              <p className={styles.sectionHead}>Recurring gatherings</p>
              <div className={styles.recurringScroll}>
                {recurringEvents.map(ev => (
                  <div key={ev.id} className={styles.recurringCard} onClick={() => setSelectedEvent(ev)}>
                    <div style={{ marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <TypePill type={ev.type} />
                      <span className={styles.recurringBadge}>↻ {ev.recurring}</span>
                    </div>
                    <p className={styles.recurringName}>{ev.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,220,170,0.42)', margin: '4px 0 0' }}>
                      {fmtTime(ev.date)} · {ev.neighborhood}
                    </p>
                    <div className={styles.cardBottom} style={{ paddingTop: 10 }}>
                      <PriceDisplay ev={ev} />
                      <span className={styles.gathererCount}>{ev.gathererCount} gatherers</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {todayEvents.length === 0 && thisWeekEvents.length === 0 && horizonEvents.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🌱</span>
              <p>No gatherings match what you're looking for right now.<br />Try widening your search, or plant one yourself.</p>
              <button className={styles.plantBtn} onClick={() => setShowCreation(true)}>
                Plant a gathering
              </button>
            </div>
          )}
        </div>

        {/* Discovery */}
        <div className={styles.discoverySection}>
          <p className={styles.discoverySectionHead}>Gatherings your kindred are attending</p>
          <p className={styles.discoverySub}>Based on trust, not algorithms</p>
          <div className={styles.discoveryScroll}>
            {EVENTS.filter(ev => ev.kindredAttending && ev.kindredAttending.length > 0).map(ev => (
              <div key={ev.id} className={styles.discoveryCard} onClick={() => setSelectedEvent(ev)}>
                <p className={styles.discoveryName}>{ev.name}</p>
                <p className={styles.discoveryMeta}>
                  {ev.kindredAttending?.map(k => k.name).join(', ')} {ev.kindredAttending?.length === 1 ? 'is' : 'are'} going
                </p>
                <p className={styles.discoveryMeta} style={{ marginTop: 4 }}>
                  {ev.neighborhood} · {fmtTime(ev.date)}
                </p>
              </div>
            ))}
          </div>

          <p className={styles.discoverySectionHead}>Popular in Bed-Stuy & Fort Greene</p>
          <p className={styles.discoverySub}>What's growing near your roots</p>
          <div className={styles.discoveryScroll}>
            {EVENTS.filter(ev => ['Bed-Stuy', 'Fort Greene'].includes(ev.neighborhood)).map(ev => (
              <div key={ev.id} className={styles.discoveryCard} onClick={() => setSelectedEvent(ev)}>
                <p className={styles.discoveryName}>{ev.name}</p>
                <p className={styles.discoveryMeta}>{ev.gathererCount} gatherers · {ev.neighborhood}</p>
              </div>
            ))}
          </div>

          <p className={styles.discoverySectionHead}>Recently planted</p>
          <div className={styles.discoveryScroll}>
            {[...EVENTS].reverse().slice(0, 5).map(ev => (
              <div key={ev.id} className={styles.discoveryCard} onClick={() => setSelectedEvent(ev)}>
                <p className={styles.discoveryName}>{ev.name}</p>
                <p className={styles.discoveryMeta}>{ev.neighborhood} · {MON[ev.date.getMonth()]} {ev.date.getDate()}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: '16px 4px', textAlign: 'center' }}>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,220,170,0.3)', fontSize: '0.8rem', fontFamily: 'inherit' }}
            >
              Past gatherings →
            </button>
          </div>
        </div>
      </div>

      <BottomNav active="events" />

      {/* Event detail overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetail
            ev={selectedEvent}
            joined={joinedIds.has(selectedEvent.id)}
            reminded={remindedIds.has(selectedEvent.id)}
            onJoin={handleJoin}
            onStepBack={handleStepBack}
            onToggleRemind={handleToggleRemind}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>

      {/* Join confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmationOverlay onDismiss={() => setShowConfirm(false)} />
        )}
      </AnimatePresence>

      {/* Plant a gathering creation flow */}
      <AnimatePresence>
        {showCreation && (
          <PlantGathering onClose={() => setShowCreation(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
