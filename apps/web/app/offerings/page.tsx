'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import BottomNav from '@/app/components/BottomNav'
import styles from './offerings.module.css'

// ─── Types ────────────────────────────────────────────────────────────────

type OfferingCategory =
  | 'food' | 'healing' | 'teaching' | 'childcare' | 'language'
  | 'movement' | 'creative' | 'garden' | 'rides' | 'tech'
  | 'handiwork' | 'companionship' | 'other'

interface Offering {
  id: string
  type: 'offering' | 'seeking'
  category: OfferingCategory
  offerer: string
  initial: string
  bio?: string
  neighborhood: string
  timeAgo: string
  isKindred: boolean
  title: string
  description: string
  availability: string
  locationNote: string
  capacity?: number
  alsoSeeking?: string
  canOffer?: string      // on seeking posts
  kindredReceived?: number
  kindredTrust?: Array<{ initial: string; name: string }>
  gratitude?: Array<{ text: string; from: string; date: string }>
  memberSince?: string
  givenCount?: number
  receivedCount?: number
}

// ─── Category config ──────────────────────────────────────────────────────

const CATEGORIES: { value: OfferingCategory; label: string; icon: string }[] = [
  { value: 'food',          label: 'Food & meals',        icon: '🍲' },
  { value: 'healing',       label: 'Healing & bodywork',  icon: '🌙' },
  { value: 'teaching',      label: 'Teaching & skills',   icon: '🌿' },
  { value: 'childcare',     label: 'Childcare',           icon: '🌱' },
  { value: 'language',      label: 'Language',            icon: '💬' },
  { value: 'movement',      label: 'Movement & fitness',  icon: '🌊' },
  { value: 'creative',      label: 'Creative arts',       icon: '🎨' },
  { value: 'garden',        label: 'Garden & outdoors',   icon: '🪴' },
  { value: 'rides',         label: 'Rides & errands',     icon: '🚲' },
  { value: 'tech',          label: 'Tech & digital',      icon: '💻' },
  { value: 'handiwork',     label: 'Handiwork & repairs', icon: '🔧' },
  { value: 'companionship', label: 'Companionship',       icon: '🤝' },
  { value: 'other',         label: 'Other',               icon: '✨' },
]

const CAT_LABEL: Record<OfferingCategory, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.value, c.label])
) as Record<OfferingCategory, string>

const CAT_ICON: Record<OfferingCategory, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.value, c.icon])
) as Record<OfferingCategory, string>

// ─── Placeholder data ─────────────────────────────────────────────────────

const OFFERINGS: Offering[] = [
  {
    id: 'o1', type: 'offering', category: 'food',
    offerer: 'Amara', initial: 'AO', bio: 'Bed-Stuy born. Cooking is my love language.',
    memberSince: 'April 2026', givenCount: 12, receivedCount: 8,
    neighborhood: 'Bed-Stuy', timeAgo: '2 hours ago', isKindred: true,
    title: 'Sunday Stew for Your Soul',
    description: 'I make a giant pot of groundnut stew every Sunday. There\'s always more than enough. Come get a container.',
    availability: 'Every Sunday', locationNote: 'In Bed-Stuy · Pick up from my stoop',
    kindredReceived: 3,
    kindredTrust: [{ initial: 'L', name: 'Luz' }, { initial: 'P', name: 'Priya' }],
    gratitude: [
      { text: 'Amara\'s stew is the reason I survived the first winter I spent alone in this city. She packs it with so much love you can taste it.', from: 'Priya', date: 'March 2026' },
      { text: 'I came for stew and left with a whole new way of thinking about feeding community.', from: 'Luz', date: 'February 2026' },
    ],
  },
  {
    id: 'o2', type: 'offering', category: 'garden',
    offerer: 'Sage', initial: 'S', bio: 'Plant person. Fort Greene native. I just like getting my hands in soil.',
    memberSince: 'March 2026', givenCount: 6, receivedCount: 3,
    neighborhood: 'Fort Greene', timeAgo: 'Yesterday', isKindred: true,
    title: 'One Hour in the Garden',
    description: 'I\'ll come help with your community garden plot, balcony plants, or window boxes. I just like getting my hands in soil.',
    availability: 'Weekends', locationNote: 'Can travel anywhere in Brooklyn',
    kindredReceived: 1,
    kindredTrust: [{ initial: 'T', name: 'Tanya' }],
    gratitude: [
      { text: 'Sage turned my sad balcony into a little Eden. She knows everything about what grows in containers.', from: 'Tanya', date: 'March 2026' },
    ],
  },
  {
    id: 'o3', type: 'offering', category: 'healing',
    offerer: 'Keiko', initial: 'K', bio: 'Reiki practitioner, Crown Heights community member.',
    memberSince: 'February 2026', givenCount: 9, receivedCount: 5,
    neighborhood: 'Crown Heights', timeAgo: '3 days ago', isKindred: false,
    title: 'Reiki for Rest',
    description: '30-minute reiki sessions. I\'m a certified practitioner. This is my way of giving back to the community that held me.',
    availability: 'Limited — 5 spots remaining', locationNote: 'At my practice space in Crown Heights',
    capacity: 5, alsoSeeking: 'someone to teach me to sew',
    gratitude: [
      { text: 'I went in skeptical. I left in tears. Good tears. The kind that mean something shifted.', from: 'Jasmine', date: 'March 2026' },
    ],
  },
  {
    id: 'o4', type: 'offering', category: 'tech',
    offerer: 'Jordan', initial: 'J', bio: 'Hiring manager by day. Here to help people get what they deserve professionally.',
    memberSince: 'April 2026', givenCount: 4, receivedCount: 2,
    neighborhood: 'Williamsburg', timeAgo: '4 days ago', isKindred: false,
    title: 'Resume & Cover Letter Help',
    description: 'I\'m a hiring manager by day. Let me look over your resume, help you prep for interviews, or just talk through your career stuff. I\'ve seen thousands of applications. I know what works.',
    availability: 'Flexible — schedule a session', locationNote: 'Virtual / anywhere',
  },
  {
    id: 'o5', type: 'offering', category: 'creative',
    offerer: 'Fatou', initial: 'F', bio: 'Harlem-based. Braiding is ancestral for me.',
    memberSince: 'January 2026', givenCount: 18, receivedCount: 7,
    neighborhood: 'Harlem', timeAgo: '5 days ago', isKindred: true,
    title: 'Braiding Circle',
    description: 'I\'ll teach you protective styles — box braids, twists, cornrows. Bring your own hair, I\'ll bring the patience. We do this in groups of 4 so you all learn from each other too.',
    availability: 'First Saturday of each month',
    locationNote: 'At Fatou\'s place in Harlem · 4 people at a time',
    capacity: 4,
    gratitude: [
      { text: 'Learning to braid from Fatou felt like getting back something I didn\'t know I\'d lost.', from: 'Amara R.', date: 'April 2026' },
    ],
  },
  {
    id: 'o6', type: 'offering', category: 'language',
    offerer: 'Dani', initial: 'D', bio: 'Sunset Park. Native Mandarin speaker, learning everything else slowly.',
    memberSince: 'March 2026', givenCount: 3, receivedCount: 2,
    neighborhood: 'Sunset Park', timeAgo: '1 week ago', isKindred: false,
    title: 'Mandarin Conversation Practice',
    description: 'Native speaker, happy to practice conversational Mandarin with you over tea. All levels welcome — zero to intermediate. We just talk.',
    availability: 'Flexible — weekends preferred', locationNote: 'In Sunset Park or virtual',
    alsoSeeking: 'someone to practice Portuguese with',
  },
  {
    id: 'o7', type: 'offering', category: 'handiwork',
    offerer: 'Priya', initial: 'P', bio: 'Bushwick. Bikes are my love language.',
    memberSince: 'February 2026', givenCount: 14, receivedCount: 6,
    neighborhood: 'Bushwick', timeAgo: '1 week ago', isKindred: true,
    title: 'Bike Tune-Up',
    description: 'I\'ll tune up your bike — brakes, gears, chain, tires. I\'ve been fixing bikes since I was 12. Bring it by my stoop on Saturdays. I\'ll have it done while you have a coffee.',
    availability: 'Saturdays 10AM–2PM',
    locationNote: 'At Priya\'s stoop in Bushwick',
  },
  {
    id: 'o8', type: 'offering', category: 'food',
    offerer: 'Luz', initial: 'L', bio: 'Bed-Stuy. I cook because it\'s the most direct way I know to say I love you.',
    memberSince: 'March 2026', givenCount: 8, receivedCount: 4,
    neighborhood: 'Bed-Stuy', timeAgo: '2 weeks ago', isKindred: true,
    title: 'Postpartum Meal Train Cooking',
    description: 'If someone in your life just had a baby, I\'ll cook and deliver three days of meals. I\'ve been there. No one should do it alone. Just let me know where to show up.',
    availability: 'As needed — reach out', locationNote: 'Delivery anywhere in NYC',
    kindredReceived: 2,
    kindredTrust: [{ initial: 'A', name: 'Amara' }, { initial: 'J', name: 'Jasmine' }],
    gratitude: [
      { text: 'Luz showed up with three containers of food and didn\'t stay long — she just said "you don\'t have to say anything." I still think about that.', from: 'Miriam', date: 'February 2026' },
    ],
  },
]

const SEEKINGS: Offering[] = [
  {
    id: 's1', type: 'seeking', category: 'language',
    offerer: 'Amara', initial: 'AO',
    neighborhood: 'Bed-Stuy', timeAgo: '2 hours ago', isKindred: true,
    title: 'Spanish Conversation Partner',
    description: 'I\'m intermediate but rusty. Looking for someone to practice with once a week, maybe over coffee or a walk.',
    availability: 'Once a week, flexible timing',
    locationNote: 'In Bed-Stuy or nearby',
    canOffer: 'Home-cooked meals, recipe sharing, general good company',
  },
  {
    id: 's2', type: 'seeking', category: 'rides',
    offerer: 'Sage', initial: 'S',
    neighborhood: 'Fort Greene', timeAgo: 'Yesterday', isKindred: true,
    title: 'Help Moving a Bookshelf',
    description: 'I bought a massive bookshelf from someone in Park Slope and I can\'t get it home alone. Need a friend with a car or strong arms, ideally both. One-time thing.',
    availability: 'One-time, flexible date in the next two weeks',
    locationNote: 'Park Slope → Fort Greene',
    canOffer: 'Garden help, plant cuttings, I\'m a great person to have on your side',
  },
  {
    id: 's3', type: 'seeking', category: 'companionship',
    offerer: 'Keiko', initial: 'K',
    neighborhood: 'Crown Heights', timeAgo: '3 days ago', isKindred: false,
    title: 'Someone to Sit With My Mom',
    description: 'My mother is 78, speaks mostly Japanese, and I need someone to keep her company for a few hours while I work from home. She loves tea, crosswords, and quiet conversation. This is one of the most important things I could ask for.',
    availability: 'Tuesdays and Thursdays, 10AM–2PM',
    locationNote: 'Crown Heights (my home)',
    canOffer: 'Reiki sessions, I have a lot of gratitude to give',
  },
  {
    id: 's4', type: 'seeking', category: 'handiwork',
    offerer: 'Jordan', initial: 'J',
    neighborhood: 'Williamsburg', timeAgo: '4 days ago', isKindred: false,
    title: 'Sewing Machine I Can Borrow',
    description: 'Mine broke and I have a project due. Just need it for a week, maybe two. I\'ll treat it like it\'s precious because it is.',
    availability: 'One-time, within the next two weeks',
    locationNote: 'Can pick up in Williamsburg or nearby',
    canOffer: 'Resume help, interview prep, career coaching — genuinely useful stuff',
  },
]

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
      onClick={onToggle} type="button" aria-pressed={on}
    >
      <div className={`${styles.toggleKnob} ${on ? styles.toggleKnobOn : ''}`} />
    </button>
  )
}

// ─── Offering card ────────────────────────────────────────────────────────

function OfferingCard({
  item, onOpen, onSave, saved,
}: {
  item: Offering; onOpen: () => void
  onSave: (id: string) => void; saved: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const shortDesc = item.description.length > 130
    ? item.description.slice(0, 130) + '…'
    : item.description

  const isSeeking = item.type === 'seeking'

  return (
    <FadeIn>
      <div
        className={`${styles.card} ${isSeeking ? styles.seekingCard : ''}`}
        onClick={onOpen}
      >
        {/* Offerer row */}
        <div className={styles.cardTop}>
          <div className={styles.avatar}>{item.initial}</div>
          <div className={styles.offererInfo}>
            <div className={styles.offererRow}>
              <span className={`${styles.offererName} ${item.isKindred ? styles.offererNameKindred : ''}`}>
                {item.offerer}
              </span>
              {item.isKindred && <span className={styles.kindredHeart}>🌿</span>}
              <span className={styles.neighborhoodPill}>{item.neighborhood}</span>
            </div>
            <span className={styles.timeAgo}>{item.timeAgo}</span>
          </div>
        </div>

        {/* Content */}
        <p className={styles.cardTitle}>
          {isSeeking && <span className={styles.seekingIcon}>🌑</span>}
          {item.title}
        </p>
        <span className={styles.catPill}>
          {CAT_ICON[item.category]} {CAT_LABEL[item.category]}
        </span>
        <p className={styles.cardDesc} onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}>
          {expanded ? item.description : shortDesc}
          {item.description.length > 130 && (
            <button className={styles.readMore}>
              {expanded ? ' less' : ' Read more'}
            </button>
          )}
        </p>
        <div className={styles.cardMeta}>
          <span>🕰 {item.availability}</span>
          <span className={styles.cardMetaDot}>·</span>
          <span>📍 {item.locationNote}</span>
        </div>
        {item.alsoSeeking && (
          <p className={styles.alsoSeeking}>
            {item.offerer} is also seeking: {item.alsoSeeking}
          </p>
        )}
        {item.canOffer && (
          <p className={styles.canOffer}>
            Can offer in return: {item.canOffer}
          </p>
        )}

        {/* Actions */}
        <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
          {isSeeking ? (
            <button className={styles.iCanHelpBtn} onClick={onOpen}>I can help</button>
          ) : (
            <button className={styles.reachOutBtn} onClick={onOpen}>Reach out</button>
          )}
          <button
            className={`${styles.saveBtn} ${saved ? styles.saveBtnActive : ''}`}
            onClick={() => onSave(item.id)}
          >
            {saved ? '🌱' : '○'} {saved ? 'Saved' : 'Save'}
          </button>
          {item.kindredReceived !== undefined && item.kindredReceived > 0 && (
            <span className={styles.kindredReceived}>
              {item.kindredReceived} kindred received
            </span>
          )}
        </div>
      </div>
    </FadeIn>
  )
}

// ─── Reach-out modal ──────────────────────────────────────────────────────

function ReachOutModal({
  item,
  onClose,
}: {
  item: Offering
  onClose: () => void
}) {
  const isSeeking = item.type === 'seeking'
  const defaultMsg = isSeeking
    ? `Hi ${item.offerer}, I can help with "${item.title}". `
    : `Hi ${item.offerer}, I'd love to receive your "${item.title}". `
  const [msg, setMsg] = useState(defaultMsg)
  const [inReturn, setInReturn] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    console.log('Introduction sent:', { to: item.offerer, msg, inReturn })
    setSent(true)
  }

  return (
    <motion.div
      className={styles.modalBackdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modalSheet}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.modalHandle} />
        {sent ? (
          <div className={styles.modalSent}>
            <motion.div
              className={styles.modalSentSprout}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            >
              🌱
            </motion.div>
            <h2 className={styles.modalSentTitle}>Introduction sent</h2>
            <p className={styles.modalSentSub}>
              {item.offerer} will receive it and can respond. Every exchange starts with a hello.
            </p>
          </div>
        ) : (
          <>
            <h2 className={styles.modalTitle}>
              Introduce yourself to {item.offerer}
            </h2>
            <label className={styles.modalLabel}>Your message</label>
            <textarea
              className={styles.modalInput}
              rows={4}
              value={msg}
              onChange={e => setMsg(e.target.value)}
            />
            <label className={styles.modalLabel}>What you can offer in return (optional)</label>
            <p className={styles.modalRecipNote}>
              Reciprocity makes the community stronger. Is there anything you'd like to offer in return?
              No pressure — giving freely is beautiful too.
            </p>
            <textarea
              className={styles.modalInput}
              rows={2}
              placeholder="e.g. I can offer cooking lessons, help with moving…"
              value={inReturn}
              onChange={e => setInReturn(e.target.value)}
            />
            <button className={styles.modalSendBtn} onClick={handleSend}>
              Send introduction
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Offering detail overlay ──────────────────────────────────────────────

function OfferingDetail({
  item,
  saved,
  onSave,
  onClose,
}: {
  item: Offering
  saved: boolean
  onSave: (id: string) => void
  onClose: () => void
}) {
  const [showReachOut, setShowReachOut] = useState(false)
  const isSeeking = item.type === 'seeking'

  return (
    <motion.div
      className={styles.detailOverlay}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
    >
      <div className={styles.detailTopBar}>
        <button className={styles.detailBackBtn} onClick={onClose}>← Back</button>
        <button
          className={styles.detailSaveBtn}
          onClick={() => onSave(item.id)}
        >
          {saved ? '🌱 Saved' : '○ Save to garden'}
        </button>
      </div>

      <div className={styles.detailBody}>
        {/* Offerer card */}
        <div className={styles.detailOffererCard}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className={styles.detailAvatar}>{item.initial}</div>
            <div style={{ flex: 1 }}>
              <p className={styles.detailOffererName}>{item.offerer}</p>
              <p className={styles.detailSince}>
                Planting since {item.memberSince ?? 'recently'}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '4px 0' }}>
                <span className={styles.neighborhoodPill}>{item.neighborhood}</span>
                {item.isKindred && (
                  <span className={styles.kindredBadge}>🌿 In your kindred</span>
                )}
              </div>
              {item.bio && <p className={styles.detailBio}>{item.bio}</p>}
            </div>
          </div>
          {(item.givenCount !== undefined) && (
            <p className={styles.reciprocityNote} style={{ marginTop: 12 }}>
              {item.offerer} has shared {item.givenCount} gifts with the community
            </p>
          )}
          {item.alsoSeeking && (
            <div className={styles.detailAlsoSeeking}>
              <p className={styles.detailAlsoSeekingLabel}>Also seeking</p>
              <p className={styles.detailAlsoSeekingText}>"{item.alsoSeeking}"</p>
            </div>
          )}
          {item.canOffer && (
            <div className={styles.detailAlsoSeeking} style={{ borderColor: 'rgba(109,138,90,0.3)' }}>
              <p className={styles.detailAlsoSeekingLabel}>Can offer in return</p>
              <p className={styles.detailAlsoSeekingText}>{item.canOffer}</p>
            </div>
          )}
        </div>

        {/* Offering detail */}
        <div className={styles.detailSection}>
          <p className={styles.detailSectionLabel}>
            {isSeeking ? 'Seeking' : 'Offering'}
          </p>
          <span className={styles.catPill}>
            {CAT_ICON[item.category]} {CAT_LABEL[item.category]}
          </span>
          <h1 className={styles.detailTitle} style={{ marginTop: 8 }}>{item.title}</h1>
          <p className={styles.detailDesc}>{item.description}</p>
          <div className={styles.detailMetaLine}>
            <span>🕰</span><span>{item.availability}</span>
          </div>
          <div className={styles.detailMetaLine}>
            <span>📍</span><span>{item.locationNote}</span>
          </div>
          {item.capacity && (
            <div className={styles.detailMetaLine}>
              <span>👥</span><span>{item.capacity} spots available</span>
            </div>
          )}
        </div>

        {/* Community trust */}
        {item.kindredTrust && item.kindredTrust.length > 0 && (
          <div className={styles.detailSection}>
            <p className={styles.detailSectionLabel}>Community trust</p>
            <div className={styles.trustRow}>
              {item.kindredTrust.map((k, i) => (
                <div key={i} className={styles.trustAvatar}>{k.initial}</div>
              ))}
              <span className={styles.trustText}>
                {item.kindredTrust.map(k => k.name).join(' and ')}
                {item.kindredTrust.length === 1 ? ' has' : ' have'} received from {item.offerer}
              </span>
            </div>
          </div>
        )}

        {/* Gratitude */}
        {item.gratitude && item.gratitude.length > 0 && (
          <div className={styles.detailSection}>
            <p className={styles.detailSectionLabel}>Gratitude</p>
            {item.gratitude.map((g, i) => (
              <div key={i} className={styles.gratitudeCard}>
                <p className={styles.gratitudeText}>"{g.text}"</p>
                <p className={styles.gratitudeMeta}>{g.from} · {g.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className={styles.actionBar}>
        <button
          className={styles.actionPrimaryBtn}
          onClick={() => setShowReachOut(true)}
        >
          {isSeeking ? `I can help ${item.offerer}` : `Reach out to ${item.offerer}`}
        </button>
        <button
          className={styles.actionSecBtn}
          onClick={() => onSave(item.id)}
        >
          {saved ? '🌱 Saved' : 'Save'}
        </button>
      </div>

      <AnimatePresence>
        {showReachOut && (
          <ReachOutModal item={item} onClose={() => setShowReachOut(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Creation flow ────────────────────────────────────────────────────────

interface NewOffering {
  category: OfferingCategory | null
  title: string; description: string
  availability: 'once' | 'recurring' | 'available' | ''
  locationType: 'mine' | 'yours' | 'virtual' | 'sow'
  capacity: string
  alsoSeeking: boolean
  seekTitle: string; seekCategory: OfferingCategory | null; seekDesc: string
}

const INITIAL: NewOffering = {
  category: null, title: '', description: '',
  availability: '', locationType: 'mine', capacity: '',
  alsoSeeking: false, seekTitle: '', seekCategory: null, seekDesc: '',
}

function CreateFlow({
  mode,
  onClose,
}: {
  mode: 'offering' | 'seeking'
  onClose: () => void
}) {
  const [step, setStep] = useState(1)
  const [g, setG] = useState<NewOffering>(INITIAL)
  const [planted, setPlanted] = useState(false)
  const totalSteps = mode === 'offering' ? 5 : 4
  const set = (p: Partial<NewOffering>) => setG(prev => ({ ...prev, ...p }))

  const canContinue = useMemo(() => {
    if (step === 1) return g.category !== null
    if (step === 2) return g.title.trim().length > 0
    return true
  }, [step, g])

  const handlePlant = () => {
    console.log('Planted:', { mode, ...g })
    setPlanted(true)
    setTimeout(onClose, 2200)
  }

  const offeringStepContent = () => {
    switch (step) {
      case 1: return (
        <>
          <h2 className={styles.stepHeading}>What are you offering?</h2>
          <p className={styles.stepSub}>Choose the heart of your gift</p>
          <div className={styles.typeGrid}>
            {CATEGORIES.map(c => (
              <button key={c.value} type="button"
                className={`${styles.typeCard} ${g.category === c.value ? styles.typeCardActive : ''}`}
                onClick={() => set({ category: c.value })}
              >
                <span className={styles.typeCardIcon}>{c.icon}</span>
                <span className={`${styles.typeCardLabel} ${g.category === c.value ? styles.typeCardLabelActive : ''}`}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )
      case 2: return (
        <>
          <h2 className={styles.stepHeading}>Tell us about your gift</h2>
          <p className={styles.stepSub}>Help your community understand what you're offering</p>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Offering name</label>
            <input className={styles.formInput} placeholder="e.g. Dominican cooking lesson, One hour of garden help"
              value={g.title} onChange={e => set({ title: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea className={styles.formTextarea} rows={5}
              placeholder="What are you offering? What should someone know? What makes this special?"
              value={g.description} onChange={e => set({ description: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Photo (optional)</label>
            <div className={styles.imageUpload}>
              <span style={{ fontSize: '1.4rem' }}>🌿</span>
              <span>Add a photo</span>
            </div>
          </div>
        </>
      )
      case 3: return (
        <>
          <h2 className={styles.stepHeading}>The details</h2>
          <p className={styles.stepSub}>Help people know when and how to receive this</p>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Availability</label>
            {([
              { v: 'once', l: 'One-time', s: 'Just this once — special offering' },
              { v: 'recurring', l: 'Recurring', s: 'Ongoing, happens regularly' },
              { v: 'available', l: 'While it lasts', s: 'For physical offerings — meals, goods, etc.' },
            ] as const).map(opt => (
              <button key={opt.v} type="button"
                className={`${styles.optionBtn} ${g.availability === opt.v ? styles.optionBtnActive : ''}`}
                onClick={() => set({ availability: opt.v })}
              >
                <p className={styles.optionBtnLabel}>{opt.l}</p>
                <p className={styles.optionBtnSub}>{opt.s}</p>
              </button>
            ))}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Location</label>
            {([
              { v: 'mine', l: 'At my place', s: 'Your neighborhood shown, no exact address until connected' },
              { v: 'yours', l: 'At your place', s: 'You\'re willing to come to them' },
              { v: 'virtual', l: 'Virtual', s: 'Remote or online' },
              { v: 'sow', l: 'At a Sow place', s: 'A business or community space on the map' },
            ] as const).map(opt => (
              <button key={opt.v} type="button"
                className={`${styles.optionBtn} ${g.locationType === opt.v ? styles.optionBtnActive : ''}`}
                onClick={() => set({ locationType: opt.v })}
              >
                <p className={styles.optionBtnLabel}>{opt.l}</p>
                <p className={styles.optionBtnSub}>{opt.s}</p>
              </button>
            ))}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Capacity</label>
            <input className={styles.formInput} type="number"
              placeholder="How many people can receive this? Leave blank for no limit"
              value={g.capacity} onChange={e => set({ capacity: e.target.value })} />
          </div>
        </>
      )
      case 4: return (
        <>
          <h2 className={styles.stepHeading}>What are you seeking?</h2>
          <p className={styles.stepSub}>Reciprocity makes the community stronger. Is there anything you need?</p>
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>I'm also seeking something</span>
            <Toggle on={g.alsoSeeking} onToggle={() => set({ alsoSeeking: !g.alsoSeeking })} />
          </div>
          {g.alsoSeeking && (
            <>
              <div className={styles.formGroup} style={{ marginTop: 14 }}>
                <label className={styles.formLabel}>What are you seeking?</label>
                <input className={styles.formInput}
                  placeholder="e.g. Someone to practice Portuguese with"
                  value={g.seekTitle} onChange={e => set({ seekTitle: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <div className={styles.typeGrid}>
                  {CATEGORIES.map(c => (
                    <button key={c.value} type="button"
                      className={`${styles.typeCard} ${g.seekCategory === c.value ? styles.typeCardActive : ''}`}
                      onClick={() => set({ seekCategory: c.value })}
                    >
                      <span className={styles.typeCardIcon}>{c.icon}</span>
                      <span className={`${styles.typeCardLabel} ${g.seekCategory === c.value ? styles.typeCardLabelActive : ''}`}>
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>A little more context (optional)</label>
                <textarea className={styles.formTextarea} rows={3}
                  placeholder="What specifically are you looking for?"
                  value={g.seekDesc} onChange={e => set({ seekDesc: e.target.value })} />
              </div>
            </>
          )}
          {!g.alsoSeeking && (
            <p className={styles.skipBtn} style={{ cursor: 'default', color: 'rgba(255,220,170,0.3)', marginTop: 12, fontSize: '0.82rem' }}>
              Giving freely is a gift too. Your offering matters.
            </p>
          )}
        </>
      )
      case 5: return (
        <>
          <h2 className={styles.stepHeading}>Review and plant</h2>
          <p className={styles.stepSub}>Make sure your offering feels right</p>
          <div className={styles.reviewCard}>
            <p className={styles.reviewTitle}>{g.title || 'Your offering'}</p>
            {g.category && (
              <span className={styles.catPill}>
                {CAT_ICON[g.category]} {CAT_LABEL[g.category]}
              </span>
            )}
            <p className={styles.reviewMeta} style={{ marginTop: 8 }}>
              {g.availability && `${g.availability === 'once' ? 'One-time' : g.availability === 'recurring' ? 'Recurring' : 'While it lasts'}`}
              {g.locationType && ` · ${g.locationType === 'mine' ? 'At my place' : g.locationType === 'virtual' ? 'Virtual' : 'At your place'}`}
              {g.capacity && ` · ${g.capacity} spots`}
            </p>
            {g.description && (
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,220,170,0.55)', marginTop: 10, lineHeight: 1.6 }}>
                "{g.description.slice(0, 120)}{g.description.length > 120 ? '…' : ''}"
              </p>
            )}
            {g.alsoSeeking && g.seekTitle && (
              <p style={{ fontSize: '0.75rem', color: 'rgba(201,168,76,0.6)', marginTop: 10, fontStyle: 'italic' }}>
                Also seeking: {g.seekTitle}
              </p>
            )}
          </div>
          <button className={styles.continueBtn}
            style={{ width: '100%', marginTop: 20, padding: '16px' }}
            onClick={handlePlant}
          >
            🌱 Plant this offering
          </button>
        </>
      )
    }
  }

  const seekingStepContent = () => {
    switch (step) {
      case 1: return (
        <>
          <h2 className={styles.stepHeading}>What are you seeking?</h2>
          <p className={styles.stepSub}>Choose what you're looking for</p>
          <div className={styles.typeGrid}>
            {CATEGORIES.map(c => (
              <button key={c.value} type="button"
                className={`${styles.typeCard} ${g.category === c.value ? styles.typeCardActive : ''}`}
                onClick={() => set({ category: c.value })}
              >
                <span className={styles.typeCardIcon}>{c.icon}</span>
                <span className={`${styles.typeCardLabel} ${g.category === c.value ? styles.typeCardLabelActive : ''}`}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )
      case 2: return (
        <>
          <h2 className={styles.stepHeading}>Tell us what you need</h2>
          <p className={styles.stepSub}>Be honest — your community wants to help</p>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>What you're seeking</label>
            <input className={styles.formInput}
              placeholder="e.g. Spanish conversation partner, help moving a bookshelf"
              value={g.title} onChange={e => set({ title: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea className={styles.formTextarea} rows={4}
              placeholder="What specifically are you looking for? Any context that would help someone know if they can help?"
              value={g.description} onChange={e => set({ description: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Timing and flexibility</label>
            <input className={styles.formInput}
              placeholder="e.g. Once a week, flexible; or one-time next two weeks"
              value={g.availability} onChange={e => set({ availability: e.target.value as NewOffering['availability'] })} />
          </div>
        </>
      )
      case 3: return (
        <>
          <h2 className={styles.stepHeading}>What can you offer in return?</h2>
          <p className={styles.stepSub}>Reciprocity makes the community stronger — but giving freely is beautiful too</p>
          <div className={styles.formGroup}>
            <textarea className={styles.formTextarea} rows={4}
              placeholder="e.g. Home-cooked meals, help with moving, resume coaching — or leave blank to just ask freely"
              value={g.seekDesc} onChange={e => set({ seekDesc: e.target.value })} />
          </div>
          <button className={styles.skipBtn} onClick={() => setStep(v => v + 1)}>
            Skip — I'm just here to receive right now
          </button>
        </>
      )
      case 4: return (
        <>
          <h2 className={styles.stepHeading}>Review and share</h2>
          <p className={styles.stepSub}>Your need is valid. Your community can hold it.</p>
          <div className={styles.reviewCard}>
            <p className={styles.reviewTitle}>{g.title || 'Your need'}</p>
            {g.category && (
              <span className={styles.catPill}>
                {CAT_ICON[g.category]} {CAT_LABEL[g.category]}
              </span>
            )}
            {g.description && (
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,220,170,0.55)', marginTop: 10, lineHeight: 1.6 }}>
                "{g.description.slice(0, 120)}{g.description.length > 120 ? '…' : ''}"
              </p>
            )}
            {g.seekDesc && (
              <p style={{ fontSize: '0.75rem', color: 'rgba(109,138,90,0.65)', marginTop: 8, fontStyle: 'italic' }}>
                Can offer: {g.seekDesc}
              </p>
            )}
          </div>
          <button className={styles.continueBtn}
            style={{ width: '100%', marginTop: 20, padding: '16px' }}
            onClick={handlePlant}
          >
            🌑 Share what you're seeking
          </button>
        </>
      )
    }
  }

  const stepContent = mode === 'offering' ? offeringStepContent() : seekingStepContent()
  const isLastStep = step === totalSteps

  return (
    <motion.div className={styles.creationOverlay}
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
    >
      <div className={styles.creationHeader}>
        <div className={styles.creationHeaderRow}>
          <h2 className={styles.creationTitle}>
            {mode === 'offering' ? 'Plant an offering' : 'Share what you\'re seeking'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.progressBar}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`${styles.progressDot} ${
              i < step - 1 ? styles.progressDotDone :
              i === step - 1 ? styles.progressDotActive : ''
            }`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} className={styles.creationBody}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
        >
          {stepContent}
        </motion.div>
      </AnimatePresence>

      {!isLastStep && (
        <div className={styles.creationFooter}>
          {step > 1
            ? <button className={styles.backBtn} onClick={() => setStep(v => v - 1)}>Back</button>
            : <div style={{ flex: 1 }} />
          }
          <button className={styles.continueBtn}
            onClick={() => setStep(v => v + 1)} disabled={!canContinue}
          >
            Continue
          </button>
        </div>
      )}

      <AnimatePresence>
        {planted && (
          <motion.div className={styles.plantedOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div className={styles.plantedCard}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            >
              <motion.div style={{ fontSize: '3rem' }}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.1 }}
              >
                {mode === 'offering' ? '🌱' : '🌑'}
              </motion.div>
              <h2 className={styles.plantedTitle}>
                {mode === 'offering' ? 'Your offering is planted' : 'Your need has been shared'}
              </h2>
              <p className={styles.plantedSub}>
                {mode === 'offering'
                  ? 'The community can find it now. Abundance grows when we give.'
                  : 'Your community sees it. Help is coming.'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function OfferingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'growing' | 'seeking'>('growing')
  const [activeFilters, setActiveFilters] = useState<Set<OfferingCategory | 'all'>>(new Set(['all']))
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<Offering | null>(null)
  const [creationMode, setCreationMode] = useState<'offering' | 'seeking' | null>(null)

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth')
      else setLoading(false)
    })
  }, [router])

  const toggleFilter = (f: OfferingCategory | 'all') => {
    if (f === 'all') { setActiveFilters(new Set(['all'])); return }
    setActiveFilters(prev => {
      const next = new Set(prev); next.delete('all')
      next.has(f) ? next.delete(f) : next.add(f)
      if (next.size === 0) next.add('all')
      return next
    })
  }

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
    })
  }

  const feed = tab === 'growing' ? OFFERINGS : SEEKINGS
  const filtered = useMemo(() =>
    feed.filter(o => activeFilters.has('all') || activeFilters.has(o.category)),
    [feed, activeFilters]
  )

  const fromKindred   = filtered.filter(o => o.isKindred)
  const inNeighborhood = filtered.filter(o => !o.isKindred && ['Bed-Stuy', 'Fort Greene'].includes(o.neighborhood))
  const acrossCity     = filtered.filter(o => !o.isKindred && !['Bed-Stuy', 'Fort Greene'].includes(o.neighborhood))

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#802f1f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.8, repeat: Infinity }}
          style={{ fontFamily: 'var(--font-catchy-mager, CatchyMager, sans-serif)', fontSize: '2rem', color: '#b87333' }}>
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
              <h1 className={styles.topBarTitle}>Offerings</h1>
              <p className={styles.topBarSub}>What your community has to give</p>
            </div>
            <button className={styles.plantBtn}
              onClick={() => setCreationMode(tab === 'growing' ? 'offering' : 'seeking')}
            >
              🌱 {tab === 'growing' ? 'Plant an offering' : 'Share a need'}
            </button>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'growing' ? styles.tabActive : ''}`}
              onClick={() => setTab('growing')}>
              Growing
            </button>
            <button className={`${styles.tab} ${tab === 'seeking' ? styles.tabActive : ''}`}
              onClick={() => setTab('seeking')}>
              Seeking
            </button>
          </div>

          {/* Filter chips */}
          <div className={styles.filterRow}>
            <button className={`${styles.filterChip} ${activeFilters.has('all') ? styles.filterChipActive : ''}`}
              onClick={() => toggleFilter('all')}>All</button>
            {CATEGORIES.map(c => (
              <button key={c.value}
                className={`${styles.filterChip} ${activeFilters.has(c.value) ? styles.filterChipActive : ''}`}
                onClick={() => toggleFilter(c.value)}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className={styles.feed}>
          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🌱</span>
              <p>
                {tab === 'growing'
                  ? 'Nothing growing near you yet.\nBe the first to plant something.'
                  : 'No needs posted yet.\nShare what you\'re looking for.'}
              </p>
              <button className={styles.plantBtn}
                onClick={() => setCreationMode(tab === 'growing' ? 'offering' : 'seeking')}>
                {tab === 'growing' ? 'Plant an offering' : 'Share a need'}
              </button>
            </div>
          )}

          {fromKindred.length > 0 && (
            <>
              <p className={styles.sectionHead}>From your kindred</p>
              {fromKindred.map(o => (
                <OfferingCard key={o.id} item={o}
                  onOpen={() => setSelectedItem(o)}
                  onSave={toggleSave} saved={savedIds.has(o.id)} />
              ))}
            </>
          )}

          {inNeighborhood.length > 0 && (
            <>
              <p className={styles.sectionHead}>In your neighborhoods</p>
              {inNeighborhood.map(o => (
                <OfferingCard key={o.id} item={o}
                  onOpen={() => setSelectedItem(o)}
                  onSave={toggleSave} saved={savedIds.has(o.id)} />
              ))}
            </>
          )}

          {acrossCity.length > 0 && (
            <>
              <p className={styles.sectionHead}>Across the city</p>
              {acrossCity.map(o => (
                <OfferingCard key={o.id} item={o}
                  onOpen={() => setSelectedItem(o)}
                  onSave={toggleSave} saved={savedIds.has(o.id)} />
              ))}
            </>
          )}
        </div>
      </div>

      <BottomNav active="offerings" />

      {/* Detail overlay */}
      <AnimatePresence>
        {selectedItem && (
          <OfferingDetail
            item={selectedItem}
            saved={savedIds.has(selectedItem.id)}
            onSave={toggleSave}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>

      {/* Creation flow */}
      <AnimatePresence>
        {creationMode && (
          <CreateFlow mode={creationMode} onClose={() => setCreationMode(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
