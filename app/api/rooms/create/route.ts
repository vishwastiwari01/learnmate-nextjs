import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase'
import { genRoomCode } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { hostName, hostId, subject, difficulty, gameType } = await req.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getServerClient() as any

    let code = genRoomCode()
    let attempts = 0
    while (attempts < 5) {
      const { data } = await supabase.from('game_rooms').select('id').eq('code', code).single()
      if (!data) break
      code = genRoomCode()
      attempts++
    }

    const { data: room, error: roomErr } = await supabase
      .from('game_rooms')
      .insert({ code, host_id: hostId || null, host_name: hostName, subject, difficulty, game_type: gameType })
      .select()
      .single()

    if (roomErr || !room) return NextResponse.json({ error: roomErr?.message }, { status: 500 })

    const { data: player, error: playerErr } = await supabase
      .from('game_players')
      .insert({ room_id: room.id, user_id: hostId || null, player_name: hostName, avatar: '🦊', is_host: true, is_ready: true })
      .select()
      .single()

    if (playerErr) return NextResponse.json({ error: playerErr.message }, { status: 500 })

    return NextResponse.json({ room, player })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
