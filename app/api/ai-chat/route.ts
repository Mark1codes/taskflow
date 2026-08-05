import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.AI_RATE_LIMIT_MAX ?? 10)

type RateLimitEntry = { count: number; resetAt: number }

// A lightweight in-memory limiter for the current server instance.
const rateLimitStore = new Map<string, RateLimitEntry>()

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

  // 2. Rate Limit based on authenticated user ID
  const limit = checkRateLimit(user.id)
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

  const body = await req.json()
  const { messages, taskContext, userName, fileContext } = body

  // 3. Strict Payload Validation (OWASP A04)
  if (!messages || !Array.isArray(messages) || messages.length > 50) {
    return NextResponse.json({ error: 'Invalid or oversized message history' }, { status: 400, headers: rateHeaders })
  }
  
  if (JSON.stringify(body).length > 200000) { // Approx 200KB max payload
    return NextResponse.json({ error: 'Payload too large' }, { status: 413, headers: rateHeaders })
  }

  // Use first name only for a natural, personal feel
  const firstName = userName ? userName.trim().split(/\s+/)[0] : null

  const taskSection = taskContext
    ? `\n\nThe user's current tasks:\n${taskContext}`
    : ''

  const fileSection = fileContext
    ? `\n\nThe user has uploaded a file for analysis. Here is its content:\n---\n${fileContext}\n---\nAnalyse or answer questions about this file as requested.`
    : ''

  const userSection = firstName ? ` The user's first name is ${firstName}. Address them by this name naturally.` : ''

  const systemInstruction = {
    role: 'system',
    content: `You are an expert AI productivity assistant built into TaskFlow, a task management application.${userSection}
Your role is to help users manage their tasks, improve productivity, prioritize work, optimize their schedules, and analyse uploaded documents.
Be concise, actionable, warm, and friendly. Greet the user by their first name when they first reach out and use it occasionally to keep responses personal.
Always reference the user's actual tasks when relevant. When analysing completion patterns, priorities, or schedules, base your answer on the task data provided.${taskSection}${fileSection}

TASK CREATION RULE: When the user explicitly asks you to create, add, or insert a task, include a task JSON block at the very end of your response in EXACTLY this format (no markdown, no code fences):
TASK_CREATE:{"title":"...","priority":"high|medium|low","status":"todo","category":"...","due_date":"YYYY-MM-DD or null","description":"..."}
Only include ONE block per response. Only use it when the user clearly asks to create a task.`,
  }

  // Only send the last 10 messages to keep the payload lean and responses fast.
  // The system prompt already contains task context, so full history is unnecessary.
  const recentMessages = messages.slice(-10)
  const chatMessages = recentMessages.map((msg: { type: string; content: string }) => ({
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
        model: 'openrouter/auto',
        messages: [systemInstruction, ...chatMessages],
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter API error:', errText)
      // Try to extract the human-readable message from OpenRouter's JSON error
      let userMessage = 'The AI assistant could not complete that request.'
      try {
        const errJson = JSON.parse(errText)
        if (errJson?.error?.message) userMessage = errJson.error.message
      } catch { /* keep default */ }
      return NextResponse.json(
        { error: userMessage },
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
