import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.AI_RATE_LIMIT_MAX ?? 10)

type RateLimitEntry = { count: number; resetAt: number }

// A lightweight in-memory limiter for the current server instance.
const rateLimitStore = new Map<string, RateLimitEntry>()

function getClientKey(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown-client'
}

function checkRateLimit(clientKey: string) {
  const now = Date.now()
  const current = rateLimitStore.get(clientKey)

  if (!current || current.resetAt <= now) {
    const fresh = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS }
    rateLimitStore.set(clientKey, fresh)
    return { allowed: true, remaining: Math.max(RATE_LIMIT_MAX_REQUESTS - 1, 0), resetAt: fresh.resetAt }
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt }
  }

  current.count += 1
  return { allowed: true, remaining: Math.max(RATE_LIMIT_MAX_REQUESTS - current.count, 0), resetAt: current.resetAt }
}

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(getClientKey(req))
  const rateHeaders = {
    'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
    'X-RateLimit-Remaining': String(limit.remaining),
    'X-RateLimit-Reset': String(Math.ceil(limit.resetAt / 1000)),
  }

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'You have reached the assistant request limit. Please try again shortly.' },
      {
        status: 429,
        headers: {
          ...rateHeaders,
          'Retry-After': String(Math.max(Math.ceil((limit.resetAt - Date.now()) / 1000), 1)),
        },
      }
    )
  }

  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'The AI assistant is not configured yet. Please try again later.' },
      { status: 503, headers: rateHeaders }
    )
  }

  const { messages } = await req.json()

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers: rateHeaders })
  }

  const systemInstruction = {
    role: 'system',
    content: `You are an expert AI productivity assistant built into TaskFlow, a task management application.
Your role is to help users manage their tasks, improve productivity, prioritize work, and optimize their schedules.
Be concise, actionable, and friendly. When giving advice, tie it back to real task management strategies.
If the user asks about specific tasks or data you don't have access to, acknowledge that and give general best-practice advice instead.`,
  }

  const chatMessages = messages.map((msg: { type: string; content: string }) => ({
    role: msg.type === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }))

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'TaskFlow',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [systemInstruction, ...chatMessages],
        max_tokens: 512,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter API error:', errText)
      return NextResponse.json(
        { error: 'The AI assistant could not complete that request.', details: errText },
        { status: response.status, headers: rateHeaders }
      )
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.'

    return NextResponse.json({ reply: text }, { headers: rateHeaders })
  } catch (err) {
    console.error('AI chat error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
