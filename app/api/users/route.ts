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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    { 
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  )

  // Fetch only safe, non-sensitive fields: id + full_name
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, avatar_url')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('[/api/users] Supabase error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch users', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: data ?? [] })
}
