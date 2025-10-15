-- Check profiles data en group_members
-- Voer dit uit in de Supabase SQL Editor

-- 1. Check alle profiles
SELECT id, username, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- 2. Check alle group members met hun user_id
SELECT 
  gm.id,
  gm.group_id,
  gm.user_id,
  gm.joined_at,
  p.username
FROM group_members gm
LEFT JOIN profiles p ON p.id = gm.user_id
ORDER BY gm.joined_at DESC;

-- 3. Check of er members zijn zonder profile
SELECT 
  gm.user_id,
  COUNT(*) as count
FROM group_members gm
LEFT JOIN profiles p ON p.id = gm.user_id
WHERE p.id IS NULL
GROUP BY gm.user_id;

-- 4. Check of user_id's in group_members overeenkomen met auth.users
SELECT 
  gm.user_id,
  au.email,
  p.username
FROM group_members gm
LEFT JOIN auth.users au ON au.id = gm.user_id
LEFT JOIN profiles p ON p.id = gm.user_id
ORDER BY gm.joined_at DESC;
