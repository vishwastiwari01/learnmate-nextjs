'use client'
import { create } from 'zustand'
import { supabase, getProfile, upsertProfile } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthStore {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean

  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, meta: { name: string; avatar: string; studying_what: string; interests: string[] }) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    set({ loading: true })
    // Get current session
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await getProfile(session.user.id)
      set({ session, user: session.user, profile, loading: false, initialized: true })
    } else {
      set({ loading: false, initialized: true })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await getProfile(session.user.id)
        set({ session, user: session.user, profile })
      } else {
        set({ session: null, user: null, profile: null })
      }
    })
  },

  signIn: async (email, password) => {
    set({ loading: true })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { set({ loading: false }); return { error: error.message } }
    const { data: profile } = await getProfile(data.user.id)
    set({ session: data.session, user: data.user, profile, loading: false })
    return { error: null }
  },

  signUp: async (email, password, meta) => {
    set({ loading: true })
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name: meta.name, avatar: meta.avatar } }
    })
    if (error) { set({ loading: false }); return { error: error.message } }
    if (data.user) {
      // Upsert full profile with all onboarding data
      await upsertProfile({
        id: data.user.id,
        name: meta.name,
        avatar: meta.avatar,
        studying_what: meta.studying_what,
        interests: meta.interests,
      })
      const { data: profile } = await getProfile(data.user.id)
      set({ session: data.session, user: data.user, profile, loading: false })
    }
    return { error: null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null })
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!user) return
    const { data: profile } = await getProfile(user.id)
    if (profile) set({ profile })
  },

  updateProfile: async (updates) => {
    const { user, profile } = get()
    if (!user || !profile) return
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
    if (!error) set({ profile: { ...profile, ...updates } })
  },
}))
