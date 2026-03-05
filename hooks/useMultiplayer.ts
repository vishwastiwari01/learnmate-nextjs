'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import { supabase, subscribeToRoom, updatePlayerScore, submitAnswer, updateRoomStatus, advanceQuestion, setRoomQuestions } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserStore } from '@/store/useUserStore'
import type { Question } from '@/types'

export interface MultiplayerPlayer {
  id: string
  room_id: string
  user_id: string | null
  player_name: string
  avatar: string
  score: number
  energy: number
  is_host: boolean
  is_ready: boolean
  team: 'red' | 'blue' | 'none'
}

export interface MultiplayerRoom {
  id: string
  code: string
  host_name: string
  subject: string
  difficulty: string
  game_type: string
  status: 'lobby' | 'playing' | 'finished'
  questions: Question[]
  current_q: number
}

export function useMultiplayer(roomId: string | null) {
  const { profile } = useAuthStore()
  const { addXP } = useUserStore()

  const [room, setRoom]       = useState<MultiplayerRoom | null>(null)
  const [players, setPlayers] = useState<MultiplayerPlayer[]>([])
  const [myPlayer, setMyPlayer] = useState<MultiplayerPlayer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const unsubRef = useRef<(() => void) | null>(null)

  // Load room + players
  const loadRoom = useCallback(async (id: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('game_rooms')
      .select('*, game_players(*)')
      .eq('id', id)
      .single()

    if (error || !data) { setError('Room not found'); setLoading(false); return }

    setRoom({
      id: data.id,
      code: data.code,
      host_name: data.host_name,
      subject: data.subject,
      difficulty: data.difficulty,
      game_type: data.game_type,
      status: data.status as MultiplayerRoom['status'],
      questions: (data.questions as Question[]) || [],
      current_q: data.current_q,
    })

    const pls = (data.game_players as MultiplayerPlayer[]) || []
    setPlayers(pls)

    // Find my player
    if (profile) {
      const me = pls.find(p => p.user_id === profile.id) || null
      setMyPlayer(me)
    }
    setLoading(false)
  }, [profile])

  // Subscribe to realtime updates
  useEffect(() => {
    if (!roomId) return
    loadRoom(roomId)

    unsubRef.current = subscribeToRoom(roomId, {
      onRoomUpdate: (updated) => {
        setRoom(prev => prev ? {
          ...prev,
          status: (updated.status as MultiplayerRoom['status']) || prev.status,
          current_q: typeof updated.current_q === 'number' ? updated.current_q : prev.current_q,
          questions: (updated.questions as Question[]) || prev.questions,
        } : null)
      },
      onPlayerJoin: (player) => {
        setPlayers(prev => {
          const exists = prev.find(p => p.id === (player.id as string))
          if (exists) return prev
          return [...prev, player as MultiplayerPlayer]
        })
      },
      onPlayerUpdate: (updated) => {
        setPlayers(prev => prev.map(p =>
          p.id === updated.id ? { ...p, ...(updated as Partial<MultiplayerPlayer>) } : p
        ))
        if (myPlayer && updated.id === myPlayer.id) {
          setMyPlayer(prev => prev ? { ...prev, ...(updated as Partial<MultiplayerPlayer>) } : null)
        }
      },
    })

    return () => { unsubRef.current?.() }
  }, [roomId, loadRoom])

  // HOST: push questions to room and start game
  const startGame = useCallback(async (questions: Question[]) => {
    if (!room || !myPlayer?.is_host) return
    await setRoomQuestions(room.id, questions as object[])
    await updateRoomStatus(room.id, 'playing', { started_at: new Date().toISOString(), current_q: 0 })
  }, [room, myPlayer])

  // HOST: advance to next question
  const nextQuestion = useCallback(async () => {
    if (!room || !myPlayer?.is_host) return
    const next = room.current_q + 1
    if (next >= room.questions.length) {
      await updateRoomStatus(room.id, 'finished', { finished_at: new Date().toISOString() })
    } else {
      await advanceQuestion(room.id, room.current_q)
    }
  }, [room, myPlayer])

  // PLAYER: submit an answer
  const submitMyAnswer = useCallback(async (
    questionIdx: number,
    chosen: string,
    correct: boolean,
    timeTakenMs: number,
    scoreGained: number
  ) => {
    if (!room || !myPlayer) return
    // Update player score in DB
    await updatePlayerScore(myPlayer.id, myPlayer.score + scoreGained, myPlayer.energy + (correct ? 20 : 0))
    // Record answer
    await submitAnswer({ room_id: room.id, player_id: myPlayer.id, question_idx: questionIdx, chosen, correct, time_taken_ms: timeTakenMs, score_gained: scoreGained })
    // Award XP to profile
    if (correct && profile) {
      addXP(scoreGained)
    }
  }, [room, myPlayer, profile, addXP])

  // Mark player ready
  const setReady = useCallback(async (ready: boolean) => {
    if (!myPlayer) return
    await supabase.from('game_players').update({ is_ready: ready }).eq('id', myPlayer.id)
  }, [myPlayer])

  return {
    room, players, myPlayer, loading, error,
    startGame, nextQuestion, submitMyAnswer, setReady,
    isHost: myPlayer?.is_host || false,
    amIReady: myPlayer?.is_ready || false,
    allReady: players.length > 1 && players.every(p => p.is_ready),
  }
}
