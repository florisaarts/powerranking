-- Diagnose query om te checken wat er mis is
-- Voer dit uit in de Supabase SQL Editor

-- 1. Check alle RLS policies op groups
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'groups';

-- 2. Check alle RLS policies op group_members  
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'group_members';

-- 3. Check welke groepen er zijn
SELECT id, name, created_by, invite_code 
FROM groups 
ORDER BY created_at DESC;

-- 4. Check welke members er zijn
SELECT gm.id, gm.group_id, gm.user_id, p.username
FROM group_members gm
LEFT JOIN profiles p ON p.id = gm.user_id
ORDER BY gm.joined_at DESC;

-- 5. Check of auth.uid() werkt (voer uit als ingelogde user in app)
SELECT auth.uid() as current_user_id;
