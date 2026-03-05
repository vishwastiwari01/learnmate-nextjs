'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, OnboardingData } from '@/types'
import { xpToLevel } from '@/lib/utils'

interface UserStore {
  user: User | null
  isOnboarded: boolean
  apiKey: string
  aiModel: string
  setOnboarding: (data: OnboardingData) => void
  addXP: (amount: number) => void
  incrementStreak: () => void
  setApiKey: (key: string) => void
  setAIModel: (model: string) => void
  reset: () => void
}

const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct'

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isOnboarded: false,
      apiKey: '',
      aiModel: DEFAULT_MODEL,

      setOnboarding: (data) => {
        const user: User = {
          id: crypto.randomUUID(),
          name: data.name,
          email: '',
          avatar: data.avatar,
          xp: 0,
          level: 1,
          streak: 0,
          studyingWhat: data.studyingWhat,
          interests: data.interests,
          createdAt: new Date().toISOString(),
        }
        set({ user, isOnboarded: true })
      },

      addXP: (amount) => {
        const { user } = get()
        if (!user) return
        const newXP = user.xp + amount
        set({ user: { ...user, xp: newXP, level: xpToLevel(newXP) } })
      },

      incrementStreak: () => {
        const { user } = get()
        if (!user) return
        set({ user: { ...user, streak: user.streak + 1 } })
      },

      setApiKey: (key) => set({ apiKey: key }),
      setAIModel: (model) => set({ aiModel: model }),
      reset: () => set({ user: null, isOnboarded: false }),
    }),
    { name: 'learnmate-user' }
  )
)
