'use client'

import { useRouter } from 'next/navigation'
import styles from './BottomNav.module.css'

function MapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2C7.1 2 4 5.1 4 9C4 14.5 11 20 11 20C11 20 18 14.5 18 9C18 5.1 14.9 2 11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="11" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function EventsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="3" y1="8.5" x2="19" y2="8.5" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="7" y1="2" x2="7" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="2" x2="15" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="11" cy="13.5" r="1.5" fill="currentColor"/>
    </svg>
  )
}

function OfferingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3C11 3 6.5 6.5 6.5 10.5C6.5 13.2 8.5 15 11 15C13.5 15 15.5 13.2 15.5 10.5C15.5 6.5 11 3 11 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <line x1="11" y1="15" x2="11" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7.5" y1="19" x2="14.5" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function GardenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <line x1="11" y1="19" x2="11" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M11 10C11 10 8 8 6 5C9.5 4 12.5 6.5 11 10Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
      <path d="M11 13.5C11 13.5 14 11.5 16.5 8.5C13 7.5 9.5 10 11 13.5Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 19C4 15.7 7.1 13 11 13C14.9 13 18 15.7 18 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

const NAV_ITEMS = [
  { id: 'map',       label: 'Map',       href: '/map',       Icon: MapIcon },
  { id: 'events',    label: 'Events',    href: '/events',    Icon: EventsIcon },
  { id: 'offerings', label: 'Offerings', href: '/offerings', Icon: OfferingsIcon },
  { id: 'garden',    label: 'Garden',    href: '/garden',    Icon: GardenIcon },
  { id: 'profile',   label: 'Profile',   href: '/profile',   Icon: ProfileIcon },
]

export default function BottomNav({ active }: { active: string }) {
  const router = useRouter()
  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map(({ id, label, href, Icon }) => (
        <button
          key={id}
          className={`${styles.navItem} ${active === id ? styles.navItemActive : ''}`}
          onClick={() => router.push(href)}
        >
          <span className={styles.navIcon}><Icon /></span>
          <span className={styles.navLabel}>{label}</span>
        </button>
      ))}
    </nav>
  )
}
