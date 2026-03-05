import { NextRequest, NextResponse } from 'next/server'

// Uses Web Speech API on client side - this route is a passthrough for future TTS models
// For now we just validate and return the text — actual TTS is done client-side
export async function POST(req: NextRequest) {
  const { text } = await req.json()
  return NextResponse.json({ text: text?.slice(0, 500) || '' })
}
