import { NextRequest, NextResponse } from 'next/server'

// Using Pollinations.ai - completely free, no API key needed
// Generates educational diagrams and concept visualizations
export async function POST(req: NextRequest) {
  try {
    const { prompt, style = 'educational diagram' } = await req.json()

    // Build a detailed educational prompt
    const fullPrompt = encodeURIComponent(
      `${style}: ${prompt}. Clean, clear educational illustration, labeled diagram, white background, professional textbook style, no watermark`
    )

    // Pollinations.ai - free, no key needed, great for diagrams
    const imageUrl = `https://image.pollinations.ai/prompt/${fullPrompt}?width=800&height=500&nologo=true&enhance=true&model=flux`

    return NextResponse.json({ imageUrl })
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
  }
}
