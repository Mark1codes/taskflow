import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const AVATAR_BUCKET = 'avatars'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!


let cache: { users: any[]; expiresAt: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })


  if (cache && Date.now() < cache.expiresAt) {
    return NextResponse.json({ users: cache.users })
  }


  const anonClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_KEY!, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: { user }, error: authError } = await anonClient.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }


  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const queryClient = serviceKey
    ? createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } })
    : anonClient

  const { data, error } = await queryClient
    .from('users')
    .select('id, full_name, avatar_url')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('[/api/users] Supabase error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch users', detail: error.message }, { status: 500 })
  }

  const rows = data ?? []

  
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`
  const toSign: { index: number; path: string }[] = []
  const resolved: (string | null)[] = rows.map((u, i) => {
    if (!u.avatar_url) return null
    // External URL (Google, GitHub OAuth) — use as-is
    if (!u.avatar_url.includes(SUPABASE_URL)) return u.avatar_url
    const markerIdx = u.avatar_url.indexOf(marker)
    if (markerIdx === -1) return u.avatar_url
    const path = decodeURIComponent(u.avatar_url.slice(markerIdx + marker.length).split('?')[0])
    toSign.push({ index: i, path })
    return null // placeholder
  })

  
  if (toSign.length > 0) {
    const { data: signed } = await queryClient.storage
      .from(AVATAR_BUCKET)
      .createSignedUrls(toSign.map(x => x.path), 60 * 60 * 24)

    if (signed) {
      signed.forEach((s, idx) => {
        const originalIdx = toSign[idx]?.index
        if (originalIdx !== undefined) {
          resolved[originalIdx] = s.signedUrl ?? rows[originalIdx].avatar_url ?? null
        }
      })
    } else {
      // Signing failed — fall back to public URLs
      toSign.forEach(({ index, path }) => {
        const { data: pub } = queryClient.storage.from(AVATAR_BUCKET).getPublicUrl(path)
        resolved[index] = pub?.publicUrl ?? rows[index].avatar_url ?? null
      })
    }
  }

  const users = rows.map((u, i) => ({
    id: u.id,
    full_name: u.full_name,
    avatar_url: resolved[i],
  }))

  // Store in cache
  cache = { users, expiresAt: Date.now() + CACHE_TTL_MS }

  console.log(`[/api/users] Fetched ${users.length} users (cache refreshed)`)
  return NextResponse.json({ users })
}
