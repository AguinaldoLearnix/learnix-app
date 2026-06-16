-- ================================================================
-- LEARNIX — Schema completo v1.0
-- Rodar no SQL Editor do Supabase
-- ================================================================

-- ── USERS & PROFILES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  role          TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','group_student','teacher','admin')),
  full_name     TEXT NOT NULL,
  avatar_url    TEXT,
  phone         TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  teacher_id        UUID REFERENCES users(id),
  language          TEXT NOT NULL DEFAULT 'english' CHECK (language IN ('english','spanish')),
  current_level     TEXT NOT NULL DEFAULT 'B1' CHECK (current_level IN ('A1','A2','B1','B2','C1','C2')),
  target_level      TEXT NOT NULL DEFAULT 'B2',
  professional_area TEXT NOT NULL DEFAULT 'general',
  goal              TEXT NOT NULL DEFAULT 'work',
  weekly_frequency  INT NOT NULL DEFAULT 2,
  study_time_daily  INT NOT NULL DEFAULT 20,
  deadline_months   INT,
  difficulties      TEXT[],
  plan_type         TEXT NOT NULL DEFAULT 'standard' CHECK (plan_type IN ('light','standard','intensive','turbo')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial','active','paused','cancelled')),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teacher_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  languages       TEXT[] NOT NULL DEFAULT ARRAY['english'],
  specialties     TEXT[],
  bio             TEXT,
  rate_per_lesson DECIMAL(10,2),
  max_students    INT DEFAULT 20,
  is_available    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── PROGRAMS ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS programs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES users(id),
  group_id        UUID,
  language        TEXT NOT NULL,
  start_level     TEXT NOT NULL,
  target_level    TEXT NOT NULL,
  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date        DATE NOT NULL,
  total_weeks     INT NOT NULL DEFAULT 24,
  goal            TEXT NOT NULL,
  professional_area TEXT,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  generated_by    TEXT DEFAULT 'ai',
  ai_context      JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── WEEKLY UNITS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS weekly_units (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id          UUID REFERENCES programs(id) ON DELETE CASCADE,
  week_number         INT NOT NULL,
  theme               TEXT NOT NULL,
  vocabulary          TEXT[] NOT NULL DEFAULT '{}',
  expressions         TEXT[],
  grammar_focus       TEXT NOT NULL,
  grammar_explanation TEXT,
  can_do_statements   TEXT[],
  pre_lesson_text     TEXT,
  pre_lesson_audio_url TEXT,
  pre_lesson_video_url TEXT,
  pre_lesson_questions TEXT[],
  pre_lesson_task     TEXT,
  lesson_objectives   TEXT[],
  lesson_activities   JSONB,
  post_lesson_task    JSONB,
  available_from      TIMESTAMPTZ DEFAULT now(),
  status              TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','completed')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_id, week_number)
);

-- ── LESSONS ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lessons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES users(id),
  group_id        UUID,
  teacher_id      UUID REFERENCES users(id) NOT NULL,
  unit_id         UUID REFERENCES weekly_units(id),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  duration_min    INT DEFAULT 60,
  meet_url        TEXT,
  status          TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','no_show')),
  cancelled_by    TEXT,
  cancellation_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lesson_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id           UUID UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
  errors_logged       JSONB NOT NULL DEFAULT '[]',
  vocabulary_covered  TEXT[],
  feedback_summary    TEXT NOT NULL DEFAULT '',
  student_performance TEXT CHECK (student_performance IN ('excellent','good','needs_work')),
  next_lesson_note    TEXT,
  task_assigned       JSONB,
  submitted_at        TIMESTAMPTZ DEFAULT now(),
  submitted_by        UUID REFERENCES users(id)
);

-- ── ERROR BANK ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS error_bank (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  category        TEXT NOT NULL CHECK (category IN ('grammar','vocabulary','pronunciation','fluency','writing','structure')),
  description     TEXT NOT NULL,
  example         TEXT,
  correction      TEXT,
  occurrences     INT DEFAULT 1,
  first_seen_at   TIMESTAMPTZ DEFAULT now(),
  last_seen_at    TIMESTAMPTZ DEFAULT now(),
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','improving','resolved')),
  resolved_at     TIMESTAMPTZ,
  source          TEXT DEFAULT 'teacher' CHECK (source IN ('teacher','ai')),
  lesson_id       UUID REFERENCES lessons(id)
);

CREATE INDEX IF NOT EXISTS idx_error_bank_student_active ON error_bank(student_id, status);

-- ── VOCABULARY ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS student_vocabulary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  word            TEXT NOT NULL,
  translation     TEXT,
  context_sentence TEXT,
  unit_id         UUID REFERENCES weekly_units(id),
  learned_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, word)
);

CREATE TABLE IF NOT EXISTS vocab_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vocabulary_id   UUID REFERENCES student_vocabulary(id) ON DELETE CASCADE,
  review_number   INT NOT NULL DEFAULT 1,
  due_at          TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ,
  score           INT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── TASKS & PORTFOLIO ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       UUID REFERENCES lessons(id),
  unit_id         UUID REFERENCES weekly_units(id),
  student_id      UUID REFERENCES users(id),
  type            TEXT NOT NULL CHECK (type IN ('audio','text','quiz','reading')),
  instruction     TEXT NOT NULL,
  due_at          TIMESTAMPTZ NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','submitted','late','skipped')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID REFERENCES tasks(id) ON DELETE CASCADE,
  content_text    TEXT,
  media_url       TEXT,
  transcription   TEXT,
  ai_feedback     TEXT,
  teacher_feedback TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('before_audio','after_audio','text','presentation','audio')),
  title           TEXT,
  media_url       TEXT,
  transcription   TEXT,
  score           INT,
  unit_id         UUID REFERENCES weekly_units(id),
  lesson_id       UUID REFERENCES lessons(id),
  theme           TEXT,
  duration        TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── PROGRESS SNAPSHOTS ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS progress_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  snapshot_month  DATE NOT NULL,
  speaking        INT NOT NULL DEFAULT 0,
  listening       INT NOT NULL DEFAULT 0,
  reading         INT NOT NULL DEFAULT 0,
  writing         INT NOT NULL DEFAULT 0,
  uol             INT NOT NULL DEFAULT 0,
  lessons         INT NOT NULL DEFAULT 0,
  tasks           INT NOT NULL DEFAULT 0,
  ai_sessions     INT NOT NULL DEFAULT 0,
  vocab           INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, snapshot_month)
);

-- ── AI SESSIONS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  unit_id         UUID REFERENCES weekly_units(id),
  mode            TEXT NOT NULL CHECK (mode IN ('vocabulary','writing','speaking','simulation','error_review')),
  messages        JSONB NOT NULL DEFAULT '[]',
  duration_sec    INT,
  words_practiced INT DEFAULT 0,
  errors_found    INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_units        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_bank          ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_vocabulary  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio           ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_snapshots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions         ENABLE ROW LEVEL SECURITY;

-- Users: can read own record
CREATE POLICY "users_self" ON users FOR ALL USING (auth.uid() = id);

-- Student profiles: own data
CREATE POLICY "student_profiles_self" ON student_profiles FOR ALL
  USING (auth.uid() = user_id);

-- Teacher can see their students' profiles
CREATE POLICY "teacher_sees_students" ON student_profiles FOR SELECT
  USING (teacher_id = auth.uid());

-- Programs: student sees own, teacher sees their students'
CREATE POLICY "programs_student" ON programs FOR SELECT
  USING (student_id = auth.uid() OR EXISTS (
    SELECT 1 FROM student_profiles sp WHERE sp.user_id = programs.student_id AND sp.teacher_id = auth.uid()
  ));

-- Weekly units: student sees via program
CREATE POLICY "units_visible" ON weekly_units FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM programs p WHERE p.id = weekly_units.program_id
      AND (p.student_id = auth.uid() OR EXISTS (
        SELECT 1 FROM student_profiles sp WHERE sp.user_id = p.student_id AND sp.teacher_id = auth.uid()
      ))
  ));

-- Lessons: student sees own, teacher sees their lessons
CREATE POLICY "lessons_student" ON lessons FOR SELECT
  USING (student_id = auth.uid() OR teacher_id = auth.uid());

-- Error bank: student reads own, teacher reads/writes their students'
CREATE POLICY "error_bank_student" ON error_bank FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "error_bank_teacher" ON error_bank FOR ALL
  USING (EXISTS (
    SELECT 1 FROM student_profiles sp WHERE sp.user_id = error_bank.student_id AND sp.teacher_id = auth.uid()
  ));

-- Tasks: own only
CREATE POLICY "tasks_self" ON tasks FOR ALL USING (student_id = auth.uid());

-- Portfolio: own only
CREATE POLICY "portfolio_self" ON portfolio FOR ALL USING (student_id = auth.uid());

-- Progress snapshots: own only
CREATE POLICY "snapshots_self" ON progress_snapshots FOR ALL USING (student_id = auth.uid());

-- Vocabulary: own only
CREATE POLICY "vocab_self" ON student_vocabulary FOR ALL USING (student_id = auth.uid());

-- AI sessions: own only
CREATE POLICY "ai_sessions_self" ON ai_sessions FOR ALL USING (student_id = auth.uid());

-- ================================================================
-- TRIGGER: auto-create user record on signup
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Auto-create student profile
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN
    INSERT INTO public.student_profiles (user_id, language, current_level, goal)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'language', 'english'),
      COALESCE(NEW.raw_user_meta_data->>'current_level', 'B1'),
      COALESCE(NEW.raw_user_meta_data->>'goal', 'work')
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
