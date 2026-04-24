import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/services/supabase/server'

export async function GET() {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return NextResponse.json({ loggedIn: user !== null })
}
