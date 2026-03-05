'use client'
import { create } from 'zustand'
import type { Room, Player, Question, GameType } from '@/types'

interface ArenaStore {
  room: Room | null
  myPlayerId: string
  gamePhase: 'idle' | 'lobby' | 'playing' | 'finished'
  currentQuestion: Question | null
  questionIndex: number
  myEnergy: number
  timerValue: number
  answered: boolean

  setRoom: (room: Room) => void
  updatePlayer: (playerId: string, updates: Partial<Player>) => void
  setGamePhase: (phase: ArenaStore['gamePhase']) => void
  setQuestion: (q: Question, index: number) => void
  addEnergy: (amount: number) => void
  setTimer: (val: number) => void
  setAnswered: (v: boolean) => void
  resetArena: () => void
}

export const useArenaStore = create<ArenaStore>((set, get) => ({
  room: null,
  myPlayerId: '',
  gamePhase: 'idle',
  currentQuestion: null,
  questionIndex: 0,
  myEnergy: 0,
  timerValue: 20,
  answered: false,

  setRoom: (room) => set({ room }),
  updatePlayer: (playerId, updates) => {
    const { room } = get()
    if (!room) return
    const players = room.players.map(p => p.id === playerId ? { ...p, ...updates } : p)
    set({ room: { ...room, players } })
  },
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setQuestion: (q, index) => set({ currentQuestion: q, questionIndex: index, answered: false, timerValue: 20 }),
  addEnergy: (amount) => set(s => ({ myEnergy: Math.min(100, s.myEnergy + amount) })),
  setTimer: (val) => set({ timerValue: val }),
  setAnswered: (v) => set({ answered: v }),
  resetArena: () => set({ room: null, gamePhase: 'idle', currentQuestion: null, questionIndex: 0, myEnergy: 0, answered: false }),
}))
