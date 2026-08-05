import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.PARSE_RATE_LIMIT_MAX ?? 10)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(clientKey: string) {
  const now = Date.now()
  const current = rateLimitStore.get(clientKey)
  if (!current || current.resetAt <= now) {
    const fresh = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS }
    rateLimitStore.set(clientKey, fresh)
    return { allowed: true }
  }
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) return { allowed: false }
  current.count += 1
  return { allowed: true }
}

export async function POST(req: NextRequest) {
  // 1. Authenticate Request
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Rate Limit
  const limit = checkRateLimit(user.id)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many parse requests. Please wait.' }, { status: 429 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const name = file.name.toLowerCase()

    let text = ''

    if (name.endsWith('.pdf')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse')
      const result = await pdfParse(buffer)
      text = result.text
    } else if (name.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (name.endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.' }, { status: 400 })
    }

    // Truncate to 8000 chars to stay within AI context window
    const truncated = text.trim().slice(0, 8000)
    const wasTruncated = text.trim().length > 8000

    return NextResponse.json({
      text: truncated,
      truncated: wasTruncated,
      originalLength: text.trim().length,
    })
  } catch (err) {
    console.error('File parse error:', err)
    return NextResponse.json({ error: 'Failed to parse file. Please try a different file.' }, { status: 500 })
  }
}
