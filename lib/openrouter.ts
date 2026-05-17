export interface ORMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function callAI(
  messages: ORMessage[],
  options?: { maxTokens?: number; temperature?: number; model?: string; useGroq?: boolean; apiKey?: string; groqKey?: string }
): Promise<string> {
  const orKey = options?.apiKey || process.env.OPENROUTER_API_KEY
  const groqKey = options?.groqKey || process.env.GROQ_API_KEY
  
  // Prefer Groq if key exists and either explicitly requested OR OpenRouter key is missing
  const useGroq = groqKey && (options?.useGroq !== false || !orKey)

  if (!orKey && !groqKey) {
    throw new Error('Neither OPENROUTER_API_KEY nor GROQ_API_KEY is set in .env.local')
  }

  let endpoint = ''
  let apiKey = ''
  let headers: Record<string, string> = { 'Content-Type': 'application/json' }
  let model = options?.model ?? 'meta-llama/llama-3.1-8b-instruct'

  if (useGroq) {
    endpoint = 'https://api.groq.com/openai/v1/chat/completions'
    apiKey = groqKey as string
    headers['Authorization'] = `Bearer ${apiKey}`
    
    // Map OpenRouter models to Groq equivalents if possible
    if (model.includes('llama-3.1')) model = 'llama-3.1-8b-instant'
    else if (model.includes('llama3')) model = 'llama3-8b-8192'
    else if (model.includes('mixtral')) model = 'mixtral-8x7b-32768'
    else if (model.includes('gemma')) model = 'gemma2-9b-it'
    else model = 'llama-3.1-8b-instant' // Default Groq model
  } else {
    endpoint = 'https://openrouter.ai/api/v1/chat/completions'
    apiKey = orKey as string
    headers['Authorization'] = `Bearer ${apiKey}`
    headers['HTTP-Referer'] = 'https://learnmate.app'
    headers['X-Title'] = 'LearnMate'
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options?.maxTokens ?? 1200,
      temperature: options?.temperature ?? 0.7,
    }),
  })

  const data = await res.json()
  
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `API Error: ${res.statusText}`)
  }
  
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
