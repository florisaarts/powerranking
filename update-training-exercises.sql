-- Update training_exercises tabel voor parent-child relatie en text fields
-- Voer dit uit in de Supabase SQL Editor NADAT je supabase-training-exercises.sql hebt uitgevoerd

-- Als de tabel al bestaat, moeten we hem updaten
-- Anders moet je eerst supabase-training-exercises.sql uitvoeren

-- Voeg parent_exercise_id kolom toe
ALTER TABLE training_exercises 
ADD COLUMN IF NOT EXISTS parent_exercise_id uuid REFERENCES training_exercises(id) ON DELETE CASCADE;

-- Verander sets, reps en weight_percentage naar text
ALTER TABLE training_exercises 
ALTER COLUMN sets TYPE text USING sets::text;

ALTER TABLE training_exercises 
ALTER COLUMN reps TYPE text USING reps::text;

ALTER TABLE training_exercises 
ALTER COLUMN weight_percentage TYPE text USING weight_percentage::text;

-- Voeg index toe voor parent relatie
CREATE INDEX IF NOT EXISTS idx_training_exercises_parent ON training_exercises(parent_exercise_id);

-- Verificatie
SELECT 'Training exercises table ge-update!' as status;

-- Check de nieuwe structuur
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'training_exercises'
ORDER BY ordinal_position;
