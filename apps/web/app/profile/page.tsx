'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { getSupabaseClient } from '@/services/supabase/client'
import { NEIGHBORHOODS } from '@/lib/neighborhoods'
import BottomNav from '@/components/layout/BottomNav'
import RootsAnimation from '@/components/shared/RootsAnimation'
import styles from './profile.module.css'

// ─── Types ────────────────────────────────────────────────────────────────

interface KindredMember {
  id: string
  name: string
  initial: string
  neighborhoods: string[]
  memberSince: string
  placesLoved: number
}

interface SavedPlace {
  id: string
  name: string
  address: string
  ownership: string[]
  kindredSaved: number
}

interface MapList {
  id: string
  name: string
  placeCount: number
  privacy: 'just-me' | 'kindred'
  colors: string[]
}

interface Resonance {
  id: string
  business: string
  text: string
  date: string
  felt: number
}


// ─── Placeholder data ─────────────────────────────────────────────────────

const MEMBER = {
  name: 'Amara Osei',
  initials: 'AO',
  bio: 'Bed-Stuy born. Cooking is my love language.',
  neighborhoods: ['Bed-Stuy', 'Fort Greene'],
  memberSince: 'April 2026',
  kindredCount: 12,
}

const KINDRED: KindredMember[] = [
  { id: 'k1', name: 'Luz',      initial: 'L', neighborhoods: ['Crown Heights'], memberSince: 'March 2026', placesLoved: 14 },
  { id: 'k2', name: 'Tanya',    initial: 'T', neighborhoods: ['Park Slope', 'Gowanus'], memberSince: 'April 2026', placesLoved: 8 },
  { id: 'k3', name: 'Amara R.', initial: 'A', neighborhoods: ['Harlem (Central)'], memberSince: 'April 2026', placesLoved: 22 },
  { id: 'k4', name: 'Jasmine',  initial: 'J', neighborhoods: ['Flatbush'], memberSince: 'February 2026', placesLoved: 5 },
  { id: 'k5', name: 'Miriam',   initial: 'M', neighborhoods: ['Jackson Heights'], memberSince: 'March 2026', placesLoved: 17 },
  { id: 'k6', name: 'Renee',    initial: 'R', neighborhoods: ['Williamsburg'], memberSince: 'April 2026', placesLoved: 9 },
]

const SAVED_PLACES: SavedPlace[] = [
  { id: 'sp1', name: "Iya's Kitchen",    address: 'Bed-Stuy', ownership: ['black-owned', 'women-owned'],        kindredSaved: 4 },
  { id: 'sp2', name: 'Root & Ritual',   address: 'Crown Heights', ownership: ['queer-owned', 'black-owned'],   kindredSaved: 3 },
  { id: 'sp3', name: 'Sister Circle Books', address: 'Fort Greene', ownership: ['women-owned', 'black-owned'], kindredSaved: 5 },
  { id: 'sp4', name: 'Sol y Luna',       address: 'Bushwick', ownership: ['immigrant-owned', 'women-owned'],   kindredSaved: 2 },
  { id: 'sp5', name: "Noor's Threads",  address: 'Flatbush', ownership: ['immigrant-owned', 'women-owned'],    kindredSaved: 1 },
]

const LISTS: MapList[] = [
  { id: 'l1', name: 'Weeknight dinners', placeCount: 6, privacy: 'kindred', colors: ['#b87333','#c9a84c','#8a6a3a','#6d4c25'] },
  { id: 'l2', name: 'Solo sanctuaries',  placeCount: 4, privacy: 'just-me', colors: ['#6d8a5a','#8a9a7b','#4a6a4a','#3a5a3a'] },
  { id: 'l3', name: 'Show Luz around',   placeCount: 5, privacy: 'kindred', colors: ['#9a5a3a','#b87333','#8a6a3a','#c9a84c'] },
]

const IMPRINTS: Resonance[] = [
  { id: 'i1', business: "Iya's Kitchen",   text: "The jollof rice reminded me of my auntie's kitchen in Lagos. I almost cried in public.", date: 'Apr 3', felt: 4 },
  { id: 'i2', business: 'Root & Ritual',   text: "I didn't know I needed to breathe until someone gave me permission.", date: 'Mar 28', felt: 7 },
  { id: 'i3', business: 'Sister Circle Books', text: 'Found a Baldwin first edition I didn\'t know existed. Spent two hours on the floor reading.', date: 'Mar 15', felt: 6 },
]

const IDENTITY_LABELS: Record<string, string> = {
  'women-owned': 'Women-owned', 'queer-owned': 'Queer-owned',
  'black-owned': 'Black-owned', 'immigrant-owned': 'Immigrant-owned',
  'cooperative': 'Cooperative', 'worker-owned': 'Worker-owned',
}


// ─── Fade-in wrapper ──────────────────────────────────────────────────────

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// ─── ProfileHeader ────────────────────────────────────────────────────────

function ProfileHeader({
  name, bio, initials, neighborhoods, memberSince, isEditing, onEdit, onSave,
  onNameChange, onBioChange,
}: {
  name: string; bio: string; initials: string; neighborhoods: string[]
  memberSince: string; isEditing: boolean
  onEdit: () => void; onSave: () => void
  onNameChange: (v: string) => void; onBioChange: (v: string) => void
}) {
  return (
    <div className={styles.profileHeader}>
      <button className={isEditing ? styles.editSaveBtn : styles.editBtn} onClick={isEditing ? onSave : onEdit}>
        {isEditing ? 'Save' : (
          <>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5L10.5 3.5L4 10L1.5 10.5L2 8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            </svg>
            Edit
          </>
        )}
      </button>

      <div className={styles.avatarWrap}>
        <div className={styles.avatarCircle}>{initials}</div>
      </div>

      {isEditing ? (
        <input
          className={styles.memberNameInput}
          value={name}
          onChange={e => onNameChange(e.target.value)}
        />
      ) : (
        <h1 className={styles.memberName}>{name}</h1>
      )}

      {isEditing ? (
        <textarea
          className={styles.memberBioInput}
          value={bio}
          onChange={e => onBioChange(e.target.value)}
          rows={2}
        />
      ) : (
        <p className={styles.memberBio}>{bio}</p>
      )}

      {neighborhoods.length > 0 ? (
        <div className={styles.pillRow}>
          {neighborhoods.map(n => (
            <span key={n} className={styles.pill}>🌱 {n}</span>
          ))}
        </div>
      ) : (
        <button className={styles.pillEmpty}>
          + Choose your neighborhoods
        </button>
      )}

      <p className={styles.memberSince}>Planting since {memberSince}</p>
    </div>
  )
}

// ─── NeighborhoodSection ──────────────────────────────────────────────────

function NeighborhoodSection({
  neighborhoods,
  onChange,
}: {
  neighborhoods: string[]
  onChange: (next: string[]) => void
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [animating, setAnimating] = useState<string | null>(null)
  const [firstTime, setFirstTime] = useState(neighborhoods.length === 0)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return NEIGHBORHOODS.filter((n: string) => n.toLowerCase().includes(q) && !neighborhoods.includes(n))
  }, [search, neighborhoods])

  const add = (n: string) => {
    const isFirst = neighborhoods.length === 0
    setFirstTime(isFirst)
    setAnimating(n)
    setSearch('')
    setOpen(false)
    setTimeout(() => {
      onChange([...neighborhoods, n])
      setAnimating(null)
    }, 3200)
  }

  const remove = (n: string) => {
    onChange(neighborhoods.filter(x => x !== n))
  }

  return (
    <FadeIn>
      <div className={`${styles.section} ${styles.card}`}>
        <h2 className={styles.sectionTitle}>Where do your roots thrive?</h2>
        <p className={styles.sectionSubtext}>Every neighborhood you call home, equally</p>

        {animating ? (
          <div className={styles.rootsInlineWrap}>
            <RootsAnimation
              neighborhoods={[animating]}
              existingNeighborhoods={neighborhoods}
              variant="inline"
              context={firstTime ? 'first-ever' : 'adding'}
            />
          </div>
        ) : (
          <>
            {neighborhoods.length > 0 ? (
              <div className={styles.pillRow} style={{ marginBottom: 14 }}>
                {neighborhoods.map(n => (
                  <span key={n} className={styles.pill}>
                    🌱 {n}
                    <button className={styles.pillRemove} onClick={() => remove(n)}>×</button>
                  </span>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.seedEmoji}>🌱</span>
                <p>No roots planted yet.<br />Search to find your soil.</p>
              </div>
            )}

            <div ref={wrapRef}>
              <input
                className={styles.neighborhoodInput}
                type="text"
                placeholder="Search neighborhoods…"
                value={search}
                onChange={e => { setSearch(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                autoComplete="off"
              />
              {open && filtered.length > 0 && (
                <div className={styles.neighborhoodDropdown}>
                  {filtered.slice(0, 10).map((n: string) => (
                    <button
                      key={n}
                      type="button"
                      className={styles.neighborhoodOption}
                      onMouseDown={e => { e.preventDefault(); add(n) }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </FadeIn>
  )
}

// ─── KindredSection ───────────────────────────────────────────────────────

function KindredSection({
  kindred,
  onSelect,
}: {
  kindred: KindredMember[]
  onSelect: (m: KindredMember) => void
}) {
  const [noticeVisible, setNoticeVisible] = useState(true)

  return (
    <FadeIn delay={0.05}>
      <div className={`${styles.section} ${styles.card}`}>
        <h2 className={styles.sectionTitle}>Your kindred</h2>
        <p className={styles.sectionSubtext}>The people who shape what you see</p>

        <div className={styles.kindredScroll}>
          {kindred.map(m => (
            <div key={m.id} className={styles.kindredMember} onClick={() => onSelect(m)}>
              <div className={styles.kindredAvatar}>{m.initial}</div>
              <span className={styles.kindredName}>{m.name}</span>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <button className={styles.kindredAddBtn}>+</button>
            <span className={styles.kindredName} style={{ fontSize: '0.7rem' }}>Invite</span>
          </div>
        </div>

        <p className={styles.kindredCount}>{kindred.length} kindred</p>

        {noticeVisible && (
          <div className={styles.kindredNotice}>
            Kindred are mutual — when someone accepts your invitation, you become kindred to each other.
            No followers, no audiences. Just people who chose each other.
            <button className={styles.kindredNoticeClose} onClick={() => setNoticeVisible(false)}>
              Got it ✓
            </button>
          </div>
        )}
      </div>
    </FadeIn>
  )
}

// ─── GardenSection ────────────────────────────────────────────────────────

function GardenSection({ places, readOnly = false }: { places: SavedPlace[]; readOnly?: boolean }) {
  const [saved, setSaved] = useState(places)
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? saved : saved.slice(0, 4)

  return (
    <FadeIn delay={0.08}>
      <div className={`${styles.section} ${styles.card}`}>
        <h2 className={styles.sectionTitle}>Your garden</h2>
        <p className={styles.sectionSubtext}>{"Places you've gathered close"}</p>

        {saved.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.seedEmoji}>🌱</span>
            <p>Your garden is ready for seeds.<br />Start exploring the map.</p>
          </div>
        ) : (
          <>
            <div className={styles.gardenList}>
              {visible.map(p => (
                <div key={p.id} className={styles.gardenCard}>
                  <div className={styles.gardenCardInfo}>
                    <p className={styles.gardenName}>{p.name}</p>
                    <p className={styles.gardenMeta}>{p.address}</p>
                    <div className={styles.gardenTagRow}>
                      {p.ownership.map(tag => (
                        <span key={tag} className={styles.gardenTag}>
                          {IDENTITY_LABELS[tag] ?? tag}
                        </span>
                      ))}
                    </div>
                    {p.kindredSaved > 0 && (
                      <p className={styles.gardenKindredNote}>
                        🌱 {p.kindredSaved} of your kindred saved this too
                      </p>
                    )}
                  </div>
                  {!readOnly && (
                    <button className={styles.unsaveBtn} onClick={() => setSaved(prev => prev.filter(x => x.id !== p.id))}>
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!showAll && saved.length > 4 && (
              <button className={styles.seeAllBtn} onClick={() => setShowAll(true)}>
                See all in your garden ({saved.length}) →
              </button>
            )}
          </>
        )}
      </div>
    </FadeIn>
  )
}

// ─── ListsSection ─────────────────────────────────────────────────────────

function ListsSection({ lists, readOnly = false }: { lists: MapList[]; readOnly?: boolean }) {
  const visible = readOnly ? lists.filter(l => l.privacy === 'kindred') : lists

  return (
    <FadeIn delay={0.1}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ padding: '0 2px' }}>Your lists</h2>
        <p className={styles.sectionSubtext} style={{ padding: '0 2px' }}>Curated corners of the city</p>

        {visible.length === 0 && readOnly ? null : (
          <div className={styles.listsScroll}>
            {visible.map(l => (
              <div key={l.id} className={styles.listCard}>
                <div className={styles.listMosaic}>
                  {l.colors.map((c, i) => (
                    <div key={i} className={styles.listMosaicBlock} style={{ background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <p className={styles.listName}>{l.name}</p>
                <div className={styles.listMeta}>
                  <span>{l.placeCount} places</span>
                  <span>·</span>
                  {l.privacy === 'just-me' ? (
                    <span>🔒 Just me</span>
                  ) : (
                    <span>🌿 Shared with kindred</span>
                  )}
                </div>
              </div>
            ))}
            {!readOnly && (
              <button className={styles.listCardNew}>
                <span style={{ fontSize: '1.3rem' }}>+</span>
                <span style={{ fontSize: '0.8rem' }}>Create list</span>
              </button>
            )}
          </div>
        )}

        {visible.length === 0 && !readOnly && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📋</span>
            <p>Start a list — your favorite coffee walks, date night spots, places to show someone new around.</p>
          </div>
        )}
      </div>
    </FadeIn>
  )
}

// ─── ResonanceSection ───────────────────────────────────────────────────────

function ResonanceSection({ resonances }: { resonances: Resonance[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? resonances : resonances.slice(0, 3)

  return (
    <FadeIn delay={0.12}>
      <div className={`${styles.section} ${styles.card}`}>
        <h2 className={styles.sectionTitle}>Your resonance</h2>
        <p className={styles.sectionSubtext}>{"Words you've left behind"}</p>

        {resonances.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.seedEmoji}>✍️</span>
            <p>{"You haven't left any resonances yet."}<br />{"Visit a place, feel something, share it."}</p>
          </div>
        ) : (
          <>
            <div className={styles.resonanceList}>
              {visible.map(imp => (
                <div key={imp.id} className={styles.resonanceCard}>
                  <p className={styles.resonanceBusiness}>{imp.business}</p>
                  <p className={styles.resonanceText}>{'"'}{imp.text}{'"'}</p>
                  <div className={styles.resonanceMeta}>
                    <span>{imp.date}</span>
                    <span>·</span>
                    <span className={styles.resonanceResonance}>
                      🌱 {imp.felt} people felt this
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {!showAll && resonances.length > 3 && (
              <button className={styles.seeAllBtn} onClick={() => setShowAll(true)}>
                See all your resonances →
              </button>
            )}
          </>
        )}
      </div>
    </FadeIn>
  )
}

// ─── SeasonsSection ───────────────────────────────────────────────────────

function SeasonsSection() {
  const cards = [
    {
      id: 'harvest', title: 'Your harvest',
      content: (
        <div className={styles.seasonStatsRow}>
          {[
            { n: '23', label: 'places visited' },
            { n: '8',  label: 'new discoveries' },
            { n: '5',  label: 'saved to garden' },
          ].map(s => (
            <div key={s.label} className={styles.seasonStatBlock}>
              <p className={styles.seasonStat}>{s.n}</p>
              <p className={styles.seasonStatLabel}>{s.label}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'soil', title: 'Your soil',
      content: (
        <div className={styles.seasonList}>
          {[
            { name: 'Bed-Stuy', count: 14 },
            { name: 'Fort Greene', count: 9 },
          ].map(n => (
            <div key={n.name} className={styles.seasonListItem}>
              <span>🌱 {n.name}</span>
              <span className={styles.seasonListCount}>{n.count} visits</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'rhythm', title: 'Your rhythm',
      content: (
        <>
          <div className={styles.seasonList}>
            {[
              { label: 'Shared meals',   count: 9 },
              { label: 'Learning',       count: 6 },
              { label: 'Quiet corners',  count: 5 },
            ].map(r => (
              <div key={r.label} className={styles.seasonListItem}>
                <span>{r.label}</span>
                <span className={styles.seasonListCount}>{r.count}×</span>
              </div>
            ))}
          </div>
          <p className={styles.seasonSubtext}>
            {`"You're drawn to learning and breaking bread."`}
          </p>
        </>
      ),
    },
    {
      id: 'roots', title: 'Your roots run deep',
      content: (
        <div className={styles.seasonList}>
          {[
            { name: "Iya's Kitchen",   visits: 6 },
            { name: 'Sister Circle Books', visits: 5 },
            { name: 'Sol y Luna',      visits: 4 },
          ].map(p => (
            <div key={p.name} className={styles.seasonListItem}>
              <span>{p.name}</span>
              <span className={styles.seasonListCount}>{p.visits}×</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'kindred', title: 'Your kindred in bloom',
      content: (
        <>
          <div className={styles.seasonList}>
            <div className={styles.seasonListItem}>
              <span>New kindred</span>
              <span className={styles.seasonListCount}>3</span>
            </div>
            <div className={styles.seasonListItem}>
              <span>Discovered through kindred</span>
              <span className={styles.seasonListCount}>7 places</span>
            </div>
          </div>
          <p className={styles.seasonSubtext}>{'"Luz led you to 3 new places."'}</p>
        </>
      ),
    },
  ]

  return (
    <FadeIn delay={0.14}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ padding: '0 2px' }}>Your seasons</h2>
        <div className={styles.sectionSubtext} style={{ padding: '0 2px', marginBottom: 14 }}>
          A portrait of how you move through community
        </div>
        <div style={{ padding: '0 2px', marginBottom: 10 }}>
          <span className={styles.seasonLabel}>Spring 2026</span>
        </div>
        <div className={styles.seasonsScroll}>
          {cards.map(c => (
            <div key={c.id} className={styles.seasonCard}>
              <p className={styles.seasonCardTitle}>{c.title}</p>
              {c.content}
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,220,170,0.25)', marginTop: 10, padding: '0 2px' }}>
          Share your seasons — coming soon
        </p>
      </div>
    </FadeIn>
  )
}

// ─── SettingsSection ──────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      className={`${styles.settingsToggle} ${on ? styles.settingsToggleOn : ''}`}
      onClick={onToggle}
      aria-pressed={on}
    >
      <div className={`${styles.settingsToggleKnob} ${on ? styles.settingsToggleOnKnob : ''}`} />
    </button>
  )
}

function SettingsSection({ onLogout }: { onLogout: () => void }) {
  const [notifs, setNotifs] = useState(true)
  const [kindredActivity, setKindredActivity] = useState(true)
  const [gardenPrivacy, setGardenPrivacy] = useState<'kindred' | 'just-me'>('kindred')
  const [resonancePrivacy, setResonancePrivacy] = useState<'kindred' | 'just-me'>('kindred')

  return (
    <FadeIn delay={0.16}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ padding: '0 2px', marginBottom: 10 }}>Settings</h2>
        <div className={styles.settingsCard}>
          <div className={styles.settingsRow}>
            <div>
              <p className={styles.settingsLabel}>Notifications</p>
              <p className={styles.settingsSublabel}>New kindred, resonance replies</p>
            </div>
            <Toggle on={notifs} onToggle={() => setNotifs(v => !v)} />
          </div>
          <div className={styles.settingsRow}>
            <div>
              <p className={styles.settingsLabel}>Kindred activity</p>
              <p className={styles.settingsSublabel}>When someone saves the same place</p>
            </div>
            <Toggle on={kindredActivity} onToggle={() => setKindredActivity(v => !v)} />
          </div>
          <div className={styles.settingsRow}>
            <div>
              <p className={styles.settingsLabel}>Garden visibility</p>
              <p className={styles.settingsSublabel}>Who sees your saved places</p>
            </div>
            <select
              className={styles.settingsSelect}
              value={gardenPrivacy}
              onChange={e => setGardenPrivacy(e.target.value as 'kindred' | 'just-me')}
            >
              <option value="kindred">Your kindred</option>
              <option value="just-me">Just me</option>
            </select>
          </div>
          <div className={styles.settingsRow}>
            <div>
              <p className={styles.settingsLabel}>Resonance visibility</p>
              <p className={styles.settingsSublabel}>Who sees your resonance notes</p>
            </div>
            <select
              className={styles.settingsSelect}
              value={resonancePrivacy}
              onChange={e => setResonancePrivacy(e.target.value as 'kindred' | 'just-me')}
            >
              <option value="kindred">Your kindred</option>
              <option value="just-me">Just me</option>
            </select>
          </div>
          <div className={styles.settingsRow}>
            <div>
              <p className={styles.settingsLabel}>Membership</p>
            </div>
            <span className={styles.membershipBadge}>Founding member</span>
          </div>
          <div className={styles.settingsRow}>
            <button className={styles.logoutBtn} onClick={onLogout}>Log out</button>
          </div>
          <div className={styles.settingsRow}>
            <button className={styles.deleteBtn}>Delete account</button>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

// ─── KindredProfileView ───────────────────────────────────────────────────

function KindredProfileView({
  member,
  onBack,
}: {
  member: KindredMember
  onBack: () => void
}) {
  return (
    <motion.div
      className={styles.kindredOverlay}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
    >
      <div className={styles.topBar} style={{ position: 'sticky', top: 0, zIndex: 20 }}>
        <button className={styles.topBarBack} onClick={onBack}>
          ← Back
        </button>
        <span className={styles.topBarTitle}>{member.name}</span>
        <div style={{ width: 60 }} />
      </div>

      <div className={styles.kindredOverlayInner}>
        {/* Their header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatarCircle}>{member.initial}</div>
          </div>
          <h1 className={styles.memberName}>{member.name}</h1>
          <div className={styles.pillRow}>
            {member.neighborhoods.map(n => (
              <span key={n} className={styles.pill}>🌱 {n}</span>
            ))}
          </div>
          <p className={styles.memberSince}>Planting since {member.memberSince}</p>
        </div>

        {/* Their garden (same component, read-only) */}
        <GardenSection places={SAVED_PLACES.slice(0, 3)} readOnly />

        {/* Their lists (kindred-visible only) */}
        <ListsSection lists={LISTS} readOnly />

        {/* Their resonances */}
        <ResonanceSection resonances={IMPRINTS.slice(0, 2)} />

        {/* Remove kindred */}
        <FadeIn>
          <div className={styles.section} style={{ textAlign: 'center', paddingBottom: 20 }}>
            <button
              className={styles.deleteBtn}
              style={{ fontSize: '0.82rem' }}
              onClick={() => {
                if (confirm(`You'll no longer see each other's profiles or recommendations. You can always reconnect later.`)) {
                  onBack()
                }
              }}
            >
              Remove from kindred
            </button>
          </div>
        </FadeIn>
      </div>

      <BottomNav active="profile" />
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState(MEMBER.name)
  const [bio, setBio] = useState(MEMBER.bio)
  const [neighborhoods, setNeighborhoods] = useState(MEMBER.neighborhoods)
  const [isEditing, setIsEditing] = useState(false)
  const [viewingKindred, setViewingKindred] = useState<KindredMember | null>(null)

  useEffect(() => {
    getSupabaseClient().auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth')
      else setLoading(false)
    })
  }, [router])

  const handleLogout = useCallback(async () => {
    await getSupabaseClient().auth.signOut()
    router.push('/auth')
  }, [router])

  const handleNeighborhoodChange = useCallback((next: string[]) => {
    setNeighborhoods(next)
  }, [])

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
          <span className={styles.topBarWordmark}>SOW</span>
          <div />
        </div>

        <div className={styles.inner}>
          <FadeIn>
            <ProfileHeader
              name={name}
              bio={bio}
              initials={MEMBER.initials}
              neighborhoods={neighborhoods}
              memberSince={MEMBER.memberSince}
              isEditing={isEditing}
              onEdit={() => setIsEditing(true)}
              onSave={() => setIsEditing(false)}
              onNameChange={setName}
              onBioChange={setBio}
            />
          </FadeIn>

          <NeighborhoodSection
            neighborhoods={neighborhoods}
            onChange={handleNeighborhoodChange}
          />

          <KindredSection
            kindred={KINDRED}
            onSelect={setViewingKindred}
          />

          <GardenSection places={SAVED_PLACES} />

          <ListsSection lists={LISTS} />

          <ResonanceSection resonances={IMPRINTS} />

          <SeasonsSection />

          <SettingsSection onLogout={handleLogout} />

          <div style={{ height: 32 }} />
        </div>
      </div>

      <BottomNav active="profile" />

      {/* Kindred profile overlay */}
      <AnimatePresence>
        {viewingKindred && (
          <KindredProfileView
            member={viewingKindred}
            onBack={() => setViewingKindred(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
