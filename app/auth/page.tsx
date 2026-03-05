'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/Button'
import { AVATARS } from '@/lib/utils'

const STUDYING_OPTIONS = [
  'Class 6–8 Student', 'Class 9–10 Student', 'Class 11–12 Student',
  'Engineering Student', 'College Student', 'Self Learner / Working Professional',
  'Preparing for JEE/NEET', 'Preparing for UPSC / Govt Exams',
]

const INTEREST_OPTIONS = [
  '🤖 AI & Machine Learning', '🌐 Web Development', '📊 Data Science',
  '💻 Programming', '⚡ Physics', '🧮 Mathematics', '🧪 Chemistry',
  '🧬 Biology', '🎮 Game Development', '🔐 Cybersecurity',
]

type Tab = 'signin' | 'signup'
type Step = 'credentials' | 'profile'

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp, session, loading, initialize } = useAuthStore()

  const [tab, setTab]       = useState<Tab>('signin')
  const [step, setStep]     = useState<Step>('credentials')
  const [error, setError]   = useState('')
  const [email, setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]     = useState('')
  const [avatar, setAvatar] = useState('🦊')
  const [studying, setStudying] = useState('')
  const [interests, setInterests] = useState<string[]>([])

  useEffect(() => { initialize() }, [initialize])
  useEffect(() => { if (session) router.push('/dashboard') }, [session, router])

  async function handleSignIn() {
    setError('')
    const { error } = await signIn(email, password)
    if (error) setError(error)
    else router.push('/dashboard')
  }

  async function handleSignUp() {
    if (step === 'credentials') {
      if (!email || !password || !name) { setError('Fill in all fields'); return }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return }
      setError(''); setStep('profile'); return
    }
    if (interests.length === 0 || !studying) { setError('Pick your studying level and at least one interest'); return }
    setError('')
    const { error } = await signUp(email, password, {
      name, avatar, studying_what: studying, interests,
    })
    if (error) setError(error)
    else router.push('/dashboard')
  }

  function toggleInterest(i: string) {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col overflow-hidden relative">
      {/* BG */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-purple/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl" />
      </div>

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4">
        <a href="/" className="font-sora font-extrabold text-xl grad-orange">⚡ LearnMate</a>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* TABS */}
          <div className="flex bg-bg-elevated border border-white/10 rounded-2xl p-1 mb-6">
            {(['signin', 'signup'] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setStep('credentials'); setError('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-brand-purple text-white' : 'text-white/40'}`}>
                {t === 'signin' ? '👋 Sign In' : '🚀 Sign Up'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* SIGN IN */}
            {tab === 'signin' && (
              <motion.div key="signin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="bg-bg-elevated border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="font-sora font-extrabold text-xl">Welcome back!</h2>
                <div className="space-y-3">
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email address"
                    className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50 transition-colors" />
                  <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password"
                    onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                    className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50 transition-colors" />
                </div>
                {error && <p className="text-brand-red text-sm">{error}</p>}
                <Button variant="primary" size="lg" className="w-full" onClick={handleSignIn} loading={loading}>
                  Sign In →
                </Button>
                <p className="text-center text-xs text-white/30">
                  Don&apos;t have an account?{' '}
                  <button onClick={() => setTab('signup')} className="text-brand-cyan hover:underline">Sign up free</button>
                </p>
              </motion.div>
            )}

            {/* SIGN UP — STEP 1: CREDENTIALS */}
            {tab === 'signup' && step === 'credentials' && (
              <motion.div key="signup-creds" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-bg-elevated border border-white/10 rounded-2xl p-6 space-y-4">
                <div>
                  <h2 className="font-sora font-extrabold text-xl">Create your account</h2>
                  <p className="text-white/40 text-xs mt-1">Step 1 of 2 — Basic details</p>
                </div>

                {/* AVATAR PICK */}
                <div>
                  <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest block mb-2">Pick avatar</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATARS.map(av => (
                      <button key={av} onClick={() => setAvatar(av)}
                        className={`w-10 h-10 rounded-xl text-xl transition-all ${avatar === av ? 'bg-brand-purple/30 border-2 border-brand-purple scale-110' : 'bg-bg-surface border border-white/10 hover:border-white/25'}`}>
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                    className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50 transition-colors" />
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email address"
                    className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50 transition-colors" />
                  <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password (min 6 chars)"
                    onKeyDown={e => e.key === 'Enter' && handleSignUp()}
                    className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50 transition-colors" />
                </div>
                {error && <p className="text-brand-red text-sm">{error}</p>}
                <Button variant="primary" size="lg" className="w-full" onClick={handleSignUp}
                  disabled={!name || !email || !password}>
                  Next: Your Interests →
                </Button>
              </motion.div>
            )}

            {/* SIGN UP — STEP 2: PROFILE */}
            {tab === 'signup' && step === 'profile' && (
              <motion.div key="signup-profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-bg-elevated border border-white/10 rounded-2xl p-6 space-y-4">
                <div>
                  <h2 className="font-sora font-extrabold text-xl">Almost there, {name}! {avatar}</h2>
                  <p className="text-white/40 text-xs mt-1">Step 2 of 2 — What are you learning?</p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest block mb-2">I am a...</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STUDYING_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => setStudying(opt)}
                        className={`text-left text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${studying === opt ? 'bg-brand-purple/20 border-brand-purple/50 text-violet-300' : 'bg-bg-surface border-white/10 text-white/50 hover:border-white/25'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest block mb-2">I want to learn... (pick 1+)</label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map(i => (
                      <button key={i} onClick={() => toggleInterest(i)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${interests.includes(i) ? 'bg-brand-cyan/15 border-brand-cyan/40 text-brand-cyan' : 'bg-bg-surface border-white/10 text-white/40 hover:border-white/25'}`}>
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-brand-red text-sm">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setStep('credentials')}>← Back</Button>
                  <Button variant="primary" className="flex-1" onClick={handleSignUp} loading={loading}
                    disabled={!studying || interests.length === 0}>
                    🚀 Start Learning!
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
