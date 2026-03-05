# ⚡ LearnMate

**Gamified AI-powered learning platform for Indian students** — built with Next.js 14, Supabase, and OpenRouter AI.

> Learn · Battle · Code · Level Up

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vishwastiwari01/learnmate-nextjs)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⚔️ **Battle Arena** | Real-time multiplayer quiz battles (Summit Rush, Tug of War, Wave Surfer) |
| 🤖 **AI Tutor** | ChatGPT-style free tutor — notes upload, image paste, voice input, 6 free models |
| 🎨 **AI Visualizer** | Free AI-generated educational diagrams via Pollinations.ai |
| 💻 **Coding Lab** | Python · JavaScript · Java · C · C++ — Block → Fill → Real code challenges |
| 📚 **AI Courses** | AI-generated full courses on any topic |
| 🗺️ **AI Roadmap** | Personalised learning paths from any goal |
| 🏆 **XP System** | Levels, streaks, global leaderboard |

---

## 🚀 Deploy on Vercel (5 minutes)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "🚀 Initial LearnMate deploy"
git remote add origin https://github.com/YOUR_USERNAME/learnmate-nextjs.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Add Environment Variables (see below)
4. Click **Deploy**

### Step 3 — Environment Variables

Add these in Vercel → Project Settings → Environment Variables:

```
OPENROUTER_API_KEY        = sk-or-v1-...         (from openrouter.ai/keys)
NEXT_PUBLIC_SUPABASE_URL  = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...               (Settings → API → service_role)
NEXT_PUBLIC_APP_URL       = https://your-app.vercel.app
```

### Step 4 — Supabase Setup
Run the SQL in `supabase/schema.sql` in your Supabase SQL editor.

---

## 🛠️ Local Development

```bash
npm install
cp .env.local.example .env.local
# Fill in your keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Getting API Keys

| Key | Where to get it |
|-----|----------------|
| `OPENROUTER_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) — free tier available |
| Supabase keys | [supabase.com](https://supabase.com) → Your Project → Settings → API |

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Supabase (PostgreSQL + Realtime)
- **AI**: OpenRouter (Llama, DeepSeek, Gemma, Mistral, Qwen)
- **Image AI**: Pollinations.ai (free)
- **Deployment**: Vercel

---

## 📁 Project Structure

```
learnmate/
├── app/
│   ├── arena/          # Battle multiplayer quiz
│   ├── learn/          # AI Tutor (ChatGPT-style)
│   ├── coding/         # Coding Lab (5 languages)
│   ├── courses/        # AI Course Generator
│   ├── roadmap/        # AI Learning Roadmap
│   ├── dashboard/      # User dashboard
│   └── api/            # API routes (AI, quiz, rooms)
├── components/         # Reusable UI components
├── store/              # Zustand state management
├── lib/                # Supabase, OpenRouter, utils
├── supabase/           # Database schema & setup guide
└── types/              # TypeScript interfaces
```

---

Built with ❤️ for India's 260 million students · India AI Impact Summit 2026
