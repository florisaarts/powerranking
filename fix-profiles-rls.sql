-- Fix RLS policy voor profiles zodat users andere profiles kunnen zien
-- Voer dit uit in de Supabase SQL Editor

-- Check huidige policies op profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Verwijder oude policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Nieuwe policies: Iedereen kan alle profiles ZIEN (voor usernames)
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT
  USING (true);

-- Alleen eigen profile inserteren
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Alleen eigen profile updaten
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Verificatie
SELECT 'Profiles policies aangemaakt!' as status;

SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
