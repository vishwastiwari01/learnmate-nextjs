'use client'
import { create } from 'zustand'
import type { ChatMessage, Question } from '@/types'

interface LearnStore {
  messages: ChatMessage[]
  subject: string
  quizMode: boolean
  quizQuestions: Question[]
  currentQuizIndex: number
  quizScore: number
  isLoading: boolean

  addMessage: (msg: ChatMessage) => void
  setSubject: (s: string) => void
  setLoading: (v: boolean) => void
  startQuiz: (questions: Question[]) => void
  answerQuiz: (correct: boolean) => void
  resetQuiz: () => void
  clearChat: () => void
}

export const useLearnStore = create<LearnStore>((set, get) => ({
  messages: [],
  subject: 'Physics',
  quizMode: false,
  quizQuestions: [],
  currentQuizIndex: 0,
  quizScore: 0,
  isLoading: false,

  addMessage: (msg) => set(s => ({ messages: [...s.messages, msg] })),
  setSubject: (subject) => set({ subject }),
  setLoading: (v) => set({ isLoading: v }),

  startQuiz: (questions) => set({
    quizMode: true,
    quizQuestions: questions,
    currentQuizIndex: 0,
    quizScore: 0,
  }),

  answerQuiz: (correct) => set(s => ({
    quizScore: correct ? s.quizScore + 1 : s.quizScore,
    currentQuizIndex: s.currentQuizIndex + 1,
    quizMode: s.currentQuizIndex + 1 < s.quizQuestions.length,
  })),

  resetQuiz: () => set({ quizMode: false, quizQuestions: [], currentQuizIndex: 0, quizScore: 0 }),
  clearChat: () => set({ messages: [], quizMode: false }),
}))
