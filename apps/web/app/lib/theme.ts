// Single source of truth for all design tokens.
// TSX files import from here; CSS modules use var(--token-name) from globals.css.

export const colors = {
  background:    '#802f1f',
  copper:        '#b87333',
  copperHover:   '#c9843f',
  gold:          '#c9a84c',
  goldHover:     '#d4b660',
  goldStar:      '#f5c842',
  cream:         '#f5e6d3',
  deepDark:      '#3a1a08',
  darkBg:        '#5a1f10',
  seedlingGreen: '#6d8a5a',
  error:         '#e07a5f',

  // Semantic text aliases
  textPrimary:   'rgba(255, 220, 170, 0.95)',
  textSecondary: 'rgba(255, 220, 170, 0.7)',
  textMuted:     'rgba(255, 220, 170, 0.45)',
  textHint:      'rgba(255, 220, 170, 0.28)',

  // Copper tones for borders/glass
  copperBorder:  'rgba(184, 115, 51, 0.25)',
  copperGlass:   'rgba(184, 115, 51, 0.12)',
} as const

export const glass = {
  // Card surfaces
  cardBg:        'rgba(255, 255, 255, 0.06)',
  cardBorder:    'rgba(184, 115, 51, 0.25)',
  // Input surfaces
  inputBg:       'rgba(255, 255, 255, 0.07)',
  inputBorder:   'rgba(184, 115, 51, 0.35)',
  // Dropdown surfaces
  dropdownBg:    '#5a1f10',
  // Nav
  navBg:         'rgba(88, 28, 14, 0.94)',
  navBorder:     'rgba(184, 115, 51, 0.18)',
  // Modal backdrop
  backdropBg:    'rgba(60, 18, 8, 0.65)',
  modalBg:       'rgba(88, 28, 14, 0.96)',
  // Blur values (px)
  blurSm:        4,
  blurMd:        16,
  blurLg:        18,
} as const

export const fonts = {
  display: "var(--font-catchy-mager, 'CatchyMager', sans-serif)",
  body:    'inherit',
} as const

export const radii = {
  sm:   '8px',
  md:   '10px',
  lg:   '12px',
  xl:   '16px',
  xxl:  '20px',
  full: '9999px',
} as const

export const zIndex = {
  nav:     30,
  modal:   80,
  overlay: 100,
} as const
