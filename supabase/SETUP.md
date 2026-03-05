# Supabase Setup for LearnMate

## ✅ Already Done
Your schema is live! Tables created:
- `profiles` — user data, XP, level, streak
- `game_rooms` — arena rooms with realtime
- `game_players` — players in each room  
- `game_answers` — answer audit trail
- `courses` — prebuilt + AI-generated courses
- `course_progress` — per-user lesson completion
- `roadmaps` — AI-generated learning paths
- `learn_sessions` — AI tutor chat history
- `coding_submissions` — code challenge history
- `xp_events` — full XP ledger

## 🔑 Get Your Keys

1. Go to **Settings → API** in your Supabase dashboard
2. Copy these 3 values into your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://wxihzwkrmvhphuethstp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 🔐 Auth Settings

1. Go to **Authentication → Settings**
2. Set **Site URL** to: `http://localhost:3000` (dev) or your Vercel URL (prod)
3. Add redirect URLs:
   - `http://localhost:3000/**`
   - `https://your-app.vercel.app/**`
4. **Disable email confirmations** for dev:
   - Auth → Settings → uncheck "Enable email confirmations"

## 📡 Realtime

Already enabled in schema for:
- `game_rooms` — room status changes
- `game_players` — player score updates  
- `game_answers` — new answers submitted

## 🚀 Deploy to Vercel

1. Push to GitHub
2. vercel.com → Import project
3. Add ALL env variables from `.env.local`
4. Update Supabase Site URL to your Vercel URL
5. Deploy!

## Database Tables Quick Reference

| Table | Purpose |
|-------|---------|
| `profiles` | Extended user data (links to `auth.users`) |
| `game_rooms` | Active/past arena game rooms |
| `game_players` | Players in each room |
| `game_answers` | Every answer submitted (anti-cheat) |
| `courses` | Course catalog (prebuilt + AI-gen) |
| `course_progress` | Which lessons each user completed |
| `roadmaps` | User's AI-generated learning paths |
| `learn_sessions` | AI tutor conversation history |
| `coding_submissions` | Code challenge attempts |
| `xp_events` | Full ledger of XP earned |

## Useful SQL Queries

```sql
-- See all users with XP
SELECT name, avatar, xp, level, streak FROM profiles ORDER BY xp DESC;

-- See active game rooms
SELECT code, subject, game_type, status, player_count 
FROM rooms_with_players WHERE status != 'finished';

-- Award XP manually
SELECT award_xp('user-uuid-here', 100, 'admin_bonus');
```
