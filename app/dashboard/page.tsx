'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserStore } from '@/store/useUserStore'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { Nav } from '@/components/layout/Nav'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getLeaderboard } from '@/lib/supabase'
import { xpProgress } from '@/lib/utils'
import { Flame, Zap, Trophy } from 'lucide-react'

const QUICK_ACTIONS = [
  { href: '/arena',   emoji: '⚔️', label: 'Battle Arena',   desc: 'Real-time multiplayer quiz battles',     cta: 'Find Match', glow: 'orange' as const },
  { href: '/learn',   emoji: '🤖', label: 'AI Tutor',       desc: 'Chat with AI, get quizzed, solve ideas', cta: 'Ask AI',     glow: 'cyan'   as const },
  { href: '/coding',  emoji: '💻', label: 'Coding Lab',     desc: 'Blocks → fill blanks → real Python',     cta: 'Code Now',   glow: 'green'  as const },
  { href: '/courses', emoji: '📚', label: 'Courses',        desc: 'AI-generated + curated learning tracks',  cta: 'Browse',     glow: 'purple' as const },
  { href: '/roadmap', emoji: '🗺️', label: 'My Roadmap',    desc: 'AI builds your personal learning path',   cta: 'View Path',  glow: 'orange' as const },
]

interface LeaderboardEntry { id: string; name: string; avatar: string; xp: number; level: number; streak: number }
const DAYS = ['M','T','W','T','F','S','S']

export default function Dashboard() {
  const { profile, initialize } = useAuthStore()
  const { apiKey } = useUserStore()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => { initialize() }, [initialize])
  useEffect(() => {
    getLeaderboard().then(({ data }) => { if (data) setLeaderboard(data as LeaderboardEntry[]) })
  }, [])

  if (!profile) return null
  const progress = xpProgress(profile.xp)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const myRank = leaderboard.findIndex(p => p.id === profile.id) + 1

  return (
    <AuthGuard>
      <div className="min-h-screen bg-bg-base">
        <Nav />
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-8 page-enter">

          {!apiKey && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
              className="mb-4 px-4 py-3 bg-brand-orange/10 border border-brand-orange/25 rounded-xl flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm">⚡ <strong>Add your OpenRouter key</strong> to unlock AI features.</div>
              <Badge variant="orange">⚙️ Click Settings top-right</Badge>
            </motion.div>
          )}

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-sora font-extrabold text-2xl md:text-3xl tracking-tight">
                {greeting}, <span className="grad-orange">{profile.name}</span> {profile.avatar}
              </h1>
              <p className="text-white/40 text-sm mt-1">{profile.studying_what}</p>
            </div>
            <Card className="min-w-[200px]">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Level Progress</div>
              <div className="font-sora font-extrabold text-3xl text-brand-yellow leading-none mb-2">{progress.level}</div>
              <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden mb-1">
                <motion.div initial={{ width:0 }} animate={{ width:`${progress.percent}%` }} transition={{ duration:0.8, delay:0.3 }}
                  className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full" />
              </div>
              <div className="flex justify-between text-[10px] text-white/30 font-bold">
                <span>{progress.current} XP</span><span>{progress.needed} XP</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <Flame size={18}/>, val: profile.streak, label:'Day Streak', color:'text-brand-orange' },
              { icon: <Zap   size={18}/>, val: profile.xp,     label:'Total XP',   color:'text-brand-yellow' },
              { icon: <Trophy size={18}/>, val: myRank > 0 ? `#${myRank}` : '–', label:'Global Rank', color:'text-brand-purple' },
            ].map(({ icon, val, label, color }) => (
              <motion.div key={label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
                <Card className="text-center py-3">
                  <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
                  <div className={`font-sora font-extrabold text-xl ${color}`}>{val}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{label}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-[11px] font-bold text-white/25 uppercase tracking-widest mb-3">Quick Actions</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {QUICK_ACTIONS.map(({ href, emoji, label, desc, cta, glow }, i) => (
              <motion.div key={href} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
                <Link href={href}>
                  <Card glow={glow} hover className="h-full group cursor-pointer">
                    <div className="text-3xl mb-3">{emoji}</div>
                    <div className="font-sora font-bold text-base mb-1">{label}</div>
                    <div className="text-white/40 text-xs leading-relaxed mb-4">{desc}</div>
                    <div className="text-xs font-bold text-white/30 group-hover:text-white transition-colors">{cta} →</div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-bold text-white/25 uppercase tracking-widest">Global Leaderboard</div>
                <Badge variant="green">🔴 Live</Badge>
              </div>
              {leaderboard.length === 0 ? (
                <div className="text-white/30 text-sm py-4 text-center">Loading rankings...</div>
              ) : (
                <div className="space-y-1">
                  {leaderboard.slice(0, 6).map((p, i) => (
                    <div key={p.id} className={`flex items-center gap-3 px-2 py-2 rounded-lg ${p.id === profile.id ? 'bg-brand-purple/10 border border-brand-purple/20' : ''}`}>
                      <div className="font-sora font-extrabold text-sm w-5 text-center"
                        style={{ color: i===0?'#F5C542':i===1?'#c0c0c0':i===2?'#cd7f32':'#4A5568' }}>{i+1}</div>
                      <div className="text-lg">{p.avatar}</div>
                      <div className="flex-1 text-sm font-semibold truncate">
                        {p.name} {p.id === profile.id && <Badge variant="purple" className="ml-1">you</Badge>}
                      </div>
                      <div className="text-xs font-bold text-brand-yellow">⚡{p.xp.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="flex flex-col gap-3">
              <Card>
                <div className="text-[11px] font-bold text-white/25 uppercase tracking-widest mb-2">Weekly Streak</div>
                <div className="font-sora font-extrabold text-4xl text-brand-orange leading-none mb-3">{profile.streak} 🔥</div>
                <div className="flex gap-1.5">
                  {DAYS.map((d, i) => (
                    <div key={i} className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold
                      ${i < profile.streak % 7 ? 'bg-brand-orange text-white' : i === profile.streak % 7 ? 'bg-gradient-to-br from-brand-orange to-brand-yellow text-white' : 'bg-white/5 text-white/20 border border-white/8'}`}>
                      {d}
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <div className="text-[11px] font-bold text-white/25 uppercase tracking-widest mb-2">Your Interests</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {profile.interests.slice(0, 5).map(i => <Badge key={i} variant="purple">{i}</Badge>)}
                </div>
                <Link href="/roadmap">
                  <Button variant="ghost" size="sm" className="w-full">🗺️ Generate My Roadmap →</Button>
                </Link>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
