// Centralised, typed env-var access.
// NEXT_PUBLIC_* vars are inlined at build time — use dot notation so Next.js
// replaces them correctly in both server and client bundles.
export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
} as const
