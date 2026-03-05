import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { code, playerName, userId, avatar } = await req.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getServerClient() as any

    const { data: room, error: roomErr } = await supabase
      .from('game_rooms')
      .select('*, game_players(*)')
      .eq('code', code.toUpperCase())
      .eq('status', 'lobby')
      .single()

    if (roomErr || !room) return NextResponse.json({ error: 'Room not found or already started' }, { status: 404 })

    const players = room.game_players as { id: string; user_id: string; team?: string }[]

    if (players.length >= room.max_players) return NextResponse.json({ error: 'Room is full' }, { status: 400 })

    if (userId && players.find(p => p.user_id === userId)) {
      return NextResponse.json({ error: 'Already in this room' }, { status: 400 })
    }

    const redCount  = players.filter(p => p.team === 'red').length
    const blueCount = players.filter(p => p.team === 'blue').length
    const team = room.game_type === 'tugofwar' ? (redCount <= blueCount ? 'red' : 'blue') : 'none'

    const { data: player, error: playerErr } = await supabase
      .from('game_players')
      .insert({ room_id: room.id, user_id: userId || null, player_name: playerName, avatar: avatar || '🐯', is_host: false, is_ready: false, team })
      .select()
      .single()

    if (playerErr) return NextResponse.json({ error: playerErr.message }, { status: 500 })

    return NextResponse.json({
      room: { id: room.id, code: room.code, subject: room.subject, game_type: room.game_type, difficulty: room.difficulty, host_name: room.host_name },
      player,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
