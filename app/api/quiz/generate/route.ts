import { NextRequest, NextResponse } from 'next/server'
import { callAI, parseJSON } from '@/lib/openrouter'
import type { Question } from '@/types'

const FALLBACK_QUESTIONS: Record<string, Question[]> = {
  Physics: [
    { id: '1', question: "What is Newton's Second Law of Motion?", options: { A: 'F = ma', B: 'E = mc²', C: 'v = u + at', D: 'P = mv' }, answer: 'A', explanation: 'Force equals mass times acceleration.', subject: 'Physics', difficulty: 'intermediate' },
    { id: '2', question: 'What is the SI unit of electric current?', options: { A: 'Volt', B: 'Watt', C: 'Ampere', D: 'Ohm' }, answer: 'C', explanation: 'The Ampere (A) is the SI unit of electric current.', subject: 'Physics', difficulty: 'intermediate' },
    { id: '3', question: 'Which of these is a vector quantity?', options: { A: 'Mass', B: 'Speed', C: 'Temperature', D: 'Velocity' }, answer: 'D', explanation: 'Velocity has both magnitude and direction — making it a vector.', subject: 'Physics', difficulty: 'intermediate' },
    { id: '4', question: 'The speed of light in a vacuum is approximately:', options: { A: '3×10⁶ m/s', B: '3×10⁸ m/s', C: '3×10¹⁰ m/s', D: '3×10⁴ m/s' }, answer: 'B', explanation: 'Light travels at approximately 3×10⁸ m/s in vacuum.', subject: 'Physics', difficulty: 'intermediate' },
    { id: '5', question: 'Which law states "for every action there is an equal and opposite reaction"?', options: { A: "Newton's 1st Law", B: "Newton's 2nd Law", C: "Newton's 3rd Law", D: "Hooke's Law" }, answer: 'C', explanation: "Newton's Third Law describes action-reaction pairs.", subject: 'Physics', difficulty: 'intermediate' },
  ],
}

export async function POST(req: NextRequest) {
  try {
    const { subject, difficulty, count = 5 } = await req.json()

    const prompt = `Generate exactly ${count} multiple choice questions for a ${difficulty} level student studying ${subject}.
Return ONLY a valid JSON array with no markdown, no explanation:
[{"id":"1","question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A","explanation":"one sentence","subject":"${subject}","difficulty":"${difficulty}"}]`

    const raw = await callAI([{ role: 'user', content: prompt }], { maxTokens: 1500, temperature: 0.8 })
    const questions = parseJSON<Question[]>(raw)

    if (questions && questions.length > 0) {
      return NextResponse.json({ questions: questions.slice(0, count) })
    }

    // Fallback to pre-written questions
    const fallback = FALLBACK_QUESTIONS[subject] || FALLBACK_QUESTIONS['Physics']
    return NextResponse.json({ questions: fallback })
  } catch (e: unknown) {
    const fallback = FALLBACK_QUESTIONS['Physics']
    return NextResponse.json({ questions: fallback })
  }
}
