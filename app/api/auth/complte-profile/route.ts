import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, avatar, studying_what, interests } = body

    if (!id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getServerClient() as any

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id,
        name,
        avatar: avatar || '🦊',
        studying_what: studying_what || 'Self Learner',
        interests: interests || [],
      }, { onConflict: 'id' })

    if (error) {
      console.error('Profile upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('complete-profile error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}