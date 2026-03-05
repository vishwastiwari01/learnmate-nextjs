'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { motion } from 'framer-motion'
import Link from 'next/link'

const FEATURES = [
  { emoji:'⚔️', label:'Multiplayer Arena', desc:'3 live mini-games — Summit Rush, Tug of War, Wave Surfer' },
  { emoji:'🤖', label:'AI Tutor',           desc:'Chat, get quizzed, and solve problems with AI' },
  { emoji:'💻', label:'Coding Lab',         desc:'Block coding → fill blanks → real Python' },
  { emoji:'📚', label:'Auto Courses',       desc:'AI generates full courses on any topic' },
  { emoji:'🗺️', label:'AI Roadmaps',       desc:'Personalized step-by-step learning paths' },
  { emoji:'🏆', label:'Live Leaderboard',   desc:'Compete globally, earn XP, climb ranks' },
]

export default function LandingPage() {
  const router = useRouter()
  const { session, initialize, loading } = useAuthStore()

  useEffect(() => { initialize() }, [initialize])
  useEffect(() => { if (session) router.push('/dashboard') }, [session, router])

  if (loading) return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="text-4xl animate-bounce">⚡</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-base overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-purple/12 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-cyan/6 rounded-full blur-3xl" />
      </div>

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="font-sora font-extrabold text-xl grad-orange">⚡ LearnMate</div>
        <div className="flex gap-3">
          <Link href="/auth" className="text-sm font-semibold text-white/50 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-bg-elevated">
            Sign In
          </Link>
          <Link href="/auth" className="text-sm font-bold bg-brand-purple text-white px-4 py-2 rounded-xl hover:bg-violet-600 transition-colors">
            Get Started Free →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="inline-flex items-center gap-2 bg-brand-purple/15 border border-brand-purple/25 rounded-full px-4 py-1.5 text-xs font-bold text-violet-400 mb-6 uppercase tracking-widest">
          ✦ Built for India's Learners
        </motion.div>

        <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="font-sora font-extrabold text-5xl md:text-7xl leading-tight tracking-tight mb-5">
          <span className="text-white">Learn Smarter.</span><br />
          <span className="grad-orange">Win Together.</span>
        </motion.h1>

        <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="text-white/50 text-lg max-w-xl mx-auto mb-10">
          Real-time multiplayer battles, AI tutoring, auto-generated courses and roadmaps.
          For every learner, every level — completely free.
        </motion.p>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="flex flex-wrap gap-4 justify-center">
          <Link href="/auth"
            className="inline-flex items-center gap-2 bg-brand-orange text-white font-bold px-8 py-3.5 rounded-xl text-base hover:bg-orange-500 transition-all hover:scale-105 shadow-glow-orange">
            Start Learning Free →
          </Link>
          <Link href="/arena"
            className="inline-flex items-center gap-2 bg-bg-elevated border border-white/10 text-white font-semibold px-8 py-3.5 rounded-xl text-base hover:border-white/25 transition-all">
            ⚔️ Watch a Battle
          </Link>
        </motion.div>
      </div>

      {/* FEATURES */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 + i*0.07 }}
              className="bg-bg-elevated border border-white/[0.07] rounded-2xl p-4 hover:border-white/15 transition-all">
              <div className="text-2xl mb-2">{f.emoji}</div>
              <div className="font-sora font-bold text-sm mb-1">{f.label}</div>
              <div className="text-white/35 text-xs leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10 text-white/25 text-sm">
          Powered by OpenRouter AI · Supabase Realtime · Built with Next.js
        </div>
      </div>
    </div>
  )
}
