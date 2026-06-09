import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured. Add it to your .env.local file.' },
      { status: 503 }
    )
  }

  const { messages } = await req.json()

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Build Gemini conversation history from our message format
  const contents = messages.map((msg: { type: string; content: string }) => ({
    role: msg.type === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }))

  const systemInstruction = {
    parts: [
      {
        text: `You are an expert AI productivity assistant built into TaskFlow, a task management application.
Your role is to help users manage their tasks, improve productivity, prioritize work, and optimize their schedules.
Be concise, actionable, and friendly. When giving advice, tie it back to real task management strategies.
If the user asks about specific tasks or data you don't have access to, acknowledge that and give general best-practice advice instead.`,
      },
    ],
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction,
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API error:', errText)
      return NextResponse.json(
        { error: 'Gemini API request failed', details: errText },
        { status: response.status }
      )
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not generate a response.'

    return NextResponse.json({ reply: text })
  } catch (err) {
    console.error('AI chat error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
