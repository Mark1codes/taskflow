import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  // Basic auth check — require a Bearer token (the client sends the session access_token)
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service role key if available to bypass RLS on the users table.
  // If not configured, fall back to anon key (may return empty if RLS is strict).
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY!

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    { auth: { persistSession: false } }
  )

  // Fetch only safe, non-sensitive fields: id + full_name
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('[/api/users] Supabase error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch users', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: data ?? [] })
}
