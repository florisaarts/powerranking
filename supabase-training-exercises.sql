-- Voeg exercises tabel toe aan training schema
-- Voer dit uit in de Supabase SQL Editor

-- Training oefeningen binnen een schema
CREATE TABLE IF NOT EXISTS training_exercises (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references training_schedules(id) on delete cascade not null,
  parent_exercise_id uuid references training_exercises(id) on delete cascade,
  name text not null,
  description text,
  sets text not null default '3',
  reps text not null default '10',
  weight_percentage text,
  order_index integer not null default 0,
  exercise_type text not null default 'basis' check (exercise_type in ('basis', 'tussen')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Als een basis oefening wordt verwijderd, worden de tussen oefeningen ook verwijderd
-- Dit wordt al geregeld door de foreign key constraint met ON DELETE CASCADE

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
CREATE INDEX IF NOT EXISTS idx_training_exercises_parent ON training_exercises(parent_exercise_id);

-- Verificatie
SELECT 'Training exercises table aangemaakt!' as status;

SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'training_exercises'
ORDER BY policyname;
