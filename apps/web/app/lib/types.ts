// Shared domain types used across multiple pages/components.
// Page-specific types stay in their own files.

export interface Business {
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

export interface Member {
  id: string
  name: string
  email: string
  neighborhoods: string[]
  avatar_url?: string | null
}

export type EventType =
  | 'gathering'
  | 'skillshare'
  | 'mutual-aid'
  | 'celebration'
  | 'healing'
  | 'creative'

export type OfferingCategory =
  | 'skill'
  | 'time'
  | 'resource'
  | 'space'
  | 'knowledge'
  | 'care'
