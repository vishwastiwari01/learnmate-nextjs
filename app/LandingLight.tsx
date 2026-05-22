"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import TractionSection from "@/components/ui/TractionSection";
import ThemeSwitch from "@/components/ui/ThemeSwitch";

/* ─── DESIGN TOKENS (Magic UI / 21st.dev Style) ─────────────── */
const T = {
  bg:       "#FAFAFA",
  surface:  "#FFFFFF",
  border:   "#E4E4E7",
  borderHov:"#D4D4D8",
  text:     "#09090B",
  textMid:  "#52525B",
  textMute: "#71717A",
  
  primary:      "#000000",
  primaryHover: "#27272A",
  
  accent:       "#3B82F6",
  accentGlow:   "rgba(59, 130, 246, 0.5)",
};

/* ─── GLOBAL STYLES ─────────────────────────────────────────── */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
.light-theme-body {
  background: ${T.bg};
  color: ${T.text};
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Magic UI Keyframes */
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100% - 1rem)); }
}
@keyframes border-beam {
  100% { offset-distance: 100%; }
}
@keyframes shimmer {
  0%, 90%, 100% {
    background-position: calc(-100% - var(--shimmer-width)) 0;
  }
  30%, 60% {
    background-position: calc(100% + var(--shimmer-width)) 0;
  }
}

.heading-sora { font-family: 'Sora', sans-serif; letter-spacing: -0.04em; }

/* Shimmer Button */
.btn-shimmer {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 28px; border-radius: 9999px; font-weight: 600;
  background: ${T.primary}; color: #fff !important; text-decoration: none;
  overflow: hidden; transition: transform 0.2s;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}
.btn-shimmer:hover { transform: scale(1.02); box-shadow: 0 0 30px rgba(0,0,0,0.15); }
.btn-shimmer::after {
  content: ""; position: absolute; inset: 0;
  --shimmer-width: 50px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2) 50%,
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 3s infinite linear;
}

.btn-outline {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: ${T.surface}; color: ${T.text} !important;
  font-family: 'Inter', sans-serif; font-weight: 600; font-size: 15px;
  padding: 12px 28px; border-radius: 9999px;
  border: 1px solid ${T.border}; text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.btn-outline:hover { background: #f4f4f5; }

/* Magic Card */
.magic-card {
  position: relative;
  background: ${T.surface};
  border-radius: 24px;
  border: 1px solid ${T.border};
  padding: 32px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}
.magic-card:hover {
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05);
}
`;

/* ─── COMPONENTS ─────────────────────────────────────────────────── */
function DotPattern() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-50" style={{ zIndex: 0 }}>
      <defs>
        <pattern id="dot-pattern" width="16" height="16" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
          <circle id="pattern-circle" cx="1" cy="1" r="1" fill="#D4D4D8"></circle>
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth="0" fill="url(#dot-pattern)"></rect>
    </svg>
  );
}

function BorderBeam({ size = 200, duration = 15, anchor = 90, borderWidth = 1.5, colorFrom = "#ffaa40", colorTo = "#9c40ff", delay = 0 }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0, pointerEvents: "none", borderRadius: "inherit",
        border: `${borderWidth}px solid transparent`,
        mask: `linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)`,
        maskComposite: "exclude", WebkitMaskComposite: "xor", zIndex: 10
      }}
    >
      <div
        style={{
          position: "absolute", aspectRatio: "1/1", width: size,
          animation: `border-beam ${duration}s linear infinite`,
          animationDelay: `-${delay}s`,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          offsetAnchor: `${anchor}% 50%`,
        }}
      />
    </div>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────────────────── */
function Navbar({ toggleTheme, theme }: { toggleTheme: () => void; theme: string | undefined }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 100,
      width: "calc(100% - 48px)", maxWidth: 1000,
      height: 56, borderRadius: 9999,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 8px 0 24px",
      background: scrolled ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.9)",
      backdropFilter: "blur(24px)",
      border: `1px solid ${T.border}`,
      boxShadow: scrolled ? "0 4px 24px -8px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <span className="heading-sora" style={{ fontWeight: 700, fontSize: 18, color: T.text }}>LearnMate</span>
      </div>

      <div style={{ display: "none", gap: 32, "@media (min-width: 768px)": { display: "flex" } } as React.CSSProperties}>
        {["Features", "Battle", "Pricing"].map(l => (
          <a key={l} href="#" style={{ fontSize: 13, fontWeight: 500, color: T.textMute, textDecoration: "none" }}
          onMouseEnter={e => (e.target as HTMLElement).style.color = T.text}
          onMouseLeave={e => (e.target as HTMLElement).style.color = T.textMute}>{l}</a>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
        <Link href="/auth" style={{
          background: T.text, color: "#fff", fontSize: 13, fontStyle: "normal", fontWeight: 600, textDecoration: "none",
          padding: "8px 16px", borderRadius: 9999,
        }}>Get Started</Link>
      </div>
    </nav>
  );
}

/* ─── HERO ───────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      position: "relative", zIndex: 1, paddingTop: 160, paddingBottom: 100,
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      overflow: "hidden"
    }}>
      <DotPattern />
      
      {/* Glow behind text */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)",
        width: "60vw", height: "40vw", background: "radial-gradient(ellipse, rgba(59,130,246,0.15), transparent 60%)",
        filter: "blur(60px)", zIndex: -1, pointerEvents: "none"
      }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 9999, padding: "6px 16px", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T.textMid }}>Introducing LearnMate</span>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="heading-sora" style={{
        fontWeight: 800, fontSize: "clamp(48px, 7vw, 84px)",
        lineHeight: 1.05, color: T.text, maxWidth: 900, marginBottom: 24, position: "relative", zIndex: 1
      }}>
        Learning <span style={{ color: T.textMute }}>reimagined</span> for the <br/>
        <span style={{ 
          background: "linear-gradient(to right, #000000, #3B82F6)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>AI generation.</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        style={{ fontSize: "clamp(16px, 2vw, 20px)", color: T.textMute, maxWidth: 600, lineHeight: 1.6, marginBottom: 40 }}>
        Stop memorizing, start understanding. Real-time multiplayer battles, AI tutoring, and smart roadmaps to ace any exam.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
        style={{ display: "flex", gap: 16, zIndex: 10 }}>
        <Link href="/auth" className="btn-shimmer">Start Learning Free</Link>
        <Link href="/arena" className="btn-outline">Watch Battle</Link>
      </motion.div>

      {/* Dashboard Graphic */}
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
        style={{ marginTop: 80, width: "100%", maxWidth: 1000, padding: "0 24px", position: "relative" }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(20px)",
          border: `1px solid ${T.border}`, borderRadius: 24, padding: 8,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05)",
          position: "relative", overflow: "hidden"
        }}>
          <BorderBeam duration={8} size={300} />
          
          <div style={{ background: "#FFFFFF", borderRadius: 16, height: 500, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }} />
              </div>
              <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: T.textMute, fontWeight: 500, background: T.bg, padding: "6px", borderRadius: 6, maxWidth: 300, margin: "0 auto" }}>learnmate.app / arena</div>
            </div>
            
            <div style={{ display: "flex", flex: 1, background: T.bg }}>
              {/* Sidebar */}
              <div style={{ width: 220, borderRight: `1px solid ${T.border}`, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>MENU</div>
                <div style={{ fontSize: 14, color: T.textMid, display: "flex", gap: 8, alignItems: "center" }}><span>🏠</span> Dashboard</div>
                <div style={{ fontSize: 14, color: T.textMid, display: "flex", gap: 8, alignItems: "center" }}><span>🗺️</span> Roadmaps</div>
                <div style={{ fontSize: 14, color: T.textMid, display: "flex", gap: 8, alignItems: "center" }}><span>⚔️</span> Arena</div>
                <div style={{ marginTop: "auto", height: 40, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: T.text }}>Upgrade Pro</div>
              </div>
              {/* Main */}
              <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1, height: 120, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", padding: 20 }}>
                    <div style={{ fontSize: 13, color: T.textMute, fontWeight: 500, marginBottom: 4 }}>CURRENT STREAK</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: T.accent, display: "flex", alignItems: "center", gap: 8 }}>14 Days 🔥</div>
                  </div>
                  <div style={{ flex: 1, height: 120, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", padding: 20 }}>
                    <div style={{ fontSize: 13, color: T.textMute, fontWeight: 500, marginBottom: 4 }}>GLOBAL RANK</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: 8 }}>#4,291 🏆</div>
                  </div>
                </div>
                <div style={{ flex: 1, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", padding: 24 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 16 }}>Recent Activity</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ padding: "12px 16px", background: T.bg, border: `1px solid ${T.borderHov}`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}><span style={{ fontSize: 18 }}>🤖</span> <span style={{ fontSize: 14, fontWeight: 500, color: T.textMid }}>Completed React Hooks Quiz</span></div>
                      <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>+50 XP</span>
                    </div>
                    <div style={{ padding: "12px 16px", background: T.bg, border: `1px solid ${T.borderHov}`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}><span style={{ fontSize: 18 }}>⚔️</span> <span style={{ fontSize: 14, fontWeight: 500, color: T.textMid }}>Won Tug of War against <i>@alex</i></span></div>
                      <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>+120 XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── MARQUEE ────────────────────────────────────────────────────── */
function MagicMarquee() {
  const items = ["🔥 Real-time Multiplayer", "🤖 Personalized AI Tutor", "🗺️ Smart Roadmaps", "📚 Auto-generated Courses", "🏆 Live Leaderboards"];
  return (
    <div style={{ padding: "40px 0", background: "#fff", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, overflow: "hidden", display: "flex" }}>
      <div style={{ display: "flex", minWidth: "100%", gap: "1rem", animation: "marquee 20s linear infinite" }}>
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} style={{ 
            background: T.bg, border: `1px solid ${T.border}`, borderRadius: 9999, padding: "12px 24px",
            fontSize: 14, fontWeight: 600, color: T.text, whiteSpace: "nowrap", display: "flex", alignItems: "center"
          }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── FEATURES ───────────────────────────────────────────────────── */
function Features() {
  const cards = [
    { icon: "⚔️", title: "Battle Arena", desc: "Compete with friends in real-time. Answer faster, earn more XP, and conquer the leaderboards." },
    { icon: "🧠", title: "Socratic AI", desc: "An AI that doesn't just give answers, but guides you to find them yourself through intelligent questioning." },
    { icon: "🗺️", title: "Dynamic Paths", desc: "Just type what you want to learn. We instantly generate a structured roadmap with milestones." },
  ];

  return (
    <section style={{ padding: "120px 24px", background: "#fff", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <h2 className="heading-sora" style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: T.text, marginBottom: 16 }}>
            The ultimate toolkit for <br/> <span style={{ color: T.accent }}>modern learners.</span>
          </h2>
          <p style={{ fontSize: 18, color: T.textMute, maxWidth: 600, margin: "0 auto" }}>
            Everything you need to master concepts 10x faster, in one unified platform.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32 }}>
          {cards.map((c, i) => (
            <div key={i} className="magic-card">
              <div style={{ width: 56, height: 56, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                {c.icon}
              </div>
              <h3 className="heading-sora" style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{c.title}</h3>
              <p style={{ fontSize: 16, color: T.textMute, lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA FOOTER ─────────────────────────────────────────────────── */
function CTAFooter() {
  return (
    <section style={{ padding: "120px 24px 40px", background: T.bg, position: "relative", overflow: "hidden" }}>
      <DotPattern />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", textAlign: "center", background: "#fff", border: `1px solid ${T.border}`, borderRadius: 32, padding: "80px 40px", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)" }}>
        <h2 className="heading-sora" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: T.text, marginBottom: 24, lineHeight: 1.1 }}>
          Ready to level up?
        </h2>
        <p style={{ fontSize: 18, color: T.textMute, marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}>
          Join over 2.4 lakh learners already winning their battles and mastering subjects daily. 
        </p>
        <Link href="/auth" className="btn-shimmer" style={{ fontSize: 16, padding: "16px 40px" }}>
          Join LearnMate Free
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: "80px auto 0", borderTop: `1px solid ${T.border}`, paddingTop: 32, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <span className="heading-sora" style={{ fontWeight: 700, fontSize: 16 }}>LearnMate</span>
        </div>
        <p style={{ fontSize: 14, color: T.textMute }}>© 2026 LearnMate Inc.</p>
      </div>
    </section>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────────── */
export default function LearnMateLight({ toggleTheme, theme }: { toggleTheme: () => void; theme: string | undefined }) {
  return (
    <div className="light-theme-body">
      <style>{G}</style>
      <Navbar toggleTheme={toggleTheme} theme={theme} />
      <Hero />
      <MagicMarquee />
      <Features />
      <TractionSection />
      <CTAFooter />
    </div>
  );
}
