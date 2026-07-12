-- AtlasOS Database Schema
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE)

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  work_hours_start TIME DEFAULT '08:00',
  work_hours_end TIME DEFAULT '18:00',
  focus_duration_minutes INT DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- MISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('phd','research','business','writing','training','grants','personal')),
  color TEXT DEFAULT '#8B5CF6',
  icon TEXT DEFAULT 'target',
  progress REAL DEFAULT 0,
  deadline TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own missions" ON missions;
CREATE POLICY "Users manage own missions" ON missions FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','blocked','delayed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  progress REAL DEFAULT 0,
  deadline TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  budget REAL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own projects" ON projects;
CREATE POLICY "Users manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PROJECT MISSIONS (junction)
-- ============================================
CREATE TABLE IF NOT EXISTS project_missions (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, mission_id)
);

ALTER TABLE project_missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own project_missions" ON project_missions;
CREATE POLICY "Users manage own project_missions" ON project_missions FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);

-- ============================================
-- MILESTONES
-- ============================================
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','blocked')),
  completed_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own milestones" ON milestones;
CREATE POLICY "Users manage own milestones" ON milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  importance INT DEFAULT 3,
  urgency INT DEFAULT 3,
  estimated_time INT DEFAULT 0,
  actual_time INT DEFAULT 0,
  category TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','blocked','delayed')),
  progress REAL DEFAULT 0,
  difficulty INT DEFAULT 1,
  energy_required TEXT DEFAULT 'medium',
  location TEXT,
  context TEXT,
  ai_suggestion TEXT,
  reflection_after TEXT,
  scheduled_date DATE,
  scheduled_start TIME,
  scheduled_end TIME,
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern TEXT,
  completed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own tasks" ON tasks;
CREATE POLICY "Users manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TASK MISSIONS (junction)
-- ============================================
CREATE TABLE IF NOT EXISTS task_missions (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, mission_id)
);

ALTER TABLE task_missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own task_missions" ON task_missions;
CREATE POLICY "Users manage own task_missions" ON task_missions FOR ALL USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND user_id = auth.uid())
);

-- ============================================
-- SUBTASKS
-- ============================================
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own subtasks" ON subtasks;
CREATE POLICY "Users manage own subtasks" ON subtasks FOR ALL USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND user_id = auth.uid())
);

-- ============================================
-- HABITS
-- ============================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily','weekly','monthly')),
  target_count REAL DEFAULT 1,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own habits" ON habits;
CREATE POLICY "Users manage own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- HABIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  count REAL DEFAULT 1,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own habit_logs" ON habit_logs;
CREATE POLICY "Users manage own habit_logs" ON habit_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM habits WHERE id = habit_id AND user_id = auth.uid())
);

-- ============================================
-- JOURNAL ENTRIES
-- ============================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('morning','evening','reflection')),
  content TEXT,
  mood TEXT CHECK (mood IN ('great','good','neutral','bad','terrible')),
  energy TEXT CHECK (energy IN ('very_low','low','medium','high','very_high')),
  wins TEXT[] DEFAULT '{}',
  challenges TEXT[] DEFAULT '{}',
  lessons_learned TEXT[] DEFAULT '{}',
  gratitude TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, type)
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own journal_entries" ON journal_entries;
CREATE POLICY "Users manage own journal_entries" ON journal_entries FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- KNOWLEDGE ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT CHECK (type IN ('article','idea','note','bookmark','document','video','audio','image','link')),
  tags TEXT[] DEFAULT '{}',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  source TEXT,
  url TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own knowledge_items" ON knowledge_items;
CREATE POLICY "Users manage own knowledge_items" ON knowledge_items FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- RESEARCH PAPERS
-- ============================================
CREATE TABLE IF NOT EXISTS research_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[] DEFAULT '{}',
  journal TEXT,
  year INT,
  doi TEXT,
  url TEXT,
  abstract TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','review','accepted','rejected','to_read','reading','read','reviewed','cited')),
  rating INT DEFAULT 0,
  citations INT DEFAULT 0,
  reading_list BOOLEAN DEFAULT false,
  rejection_journal TEXT,
  rejection_cause TEXT,
  rejection_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add rejection columns if table already existed without them
DO $$ BEGIN
  ALTER TABLE research_papers ADD COLUMN IF NOT EXISTS rejection_journal TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE research_papers ADD COLUMN IF NOT EXISTS rejection_cause TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE research_papers ADD COLUMN IF NOT EXISTS rejection_date DATE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE research_papers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own research_papers" ON research_papers;
CREATE POLICY "Users manage own research_papers" ON research_papers FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- WRITING PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS writing_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('book','article','grant','report','manual','thesis','paper','proposal')),
  description TEXT,
  target_word_count INT DEFAULT 0,
  current_word_count INT DEFAULT 0,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','blocked','delayed')),
  deadline TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE writing_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own writing_projects" ON writing_projects;
CREATE POLICY "Users manage own writing_projects" ON writing_projects FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- WRITING SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS writing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  writing_project_id UUID REFERENCES writing_projects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  word_count INT DEFAULT 0,
  time_spent INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE writing_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own writing_sessions" ON writing_sessions;
CREATE POLICY "Users manage own writing_sessions" ON writing_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM writing_projects WHERE id = writing_project_id AND user_id = auth.uid())
);

-- ============================================
-- BUSINESS CLIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS business_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  type TEXT CHECK (type IN ('client','partner','lead')),
  status TEXT DEFAULT 'lead' CHECK (status IN ('active','inactive','lead')),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE business_clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own business_clients" ON business_clients;
CREATE POLICY "Users manage own business_clients" ON business_clients FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES business_clients(id) ON DELETE SET NULL,
  number TEXT NOT NULL,
  amount REAL DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own invoices" ON invoices;
CREATE POLICY "Users manage own invoices" ON invoices FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- CALENDAR EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  type TEXT CHECK (type IN ('task','meeting','focus','break','appointment','deadline')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  color TEXT,
  recurring TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own calendar_events" ON calendar_events;
CREATE POLICY "Users manage own calendar_events" ON calendar_events FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own activity" ON activity_log;
CREATE POLICY "Users view own activity" ON activity_log FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own activity" ON activity_log;
CREATE POLICY "Users insert own activity" ON activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- GAMIFICATION
-- ============================================
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  total_xp_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own level" ON user_levels;
CREATE POLICY "Users view own level" ON user_levels FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own level" ON user_levels;
CREATE POLICY "Users update own level" ON user_levels FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  xp_reward INT DEFAULT 0,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, code)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own achievements" ON achievements;
CREATE POLICY "Users view own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own achievements" ON achievements;
CREATE POLICY "Users insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AI RECOMMENDATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('warning','suggestion','insight','achievement','reminder')),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  category TEXT,
  action_label TEXT,
  action_link TEXT,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own recommendations" ON ai_recommendations;
CREATE POLICY "Users view own recommendations" ON ai_recommendations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own recommendations" ON ai_recommendations;
CREATE POLICY "Users update own recommendations" ON ai_recommendations FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES (IF NOT EXISTS)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_user_id ON knowledge_items(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created ON activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_start ON calendar_events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_projects_user_id ON writing_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_research_papers_user_id ON research_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_business_clients_user_id ON business_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);

-- ============================================
-- TRIGGER: auto-create profile on signup (OR REPLACE)
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_levels (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
