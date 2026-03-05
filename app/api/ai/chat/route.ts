import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/openrouter'
import type { ORMessage } from '@/lib/openrouter'

export async function POST(req: NextRequest) {
  try {
    const { messages, subject, mode, userContext, model } = await req.json()

    const systemPrompt = mode === 'chat'
      ? `You are LearnMate AI — a brilliant, friendly tutor. You can help with ANY topic: academics, coding, science, history, creative writing, research, anything.
Student context: ${userContext || 'general learner'}

Be conversational and energetic like the best teacher they've ever had. Use:
- **bold** for key terms
- bullet points with • for lists  
- code blocks with \`\`\` for code
- Relatable Indian examples when relevant
Keep responses clear and not too long unless asked for depth.`
      : `You are LearnMate AI — an expert tutor for ${subject}.
Student context: ${userContext || 'general learner'}
Format responses clearly. Use **bold**, bullet points, and examples. Be engaging and concise.`

    const fullMessages: ORMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    const response = await callAI(fullMessages, { maxTokens: 1000, model })
    return NextResponse.json({ content: response })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'AI error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
