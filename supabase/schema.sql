-- ═══════════════════════════════════════════════════════
-- LEARNMATE — SUPABASE SCHEMA
-- Run this entire file in: Supabase → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════

-- ── ENABLE UUID EXTENSION ────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════
-- 1. PROFILES (extends Supabase auth.users)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name            TEXT NOT NULL,
  avatar          TEXT DEFAULT '🦊',
  studying_what   TEXT DEFAULT 'Self Learner',
  interests       TEXT[] DEFAULT '{}',
  xp              INTEGER DEFAULT 0 CHECK (xp >= 0),
  level           INTEGER DEFAULT 1 CHECK (level >= 1),
  streak          INTEGER DEFAULT 0 CHECK (streak >= 0),
  last_active     DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '🦊')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════
-- 2. XP EVENTS (ledger of all XP earned)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS xp_events (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount      INTEGER NOT NULL,
  reason      TEXT NOT NULL,  -- 'quiz_correct', 'coding_solve', 'course_lesson', etc.
  room_id     UUID,           -- FK added after game_rooms table
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- 3. GAME ROOMS (Arena)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS game_rooms (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL,
  host_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  host_name   TEXT NOT NULL,
  subject     TEXT NOT NULL DEFAULT 'Physics',
  difficulty  TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  game_type   TEXT NOT NULL DEFAULT 'summit' CHECK (game_type IN ('summit','tugofwar','surfer')),
  status      TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby','playing','finished')),
  questions   JSONB DEFAULT '[]',   -- cached Question[] array
  current_q   INTEGER DEFAULT 0,
  max_players INTEGER DEFAULT 8,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  started_at  TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

-- Add FK from xp_events to game_rooms (now that game_rooms exists)
ALTER TABLE xp_events
  ADD CONSTRAINT fk_xp_room
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE SET NULL;

-- ═══════════════════════════════════════════════════════
-- 4. GAME PLAYERS (who's in each room)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS game_players (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id      UUID REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,  -- null = guest
  player_name  TEXT NOT NULL,
  avatar       TEXT DEFAULT '🦊',
  score        INTEGER DEFAULT 0,
  energy       INTEGER DEFAULT 0,
  is_host      BOOLEAN DEFAULT FALSE,
  is_ready     BOOLEAN DEFAULT FALSE,
  team         TEXT CHECK (team IN ('red','blue','none')) DEFAULT 'none',
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)  -- one row per user per room
);

-- ═══════════════════════════════════════════════════════
-- 5. GAME ANSWERS (audit trail, anti-cheat)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS game_answers (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id       UUID REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
  player_id     UUID REFERENCES game_players(id) ON DELETE CASCADE NOT NULL,
  question_idx  INTEGER NOT NULL,
  chosen        TEXT NOT NULL,   -- 'A','B','C','D'
  correct       BOOLEAN NOT NULL,
  time_taken_ms INTEGER,         -- ms to answer (anti-cheat: flag < 500ms)
  score_gained  INTEGER DEFAULT 0,
  answered_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- 6. COURSES
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS courses (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT,
  emoji            TEXT DEFAULT '📚',
  category         TEXT DEFAULT 'General',
  difficulty       TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  estimated_hours  INTEGER DEFAULT 5,
  is_prebuilt      BOOLEAN DEFAULT FALSE,
  tags             TEXT[] DEFAULT '{}',
  modules          JSONB DEFAULT '[]',  -- CourseModule[]
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- 7. USER COURSE PROGRESS
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS course_progress (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id         UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  completed_lessons TEXT[] DEFAULT '{}',  -- array of lesson IDs
  started_at        TIMESTAMPTZ DEFAULT NOW(),
  last_active       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ═══════════════════════════════════════════════════════
-- 8. ROADMAPS
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS roadmaps (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title               TEXT NOT NULL,
  goal                TEXT NOT NULL,
  nodes               JSONB NOT NULL DEFAULT '[]',  -- RoadmapNode[]
  node_statuses       JSONB DEFAULT '{}',           -- { nodeId: status }
  completion_percent  INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER roadmaps_updated_at
  BEFORE UPDATE ON roadmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════
-- 9. LEARN SESSIONS (AI tutor chat history)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS learn_sessions (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject     TEXT NOT NULL,
  messages    JSONB DEFAULT '[]',   -- ChatMessage[]
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER learn_sessions_updated_at
  BEFORE UPDATE ON learn_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════
-- 10. CODING SUBMISSIONS
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS coding_submissions (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id   TEXT NOT NULL,
  level          TEXT NOT NULL CHECK (level IN ('blocks','fill','real')),
  code           TEXT,
  passed         BOOLEAN DEFAULT FALSE,
  xp_awarded     INTEGER DEFAULT 0,
  submitted_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- REALTIME — Enable on tables that need live updates
-- ═══════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_answers;

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players       ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps           ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_submissions ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select_all"  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own"  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON profiles FOR UPDATE USING (auth.uid() = id);

-- XP EVENTS
CREATE POLICY "xp_select_own"  ON xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "xp_insert_own"  ON xp_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- GAME ROOMS (everyone can read, only host can update)
CREATE POLICY "rooms_select_all"    ON game_rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert_auth"   ON game_rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rooms_update_host"   ON game_rooms FOR UPDATE USING (auth.uid() = host_id);

-- GAME PLAYERS (everyone can read, players manage their own row)
CREATE POLICY "players_select_all"   ON game_players FOR SELECT USING (true);
CREATE POLICY "players_insert_auth"  ON game_players FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "players_update_own"   ON game_players FOR UPDATE USING (auth.uid() = user_id);

-- GAME ANSWERS
CREATE POLICY "answers_select_all"   ON game_answers FOR SELECT USING (true);
CREATE POLICY "answers_insert_auth"  ON game_answers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- COURSES (prebuilt = public, user-generated = owner only)
CREATE POLICY "courses_select_all"   ON courses FOR SELECT USING (is_prebuilt OR auth.uid() = created_by);
CREATE POLICY "courses_insert_auth"  ON courses FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "courses_update_own"   ON courses FOR UPDATE USING (auth.uid() = created_by);

-- COURSE PROGRESS
CREATE POLICY "progress_own"  ON course_progress FOR ALL USING (auth.uid() = user_id);

-- ROADMAPS
CREATE POLICY "roadmaps_own"  ON roadmaps FOR ALL USING (auth.uid() = user_id);

-- LEARN SESSIONS
CREATE POLICY "learn_own"  ON learn_sessions FOR ALL USING (auth.uid() = user_id);

-- CODING SUBMISSIONS
CREATE POLICY "coding_own"  ON coding_submissions FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- USEFUL VIEWS
-- ═══════════════════════════════════════════════════════

-- Leaderboard (top 50 by XP)
CREATE OR REPLACE VIEW leaderboard AS
  SELECT id, name, avatar, xp, level, streak, studying_what
  FROM profiles
  ORDER BY xp DESC
  LIMIT 50;

-- Room with player count
CREATE OR REPLACE VIEW rooms_with_players AS
  SELECT
    r.*,
    COUNT(p.id) AS player_count
  FROM game_rooms r
  LEFT JOIN game_players p ON p.room_id = r.id
  GROUP BY r.id;

-- ═══════════════════════════════════════════════════════
-- HELPER FUNCTION: award XP and update profile level
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_amount  INTEGER,
  p_reason  TEXT,
  p_room_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_xp    INTEGER;
  new_level INTEGER;
BEGIN
  -- Insert XP event
  INSERT INTO xp_events (user_id, amount, reason, room_id)
  VALUES (p_user_id, p_amount, p_reason, p_room_id);

  -- Update profile XP + recalculate level (level = floor(sqrt(xp/100)) + 1)
  UPDATE profiles
  SET
    xp    = xp + p_amount,
    level = FLOOR(SQRT((xp + p_amount) / 100.0))::INTEGER + 1
  WHERE id = p_user_id
  RETURNING xp INTO new_xp;

  RETURN new_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_game_rooms_code        ON game_rooms(code);
CREATE INDEX IF NOT EXISTS idx_game_rooms_status      ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_players_room      ON game_players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_answers_room      ON game_answers(room_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_user         ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_user   ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user          ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_learn_sessions_user    ON learn_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_user ON coding_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_xp            ON profiles(xp DESC);

-- ═══════════════════════════════════════════════════════
-- DONE ✅
-- Tables: profiles, xp_events, game_rooms, game_players,
--         game_answers, courses, course_progress,
--         roadmaps, learn_sessions, coding_submissions
-- ═══════════════════════════════════════════════════════
