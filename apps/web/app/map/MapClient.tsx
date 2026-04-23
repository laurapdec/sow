'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Map, { Marker } from 'react-map-gl/mapbox'
import type { Map as MapboxMap } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { AnimatePresence, motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import styles from './map.module.css'

// ─── Types ─────────────────────────────────────────────────────────────────

interface Business {
  id: string
  name: string
  description: string | null
  address: string | null
  category: string | null
  website: string | null
  ownership: string[]
  photos: string[]
  latitude: number
  longitude: number
  created_by: string | null
  story?: string | null
  resonance?: number
}

type PendingPin = { lat: number; lng: number }

// ─── Config ─────────────────────────────────────────────────────────────────

const IDENTITY_OPTIONS = [
  { value: 'women-owned',     label: 'Women-owned' },
  { value: 'queer-owned',     label: 'Queer-owned' },
  { value: 'black-owned',     label: 'Black-owned' },
  { value: 'immigrant-owned', label: 'Immigrant-owned' },
  { value: 'cooperative',     label: 'Cooperative' },
  { value: 'worker-owned',    label: 'Worker-owned' },
]

const CATEGORY_OPTIONS = [
  { value: 'food',             label: 'Food' },
  { value: 'wellness',         label: 'Wellness' },
  { value: 'art',              label: 'Art' },
  { value: 'services',         label: 'Services' },
  { value: 'nightlife',        label: 'Nightlife' },
  { value: 'retail',           label: 'Retail' },
  { value: 'community-space',  label: 'Community' },
]

const CIRCLE_INITIALS = ['T', 'A', 'M', 'J', 'R', 'S']

// ─── Placeholder businesses ─────────────────────────────────────────────────

const PLACEHOLDER_BUSINESSES: Business[] = [
  {
    id: 'ph-1', name: "Iya's Kitchen",
    description: 'Soul food rooted in love and tradition.',
    address: 'Bed-Stuy, Brooklyn', category: 'food', website: null,
    ownership: ['black-owned', 'women-owned'], photos: [],
    latitude: 40.6826, longitude: -73.9443, created_by: null,
    story: 'Iya means mother in Yoruba. Every dish is a hug from home.',
    resonance: 47,
  },
  {
    id: 'ph-2', name: 'Lavender & Thyme',
    description: 'Plant shop and botanical apothecary.',
    address: 'West Village, Manhattan', category: 'retail', website: null,
    ownership: ['queer-owned', 'women-owned'], photos: [],
    latitude: 40.7337, longitude: -74.0043, created_by: null,
    story: 'We believe every living thing deserves tenderness.',
    resonance: 32,
  },
  {
    id: 'ph-3', name: 'Manos del Pueblo',
    description: 'Traditional Mexican bakery and gathering space.',
    address: 'Jackson Heights, Queens', category: 'food', website: null,
    ownership: ['immigrant-owned', 'cooperative'], photos: [],
    latitude: 40.7484, longitude: -73.8839, created_by: null,
    story: 'Four women from Puebla, baking the bread of home.',
    resonance: 58,
  },
  {
    id: 'ph-4', name: 'The Copper Needle',
    description: 'Custom tailoring and alterations.',
    address: 'Harlem, Manhattan', category: 'services', website: null,
    ownership: ['women-owned'], photos: [],
    latitude: 40.8116, longitude: -73.9465, created_by: null,
    story: 'Three generations of stitching stories into fabric.',
    resonance: 29,
  },
  {
    id: 'ph-5', name: 'Root & Ritual',
    description: 'Holistic wellness studio and healing space.',
    address: 'Crown Heights, Brooklyn', category: 'wellness', website: null,
    ownership: ['queer-owned', 'black-owned'], photos: [],
    latitude: 40.6712, longitude: -73.9438, created_by: null,
    story: 'Healing is remembering what your body already knows.',
    resonance: 71,
  },
  {
    id: 'ph-6', name: "Noor's Threads",
    description: 'Hand-woven textiles and fabric art.',
    address: 'Flatbush, Brooklyn', category: 'retail', website: null,
    ownership: ['immigrant-owned', 'women-owned'], photos: [],
    latitude: 40.6501, longitude: -73.9547, created_by: null,
    story: 'Patterns carried across the ocean, sewn into Brooklyn.',
    resonance: 38,
  },
  {
    id: 'ph-7', name: 'Sister Circle Books',
    description: 'Independent bookstore celebrating Black women\'s literature.',
    address: 'Fort Greene, Brooklyn', category: 'retail', website: null,
    ownership: ['women-owned', 'black-owned'], photos: [],
    latitude: 40.6894, longitude: -73.9743, created_by: null,
    story: 'Every shelf is a conversation waiting to happen.',
    resonance: 62,
  },
  {
    id: 'ph-8', name: 'Sol y Luna',
    description: 'Coffee bar and Latin American community café.',
    address: 'Bushwick, Brooklyn', category: 'food', website: null,
    ownership: ['immigrant-owned', 'women-owned'], photos: [],
    latitude: 40.7049, longitude: -73.9175, created_by: null,
    story: "Coffee from our grandmother's mountain, brewed with love.",
    resonance: 44,
  },
]

// ─── Seed marker ─────────────────────────────────────────────────────────────

function SeedMarker({ ownership = [], selected = false }: { ownership?: string[]; selected?: boolean }) {
  const w = selected ? 44 : 34
  const h = selected ? 55 : 42

  const badgeChar = ownership.includes('queer-owned')    ? '◐'
    : ownership.includes('black-owned')      ? '✦'
    : ownership.includes('immigrant-owned')  ? '★'
    : ownership.includes('cooperative')      ? '⊕'
    : ownership.includes('worker-owned')     ? '◈'
    : null

  return (
    <div style={{
      width: w, height: h, cursor: 'pointer',
      filter: selected
        ? 'drop-shadow(0 0 8px rgba(201,168,76,0.75))'
        : 'drop-shadow(0 2px 5px rgba(0,0,0,0.38))',
    }}>
      <svg width={w} height={h} viewBox="0 0 32 40" fill="none">
        {selected && (
          <circle cx="16" cy="13" r="15.5"
            fill="rgba(201,168,76,0.22)"
            stroke="rgba(201,168,76,0.55)"
            strokeWidth="1"
          />
        )}
        <path
          d="M16 37C8.5 27.5 4 21 4 13.5C4 7.1 9.4 2 16 2C22.6 2 28 7.1 28 13.5C28 21 23.5 27.5 16 37Z"
          fill={selected ? '#c9a84c' : '#b87333'}
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="1.5"
        />
        <circle cx="16" cy="13" r="5.5" fill="rgba(255,255,255,0.2)" />
        {badgeChar && (
          <text
            x="16" y="15.5"
            textAnchor="middle"
            fontSize="6.5"
            fill="rgba(255,255,255,0.88)"
            fontFamily="sans-serif"
          >
            {badgeChar}
          </text>
        )}
      </svg>
    </div>
  )
}

// ─── Nav icons ────────────────────────────────────────────────────────────────

function MapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2C7.1 2 4 5.1 4 9C4 14.5 11 20 11 20C11 20 18 14.5 18 9C18 5.1 14.9 2 11 2Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="11" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function EventsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3" y1="8.5" x2="19" y2="8.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7" y1="2" x2="7" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="2" x2="15" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="13.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

function OfferingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3C11 3 6.5 6.5 6.5 10.5C6.5 13.2 8.5 15 11 15C13.5 15 15.5 13.2 15.5 10.5C15.5 6.5 11 3 11 3Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="11" y1="15" x2="11" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7.5" y1="19" x2="14.5" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GardenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <line x1="11" y1="19" x2="11" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 10C11 10 8 8 6 5C9.5 4 12.5 6.5 11 10Z"
        stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M11 13.5C11 13.5 14 11.5 16.5 8.5C13 7.5 9.5 10 11 13.5Z"
        stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 19C4 15.7 7.1 13 11 13C14.9 13 18 15.7 18 19"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Supabase helper ──────────────────────────────────────────────────────────

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MapClient() {
  const [places, setPlaces] = useState<Business[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  const [activeIdentity, setActiveIdentity] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)

  const [adding, setAdding] = useState(false)
  const [pending, setPending] = useState<PendingPin | null>(null)
  const [pendingName, setPendingName] = useState('')
  const [pendingDesc, setPendingDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const [selected, setSelected] = useState<Business | null>(null)
  const router = useRouter()
  const [activeNav, setActiveNav] = useState('map')
  const [search, setSearch] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sb = getSupabase()
    sb.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
      setUserName(data.user?.user_metadata?.name ?? null)
    })
    sb.from('places')
      .select('id, name, description, address, category, website, ownership, photos, latitude, longitude, created_by')
      .then(({ data }) => { if (data) setPlaces(data) })
  }, [])

  // Warm the map style — recolor key layers to match the brand palette
  const handleMapLoad = useCallback((e: { target: MapboxMap }) => {
    const map = e.target
    const safe = (fn: () => void) => { try { fn() } catch { /* layer may not exist */ } }

    safe(() => map.setPaintProperty('background', 'background-color', '#f0e6d3'))
    safe(() => map.setPaintProperty('water', 'fill-color', '#c4b09a'))
    safe(() => map.setPaintProperty('waterway', 'line-color', '#c4b09a'))
    safe(() => map.setPaintProperty('national-park', 'fill-color', '#8a9a7b'))
    safe(() => map.setPaintProperty('national-park', 'fill-opacity', 0.65))
    safe(() => map.setPaintProperty('landuse', 'fill-color', [
      'match', ['get', 'class'],
      'park', '#8a9a7b',
      'grass', '#9aaa8b',
      'cemetery', '#a4a898',
      'hospital', '#e8d5c4',
      'school', '#e8d5c4',
      '#ece0ce',
    ]))
    safe(() => map.setPaintProperty('building', 'fill-color', '#e0d4c4'))
    safe(() => map.setPaintProperty('building', 'fill-opacity', 0.65))
    safe(() => map.setPaintProperty('building-outline', 'line-color', '#cec0aa'))

    const layers = map.getStyle()?.layers ?? []
    layers.forEach((layer: { id: string; type: string }) => {
      // Road lines
      if (
        (layer.id.startsWith('road-') || layer.id.startsWith('tunnel-') || layer.id.startsWith('bridge-')) &&
        layer.type === 'line'
      ) {
        const isHighway = layer.id.includes('motorway') || layer.id.includes('trunk')
        const isPrimary = layer.id.includes('primary')
        const isCase = layer.id.includes('-case')
        const color = isCase ? '#c0aa90'
          : isHighway ? '#c4a882'
          : isPrimary ? '#d0bc9a'
          : '#ddd0be'
        safe(() => map.setPaintProperty(layer.id, 'line-color', color))
      }
      // All text labels
      if (layer.type === 'symbol') {
        safe(() => map.setPaintProperty(layer.id, 'text-color', '#5a3a2a'))
        safe(() => map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(240,230,210,0.88)'))
      }
    })
  }, [])

  const toggleIdentity = useCallback((v: string) => setActiveIdentity(prev => {
    const n = new Set(prev)
    if (n.has(v)) { n.delete(v) } else { n.add(v) }
    return n
  }), [])

  const toggleCategory = useCallback((v: string) => setActiveCategory(prev => {
    const n = new Set(prev)
    if (n.has(v)) { n.delete(v) } else { n.add(v) }
    return n
  }), [])

  const activeCount = activeIdentity.size + activeCategory.size

  const allBusinesses = useMemo(
    () => [...PLACEHOLDER_BUSINESSES, ...places],
    [places]
  )

  const visibleBusinesses = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allBusinesses.filter(b => {
      const idOk = activeIdentity.size === 0 || (b.ownership ?? []).some(o => activeIdentity.has(o))
      const catOk = activeCategory.size === 0 || activeCategory.has(b.category ?? '')
      const searchOk = !q || b.name.toLowerCase().includes(q) || b.address?.toLowerCase().includes(q)
      return idOk && catOk && searchOk
    })
  }, [allBusinesses, activeIdentity, activeCategory, search])

  const handleMapClick = useCallback((e: { lngLat: { lng: number; lat: number } }) => {
    if (!adding) return
    setPending({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    setAdding(false)
  }, [adding])

  const savePlace = async () => {
    if (!pending || !pendingName.trim()) return
    setSaving(true)
    const sb = getSupabase()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { setSaving(false); return }
    const { data, error } = await sb.from('places').insert({
      name: pendingName.trim(),
      description: pendingDesc.trim() || null,
      latitude: pending.lat,
      longitude: pending.lng,
      created_by: user.id,
    }).select('id, name, description, address, category, website, ownership, photos, latitude, longitude, created_by').single()
    if (!error && data) setPlaces(prev => [...prev, data])
    setPending(null); setPendingName(''); setPendingDesc(''); setSaving(false)
  }

  const deletePlace = async (b: Business) => {
    if (!confirm(`Remove "${b.name}"?`)) return
    const { error } = await getSupabase().from('places').delete().eq('id', b.id)
    if (!error) { setPlaces(prev => prev.filter(p => p.id !== b.id)); setSelected(null) }
  }

  const cancelPending = () => { setPending(null); setPendingName(''); setPendingDesc('') }

  const avatarInitial = userName
    ? (userName[0] ?? '?').toUpperCase()
    : userId
      ? (userId[0] ?? '?').toUpperCase()
      : '?'

  const navItems = [
    { id: 'map',       label: 'Map',       href: '/map',     Icon: MapIcon },
    { id: 'events',    label: 'Events',    href: '/events',  Icon: EventsIcon },
    { id: 'offerings', label: 'Offerings', href: '/offerings', Icon: OfferingsIcon },
    { id: 'garden',    label: 'Garden',    href: '/profile', Icon: GardenIcon },
    { id: 'profile',   label: 'Profile',   href: '/profile', Icon: ProfileIcon },
  ]

  return (
    <div className={styles.root}>

      {/* ── Map ── */}
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ longitude: -73.96, latitude: 40.72, zoom: 11.5 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        cursor={adding ? 'crosshair' : 'grab'}
      >
        {visibleBusinesses.map(b => {
          const isSelected = selected?.id === b.id
          return (
            <Marker
              key={b.id}
              longitude={b.longitude}
              latitude={b.latitude}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation()
                setSelected(b)
                setPending(null)
                setAdding(false)
                setFilterOpen(false)
              }}
            >
              <SeedMarker ownership={b.ownership} selected={isSelected} />
            </Marker>
          )
        })}

        {pending && (
          <Marker longitude={pending.lng} latitude={pending.lat} anchor="bottom">
            <SeedMarker ownership={[]} selected />
          </Marker>
        )}
      </Map>

      {/* ── Top bar ── */}
      <header className={styles.topBar}>
        <span className={styles.wordmark}>SOW</span>
        <input
          className={styles.searchPill}
          type="text"
          placeholder="Find a place, a skill, a gathering…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.avatar} onClick={() => router.push('/profile')}>{avatarInitial}</div>
      </header>

      {/* ── Filter button ── */}
      <button
        className={`${styles.filterBtn} ${filterOpen || activeCount > 0 ? styles.filterBtnActive : ''}`}
        onClick={() => setFilterOpen(v => !v)}
        aria-label="Open filters"
        style={{ position: 'fixed' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <line x1="2" y1="4.5" x2="16" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4.5" y1="9" x2="13.5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="7" y1="13.5" x2="11" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {activeCount > 0 && <span className={styles.filterBadge}>{activeCount}</span>}
      </button>

      {/* ── Filter backdrop ── */}
      {filterOpen && (
        <div className={styles.filterBackdrop} onClick={() => setFilterOpen(false)} />
      )}

      {/* ── Filter panel ── */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            className={styles.filterPanel}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <h2 className={styles.filterTitle}>What resonates<br />with you?</h2>

            <p className={styles.filterSectionTitle}>Community</p>
            <div className={styles.chipRow}>
              {IDENTITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`${styles.chip} ${activeIdentity.has(opt.value) ? styles.chipActive : ''}`}
                  onClick={() => toggleIdentity(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <p className={styles.filterSectionTitle}>Category</p>
            <div className={styles.chipRow}>
              {CATEGORY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`${styles.catChip} ${activeCategory.has(opt.value) ? styles.catChipActive : ''}`}
                  onClick={() => toggleCategory(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {activeCount > 0 && (
              <button
                className={styles.clearBtn}
                onClick={() => { setActiveIdentity(new Set()); setActiveCategory(new Set()) }}
              >
                Clear all
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Business card ── */}
      <AnimatePresence>
        {selected && !pending && (
          <motion.div
            className={styles.businessCard}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            <div className={styles.cardHandle} />
            <div className={styles.cardInner}>

              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.businessName}>{selected.name}</h2>
                  {selected.address && (
                    <p className={styles.businessAddress}>{selected.address}</p>
                  )}
                </div>
                <button className={styles.closeBtn} onClick={() => setSelected(null)}>×</button>
              </div>

              {selected.ownership?.length > 0 && (
                <div className={styles.identityPills}>
                  {selected.ownership.map(tag => {
                    const opt = IDENTITY_OPTIONS.find(o => o.value === tag)
                    return (
                      <span key={tag} className={styles.pill}>
                        {opt?.label ?? tag}
                      </span>
                    )
                  })}
                </div>
              )}

              {selected.resonance !== undefined && (
                <div className={styles.resonanceRow}>
                  <span className={styles.resonanceCount}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M7 12.5C4.2 9.2 2 7 2 4.8C2 3.2 3.3 2 5 2C5.9 2 6.6 2.4 7 3C7.4 2.4 8.1 2 9 2C10.7 2 12 3.2 12 4.8C12 7 9.8 9.2 7 12.5Z"
                        fill="#c9a84c" opacity="0.85"
                      />
                    </svg>
                    {selected.resonance} resonating
                  </span>
                </div>
              )}

              <div className={styles.circleRow}>
                <div className={styles.circleAvatars}>
                  {CIRCLE_INITIALS.slice(0, 3).map((init, i) => (
                    <div key={i} className={styles.circleAvatar}>{init}</div>
                  ))}
                </div>
                <span className={styles.circleText}>Loved by 3 in your circle</span>
              </div>

              {(selected.story || selected.description) && (
                <p className={styles.storyText}>
                  &ldquo;{selected.story ?? selected.description}&rdquo;
                </p>
              )}

              <div className={styles.cardActions}>
                <button className={styles.saveBtn}>Save to garden</button>
                <button className={styles.shareBtn}>Share with circle</button>
              </div>

              {selected.created_by === userId && (
                <button className={styles.deleteBtn} onClick={() => deletePlace(selected)}>
                  Remove this place
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pin a place button ── */}
      <AnimatePresence>
        {!pending && !selected && !adding && (
          <motion.button
            className={styles.pinBtn}
            onClick={() => setAdding(true)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
              <path
                d="M7 17C4.5 13.5 1.5 10.5 1.5 6.5C1.5 3.5 4 1 7 1C10 1 12.5 3.5 12.5 6.5C12.5 10.5 9.5 13.5 7 17Z"
                fill="currentColor" opacity="0.85"
              />
              <circle cx="7" cy="6.5" r="2" fill="rgba(58,26,8,0.4)" />
            </svg>
            Pin a place
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Adding hint ── */}
      <AnimatePresence>
        {adding && !pending && (
          <motion.div
            className={styles.addingHint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            Tap the map to drop a pin
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pending form ── */}
      <AnimatePresence>
        {pending && (
          <motion.div
            className={styles.pendingForm}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            <p className={styles.pendingTitle}>Name this place</p>
            <input
              autoFocus
              className={styles.formInput}
              placeholder="e.g. Best coffee in the neighborhood"
              value={pendingName}
              onChange={e => setPendingName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && savePlace()}
            />
            <textarea
              className={styles.formTextarea}
              placeholder="Tell us about this place (optional)"
              value={pendingDesc}
              onChange={e => setPendingDesc(e.target.value)}
              rows={2}
            />
            <div className={styles.formActions}>
              <button className={styles.cancelBtn} onClick={cancelPending}>Cancel</button>
              <button
                className={styles.savePlaceBtn}
                onClick={savePlace}
                disabled={!pendingName.trim() || saving}
              >
                {saving ? 'Saving…' : 'Save place'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom nav ── */}
      <nav className={styles.bottomNav}>
        {navItems.map(({ id, label, href, Icon }) => (
          <button
            key={id}
            className={`${styles.navItem} ${activeNav === id ? styles.navItemActive : ''}`}
            onClick={() => { setActiveNav(id); router.push(href) }}
          >
            <span className={styles.navIcon}><Icon /></span>
            <span className={styles.navLabel}>{label}</span>
          </button>
        ))}
      </nav>

      {/* Hidden file input kept for future photo upload */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} />
    </div>
  )
}
