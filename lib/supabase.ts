import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import type { Json } from './database.types'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<Database>(supabaseUrl, supabaseAnon) as any

// ── SERVER CLIENT (use in API routes) ────────────────
export function getServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  }) as any
}

export const auth = supabase.auth

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email: string, password: string, meta: { name: string; avatar: string }) {
  return supabase.auth.signUp({ email, password, options: { data: meta } })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  return supabase.auth.getSession()
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function upsertProfile(profile: {
  id: string
  name: string
  avatar: string
  studying_what: string
  interests: string[]
}) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()
  return { data, error }
}

export async function updateXP(userId: string, amount: number, reason: string, roomId?: string) {
  const { data, error } = await supabase.rpc('award_xp', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_room_id: roomId ?? null,
  })
  return { data, error }
}

export async function createRoom(room: {
  code: string
  host_id?: string | null
  host_name: string
  subject: string
  difficulty: string
  game_type: string
}) {
  const { data, error } = await supabase
    .from('game_rooms')
    .insert(room)
    .select()
    .single()
  return { data, error }
}

export async function getRoomByCode(code: string) {
  const { data, error } = await supabase
    .from('game_rooms')
    .select('*, game_players(*)')
    .eq('code', code.toUpperCase())
    .eq('status', 'lobby')
    .single()
  return { data, error }
}

export async function updateRoomStatus(roomId: string, status: 'lobby' | 'playing' | 'finished', extra?: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('game_rooms')
    .update({ status, ...(extra ?? {}) })
    .eq('id', roomId)
    .select()
    .single()
  return { data, error }
}

export async function setRoomQuestions(roomId: string, questions: object[]) {
  return supabase.from('game_rooms').update({ questions }).eq('id', roomId)
}

export async function advanceQuestion(roomId: string, currentQ: number) {
  return supabase.from('game_rooms').update({ current_q: currentQ + 1 }).eq('id', roomId)
}

export async function joinRoomAsPlayer(player: {
  room_id: string
  user_id?: string | null
  player_name: string
  avatar: string
  is_host?: boolean | null
  team?: string | null
}) {
  const { data, error } = await supabase
    .from('game_players')
    .insert(player)
    .select()
    .single()
  return { data, error }
}

export async function updatePlayerScore(playerId: string, score: number, energy: number) {
  return supabase.from('game_players').update({ score, energy }).eq('id', playerId)
}

export async function submitAnswer(answer: {
  room_id: string
  player_id: string
  question_idx: number
  chosen: string
  correct: boolean
  time_taken_ms: number
  score_gained: number
}) {
  return supabase.from('game_answers').insert(answer)
}

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
  return { data, error }
}

export function subscribeToRoom(
  roomId: string,
  callbacks: {
    onRoomUpdate?: (room: Record<string, unknown>) => void
    onPlayerJoin?: (player: Record<string, unknown>) => void
    onPlayerUpdate?: (player: Record<string, unknown>) => void
    onAnswer?: (answer: Record<string, unknown>) => void
  }
) {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'game_rooms',
      filter: `id=eq.${roomId}`
    }, (payload: any) => callbacks.onRoomUpdate?.(payload.new as Record<string, unknown>))
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'game_players',
      filter: `room_id=eq.${roomId}`
    }, (payload: any) => callbacks.onPlayerJoin?.(payload.new as Record<string, unknown>))
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'game_players',
      filter: `room_id=eq.${roomId}`
    }, (payload: any) => callbacks.onPlayerUpdate?.(payload.new as Record<string, unknown>))
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'game_answers',
      filter: `room_id=eq.${roomId}`
    }, (payload: any) => callbacks.onAnswer?.(payload.new as Record<string, unknown>))
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export async function saveRoadmap(roadmap: {
  user_id: string
  title: string
  goal: string
  nodes: Json
  node_statuses: Json
  completion_percent: number
}) {
  const { data, error } = await supabase
    .from('roadmaps')
    .upsert(roadmap, { onConflict: 'id' })
    .select()
    .single()
  return { data, error }
}

export async function getUserRoadmaps(userId: string) {
  return supabase.from('roadmaps').select('*').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function saveLearnSession(session: {
  user_id: string
  subject: string
  messages: Json
}) {
  return supabase.from('learn_sessions').insert(session).select().single()
}

export async function getLearnSessions(userId: string) {
  return supabase.from('learn_sessions').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(20)
}
