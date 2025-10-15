-- Voeg exercises tabel toe aan training schema
-- Voer dit uit in de Supabase SQL Editor

-- Training oefeningen binnen een schema
CREATE TABLE IF NOT EXISTS training_exercises (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references training_schedules(id) on delete cascade not null,
  name text not null,
  description text,
  sets integer not null default 1,
  reps integer not null default 1,
  weight_percentage integer check (weight_percentage >= 0 and weight_percentage <= 100),
  order_index integer not null default 0,
  exercise_type text not null default 'basis' check (exercise_type in ('basis', 'tussen')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- RLS POLICIES voor training_exercises
-- ============================================

ALTER TABLE training_exercises ENABLE ROW LEVEL SECURITY;

-- Groepsleden kunnen oefeningen van hun groep schemas zien
CREATE POLICY "training_exercises_select_policy" ON training_exercises
  FOR SELECT
  USING (
    schedule_id IN (
      SELECT id FROM training_schedules
      WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Groepsleden kunnen oefeningen maken
CREATE POLICY "training_exercises_insert_policy" ON training_exercises
  FOR INSERT
  WITH CHECK (
    schedule_id IN (
      SELECT id FROM training_schedules
      WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Groepsleden kunnen oefeningen updaten
CREATE POLICY "training_exercises_update_policy" ON training_exercises
  FOR UPDATE
  USING (
    schedule_id IN (
      SELECT id FROM training_schedules
      WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Groepsleden kunnen oefeningen verwijderen
CREATE POLICY "training_exercises_delete_policy" ON training_exercises
  FOR DELETE
  USING (
    schedule_id IN (
      SELECT id FROM training_schedules
      WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Index voor betere performance
CREATE INDEX IF NOT EXISTS idx_training_exercises_schedule ON training_exercises(schedule_id);
CREATE INDEX IF NOT EXISTS idx_training_exercises_order ON training_exercises(schedule_id, order_index);

-- Verificatie
SELECT 'Training exercises table aangemaakt!' as status;

SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'training_exercises'
ORDER BY policyname;
