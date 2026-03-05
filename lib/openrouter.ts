export interface ORMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function callAI(
  messages: ORMessage[],
  options?: { maxTokens?: number; temperature?: number; model?: string }
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set in .env.local')

  const model = options?.model ?? 'meta-llama/llama-3.1-8b-instruct'

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://learnmate.app',
      'X-Title': 'LearnMate',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options?.maxTokens ?? 1200,
      temperature: options?.temperature ?? 0.7,
    }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.choices[0].message.content as string
}

export function parseJSON<T>(text: string): T | null {
  try {
    // Try to extract JSON from markdown code blocks or raw text
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
    const raw = match ? match[1] || match[0] : text
    return JSON.parse(raw.trim()) as T
  } catch {
    return null
  }
}
