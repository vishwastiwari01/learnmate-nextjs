import { NextRequest, NextResponse } from 'next/server'
import { callAI, parseJSON } from '@/lib/openrouter'
import type { Course } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { topic, difficulty, userContext } = await req.json()

    const prompt = `Create a complete learning course about "${topic}" for: ${userContext || 'a motivated self-learner'}.
Difficulty: ${difficulty || 'beginner'}.

Return ONLY valid JSON matching this exact structure:
{
  "id": "generated-${Date.now()}",
  "title": "Course title",
  "description": "2-sentence description",
  "emoji": "relevant emoji",
  "category": "category name",
  "difficulty": "${difficulty || 'beginner'}",
  "estimatedHours": 10,
  "isPrebuilt": false,
  "tags": ["tag1","tag2","tag3"],
  "modules": [
    {
      "id": "m1",
      "title": "Module title",
      "description": "What you'll learn",
      "lessons": [
        {"id":"l1","title":"Lesson title","type":"concept","duration":15,"xpReward":50},
        {"id":"l2","title":"Lesson title","type":"quiz","duration":10,"xpReward":80},
        {"id":"l3","title":"Lesson title","type":"code","duration":20,"xpReward":100}
      ]
    }
  ]
}
Include 4-5 modules, each with 3-4 lessons. Types: concept, quiz, code, project.`

    const raw = await callAI([{ role: 'user', content: prompt }], { maxTokens: 2000, temperature: 0.7 })
    const course = parseJSON<Course>(raw)

    if (course) {
      return NextResponse.json({ course })
    }
    return NextResponse.json({ error: 'Could not generate course' }, { status: 500 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Generation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
