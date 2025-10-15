-- Voeg foreign key toe tussen group_members.user_id en profiles.id
-- Voer dit uit in de Supabase SQL Editor

-- Check eerst of de foreign key al bestaat
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'group_members' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- Verwijder oude foreign key naar auth.users als die bestaat
ALTER TABLE group_members 
  DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

-- Voeg nieuwe foreign key toe naar profiles
ALTER TABLE group_members
  ADD CONSTRAINT group_members_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Verificatie
SELECT 'Foreign key toegevoegd!' as status;
