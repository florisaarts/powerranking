-- Schema voor trainingsschemas
-- Voer dit uit in de Supabase SQL Editor

-- Trainingsschema tabel
CREATE TABLE IF NOT EXISTS training_schedules (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade not null,
  name text not null,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Training sessies binnen een schema
CREATE TABLE IF NOT EXISTS training_sessions (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references training_schedules(id) on delete cascade not null,
  name text not null,
  description text,
  scheduled_date date not null,
  scheduled_time time,
  duration_minutes integer,
  location text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Deelname aan training sessies
CREATE TABLE IF NOT EXISTS training_attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references training_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'attending', 'not_attending', 'completed')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(session_id, user_id)
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE training_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_attendance ENABLE ROW LEVEL SECURITY;

-- TRAINING_SCHEDULES policies
-- Groepsleden kunnen schemas van hun groepen zien
CREATE POLICY "training_schedules_select_policy" ON training_schedules
  FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Groepsleden kunnen schemas maken
CREATE POLICY "training_schedules_insert_policy" ON training_schedules
  FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Creators kunnen updaten
CREATE POLICY "training_schedules_update_policy" ON training_schedules
  FOR UPDATE
  USING (created_by = auth.uid());

-- Creators kunnen verwijderen
CREATE POLICY "training_schedules_delete_policy" ON training_schedules
  FOR DELETE
  USING (created_by = auth.uid());


-- TRAINING_SESSIONS policies
-- Groepsleden kunnen sessies van hun groep schemas zien
CREATE POLICY "training_sessions_select_policy" ON training_sessions
  FOR SELECT
  USING (
    schedule_id IN (
      SELECT id FROM training_schedules
      WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Groepsleden kunnen sessies maken
CREATE POLICY "training_sessions_insert_policy" ON training_sessions
  FOR INSERT
  WITH CHECK (
    schedule_id IN (
      SELECT id FROM training_schedules
      WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Iedereen in de groep kan sessies updaten
CREATE POLICY "training_sessions_update_policy" ON training_sessions
  FOR UPDATE
  USING (
    schedule_id IN (
      SELECT id FROM training_schedules
      WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Iedereen in de groep kan sessies verwijderen
CREATE POLICY "training_sessions_delete_policy" ON training_sessions
  FOR DELETE
  USING (
    schedule_id IN (
      SELECT id FROM training_schedules
      WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );


-- TRAINING_ATTENDANCE policies
-- Groepsleden kunnen attendance van hun groep sessies zien
CREATE POLICY "training_attendance_select_policy" ON training_attendance
  FOR SELECT
  USING (
    session_id IN (
      SELECT ts.id FROM training_sessions ts
      JOIN training_schedules tsch ON ts.schedule_id = tsch.id
      WHERE tsch.group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Users kunnen hun eigen attendance maken
CREATE POLICY "training_attendance_insert_policy" ON training_attendance
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users kunnen hun eigen attendance updaten
CREATE POLICY "training_attendance_update_policy" ON training_attendance
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users kunnen hun eigen attendance verwijderen
CREATE POLICY "training_attendance_delete_policy" ON training_attendance
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- INDEXES voor betere performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_training_schedules_group ON training_schedules(group_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_schedule ON training_sessions(schedule_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_training_attendance_session ON training_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_training_attendance_user ON training_attendance(user_id);

-- Verificatie
SELECT 'Training schema tables aangemaakt!' as status;

SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('training_schedules', 'training_sessions', 'training_attendance')
ORDER BY tablename, policyname;
