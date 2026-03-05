import { NextRequest, NextResponse } from 'next/server'
import { callAI, parseJSON } from '@/lib/openrouter'
import type { Roadmap } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { goal, userContext } = await req.json()

    const prompt = `Create a detailed learning roadmap for someone who wants to: "${goal}".
Learner context: ${userContext || 'motivated beginner'}.

Return ONLY valid JSON:
{
  "id": "rm-${Date.now()}",
  "title": "Roadmap title",
  "goal": "${goal}",
  "completionPercent": 0,
  "userId": "",
  "createdAt": "${new Date().toISOString()}",
  "nodes": [
    {
      "id": "n1",
      "title": "Node title",
      "description": "What to learn here",
      "type": "milestone",
      "status": "available",
      "dependencies": [],
      "estimatedDays": 7,
      "xpReward": 200,
      "courseId": null
    }
  ]
}
Include 8-12 nodes. Types: milestone, topic, project. 
First node status: "available". Rest: "locked".
Dependencies use node ids (e.g. "n1").
Make it realistic and progressive — beginner to advanced.`

    const raw = await callAI([{ role: 'user', content: prompt }], { maxTokens: 2000 })
    const roadmap = parseJSON<Roadmap>(raw)

    if (roadmap) return NextResponse.json({ roadmap })
    return NextResponse.json({ error: 'Could not generate roadmap' }, { status: 500 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
