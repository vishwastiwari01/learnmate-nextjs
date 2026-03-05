# ⚡ LearnMate

India's AI-powered gamified learning platform.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Add your OpenRouter key (same as app.py OPENROUTER_API_KEY)

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

## Deploy to Vercel

```bash
# Push to GitHub, then:
# 1. Go to vercel.com → New Project → Import your repo
# 2. Add environment variables in Vercel dashboard
# 3. Deploy!
```

## Environment Variables

```
OPENROUTER_API_KEY=sk-or-v1-...   # Same as app.py
NEXT_PUBLIC_SUPABASE_URL=...       # Optional for now
NEXT_PUBLIC_SUPABASE_ANON_KEY=...  # Optional for now
```

## Tech Stack

- **Next.js 14** (App Router + TypeScript)
- **Tailwind CSS** + custom design system
- **Framer Motion** animations
- **Zustand** state management
- **OpenRouter AI** (Llama, DeepSeek, Gemma — all free)
- **Canvas API** for mini-games

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing + Onboarding |
| `/dashboard` | Student home |
| `/arena` | Multiplayer quiz battles + mini games |
| `/learn` | AI Tutor + quiz mode |
| `/coding` | Block coding → fill blanks → real Python |
| `/courses` | Pre-built + AI-generated courses |
| `/roadmap` | AI learning roadmap generator |

## Mini Games (Arena)

- 🏔️ **Summit Rush** — Canvas-based climbing race
- 🪢 **Tug of War** — Real-time rope physics with teams
- 🏄 **Wave Surfer** — Animated ocean surfing race

Made with ❤️ for India's learners.
