"use client";
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { motion, useAnimation, useInView } from 'framer-motion'
import Link from 'next/link'

/* ─── MAGIC UI CSS & ANIMATIONS ─────────────────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');

@keyframes shimmer-dark {
  0%, 90%, 100% { background-position: calc(-100% - 50px) 0; }
  30%, 60% { background-position: calc(100% + 50px) 0; }
}

@keyframes gradient-xy {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes border-beam {
  100% { offset-distance: 100%; }
}

.btn-shimmer-dark {
  position: relative; display: inline-flex; items-center; justify-content: center;
  padding: 14px 32px; border-radius: 12px; font-weight: 700; font-family: 'Inter', sans-serif;
  background: #f97316; color: #fff !important; text-decoration: none;
  overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.4);
}
.btn-shimmer-dark:hover { transform: scale(1.02); box-shadow: 0 0 30px rgba(249, 115, 22, 0.6); }
.btn-shimmer-dark::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25) 50%, transparent);
  background-size: 200% 100%;
  animation: shimmer-dark 3s infinite linear;
}

.magic-card-dark {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 24px;
  overflow: hidden;
  transition: all 0.3s;
  backdrop-filter: blur(12px);
}
.magic-card-dark:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-2px);
}
`;

function BorderBeam({ size = 200, duration = 15, colorFrom = "#8b5cf6", colorTo = "#f97316" }) {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", borderRadius: "inherit",
      border: "1.5px solid transparent",
      mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
      maskComposite: "exclude", WebkitMaskComposite: "xor", zIndex: 10
    }}>
      <div style={{
        position: "absolute", aspectRatio: "1/1", width: size,
        animation: `border-beam ${duration}s linear infinite`,
        background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
        offsetPath: `rect(0 auto auto 0 round ${size}px)`,
        offsetAnchor: "90% 50%",
      }} />
    </div>
  );
}

function FlickeringGrid() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-20" style={{ zIndex: 0 }}>
      <defs>
        <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="#a78bfa" opacity="0.4">
            <animate attributeName="opacity" values="0.1;0.7;0.1" dur="4s" repeatCount="indefinite" begin="0s"/>
          </circle>
          <circle cx="18" cy="18" r="1" fill="#f97316" opacity="0.3">
            <animate attributeName="opacity" values="0.1;0.6;0.1" dur="3s" repeatCount="indefinite" begin="1s"/>
          </circle>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)"></rect>
    </svg>
  );
}

const FEATURES = [
  { emoji:'⚔️', label:'Multiplayer Arena', desc:'3 live mini-games — Summit Rush, Tug of War, Wave Surfer' },
  { emoji:'🤖', label:'AI Tutor',           desc:'Chat, get quizzed, and solve problems with AI' },
  { emoji:'💻', label:'Coding Lab',         desc:'Block coding → fill blanks → real Python' },
  { emoji:'📚', label:'Auto Courses',       desc:'AI generates full courses on any topic' },
  { emoji:'🗺️', label:'AI Roadmaps',       desc:'Personalized step-by-step learning paths' },
  { emoji:'🏆', label:'Live Leaderboard',   desc:'Compete globally, earn XP, climb ranks' },
];

export default function LandingDark({ toggleTheme }: { toggleTheme: () => void }) {
  const router = useRouter()
  const { session, initialize, loading } = useAuthStore()

  useEffect(() => { initialize() }, [initialize])
  useEffect(() => { if (session) router.push('/dashboard') }, [session, router])

  if (loading) return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center" style={{ backgroundColor: '#07090F' }}>
      <div className="text-4xl animate-bounce">⚡</div>
    </div>
  )

  return (
    <div className="min-h-screen overflow-hidden font-sans text-white relative selection:bg-brand-purple/30" style={{ backgroundColor: '#07090F', fontFamily: "'Inter', sans-serif" }}>
      <style>{styles}</style>
      
      {/* BACKGROUND (Magic UI Flickering Grid + Glows) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FlickeringGrid />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/10 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-orange/5 rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(249, 115, 22, 0.08)' }}/>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[30%] h-[30%] bg-brand-cyan/10 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(6, 182, 212, 0.08)' }}/>
      </div>

      {/* NAVBAR */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #f97316, #eab308)', display: 'flex', alignItems: 'center', justifyItems: 'center', boxShadow: '0 0 10px rgba(249,115,22,0.4)' }}>
            <span style={{ fontSize: 14, color: 'white', paddingLeft: 7, paddingTop: 3 }}>⚡</span>
          </div>
          <span className="font-sora font-bold text-xl tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>LearnMate</span>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors" title="Switch to Light Mode">
            ☀️
          </button>
          <Link href="/auth" className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/auth" className="text-sm font-bold text-white px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors bg-white/5 backdrop-blur-md">
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center">
        
        {/* Animated Badge */}
        <motion.div initial={{ opacity:0, scale: 0.9 }} animate={{ opacity:1, scale: 1 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-bold mb-8 uppercase tracking-widest relative overflow-hidden" 
          style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.3)', color: '#c4b5fd' }}>
          <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(90deg, transparent, #fff, transparent)', animation: 'shimmer-dark 2.5s infinite' }} />
          <span className="relative z-10 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" style={{ backgroundColor: '#8b5cf6' }}></span> Built for India's Learners</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration: 0.6, delay:0.1 }}
          className="font-sora font-extrabold text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
          <span className="text-white">Learn Smarter.</span><br />
          <span style={{ 
            background: 'linear-gradient(135deg, #f97316 0%, #eab308 50%, #f97316 100%)', 
            backgroundSize: '200% auto',
            animation: 'gradient-xy 4s ease infinite',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
          }}>Win Together.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration: 0.6, delay:0.2 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Stop memorizing, start understanding. Real-time multiplayer battles, AI tutoring, and auto-generated roadmaps to ace any exam.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration: 0.6, delay:0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <Link href="/auth" className="btn-shimmer-dark w-full sm:w-auto">
            Start Learning Free
          </Link>
          <Link href="/arena"
            className="inline-flex items-center justify-center gap-2 border border-white/10 text-white font-semibold px-8 py-3.5 rounded-xl text-base hover:border-white/20 hover:bg-white/5 transition-all w-full sm:w-auto backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
            <span style={{ color: '#f97316' }}>▶</span> Watch a Battle
          </Link>
        </motion.div>
      </div>

      {/* DASHBOARD MOCKUP WITH BORDER BEAM */}
      <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration: 0.8, delay: 0.4 }}
        className="relative z-10 max-w-5xl mx-auto px-6 mb-32 hidden md:block">
        <div className="relative rounded-2xl bg-black/40 border border-white/10 p-2 backdrop-blur-xl shadow-2xl overflow-hidden">
          <BorderBeam duration={12} size={400} />
          <div className="w-full h-80 rounded-xl border border-white/5 bg-[#07090F] flex overflow-hidden">
             {/* Mockup Sidebar */}
             <div className="w-48 border-r border-white/5 p-4 flex flex-col gap-3">
               <div className="text-xs font-bold text-white/30 mb-2 tracking-wider">MENU</div>
               <div className="text-sm text-white/60 flex items-center gap-2"><span className="text-lg">🏠</span> Dashboard</div>
               <div className="text-sm text-white/60 flex items-center gap-2"><span className="text-lg">🗺️</span> Roadmaps</div>
               <div className="text-sm text-white/60 flex items-center gap-2"><span className="text-lg">⚔️</span> Arena</div>
               <div className="w-full h-10 bg-brand-orange/10 border border-brand-orange/20 rounded-lg mt-auto flex items-center justify-center text-xs font-bold text-brand-orange" style={{ borderColor: 'rgba(249,115,22,0.2)' }}>Upgrade Pro</div>
             </div>
             {/* Mockup Main */}
             <div className="flex-1 p-6 flex flex-col gap-6">
               <div className="flex gap-4">
                 <div className="flex-1 h-24 bg-gradient-to-br from-brand-purple/10 to-transparent border border-brand-purple/20 rounded-xl p-4 flex flex-col justify-center" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
                    <div className="text-xs text-white/40 font-bold mb-1">CURRENT STREAK</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">14 Days <span className="text-[#f97316]">🔥</span></div>
                 </div>
                 <div className="flex-1 h-24 bg-gradient-to-br from-brand-cyan/10 to-transparent border border-brand-cyan/20 rounded-xl p-4 flex flex-col justify-center" style={{ borderColor: 'rgba(6,182,212,0.2)' }}>
                    <div className="text-xs text-white/40 font-bold mb-1">GLOBAL RANK</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">#4,291 <span className="text-[#eab308]">🏆</span></div>
                 </div>
               </div>
               <div className="w-full flex-1 bg-white/5 rounded-xl border border-white/5 p-5">
                  <div className="text-sm font-bold text-white mb-4">Recent Activity</div>
                  <div className="flex flex-col gap-3">
                    <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3"><span className="text-xl">🤖</span> <span className="text-sm text-white/80">Completed React Hooks Quiz</span></div>
                      <span className="text-xs font-bold text-brand-cyan">+50 XP</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3"><span className="text-xl">⚔️</span> <span className="text-sm text-white/80">Won Tug of War against <i className="text-white/50">@alex</i></span></div>
                      <span className="text-xs font-bold text-brand-cyan">+120 XP</span>
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* FEATURES GRID */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="font-sora text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: "'Sora', sans-serif" }}>Features that feel like <span className="text-brand-purple" style={{ color: '#a78bfa' }}>magic</span></h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">Everything you need to master your exams without the friction.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.label} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i*0.1 }}
              className="magic-card-dark group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                {f.emoji}
              </div>
              <h3 className="font-sora font-bold text-xl mb-2 text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{f.label}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 mt-12 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
             <span style={{ fontSize: 14 }}>⚡</span>
             <span className="font-sora font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>LearnMate</span>
          </div>
          <div className="text-center text-xs" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
            Powered by OpenRouter AI · Supabase Realtime · Built with Next.js
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
