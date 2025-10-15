-- SIMPELE RLS FIX - Geen recursie, alles leesbaar voor ingelogde users
-- Voer dit uit in de Supabase SQL Editor

-- ============================================
-- VERWIJDER OUDE POLICIES
-- ============================================
DROP POLICY IF EXISTS "groups_select_policy" ON groups;
DROP POLICY IF EXISTS "groups_insert_policy" ON groups;
DROP POLICY IF EXISTS "groups_update_policy" ON groups;
DROP POLICY IF EXISTS "groups_delete_policy" ON groups;

DROP POLICY IF EXISTS "group_members_select_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_insert_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_policy" ON group_members;

-- ============================================
-- MAAK SIMPELE NIEUWE POLICIES
-- ============================================

-- GROUPS: Alle ingelogde gebruikers kunnen alle groepen zien
CREATE POLICY "groups_select_policy" ON groups
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- GROUPS: Ingelogde gebruikers kunnen groepen maken
CREATE POLICY "groups_insert_policy" ON groups
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- GROUPS: Creators kunnen updaten
CREATE POLICY "groups_update_policy" ON groups
  FOR UPDATE
  USING (created_by = auth.uid());

-- GROUPS: Creators kunnen verwijderen
CREATE POLICY "groups_delete_policy" ON groups
  FOR DELETE
  USING (created_by = auth.uid());

-- GROUP_MEMBERS: Iedereen kan zien
CREATE POLICY "group_members_select_policy" ON group_members
  FOR SELECT
  USING (true);

-- GROUP_MEMBERS: Users kunnen zichzelf toevoegen
CREATE POLICY "group_members_insert_policy" ON group_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- GROUP_MEMBERS: Users kunnen zichzelf verwijderen
CREATE POLICY "group_members_delete_policy" ON group_members
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- VERIFICATIE
-- ============================================
SELECT 'Policies aangemaakt!' as status;

SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('groups', 'group_members')
ORDER BY tablename, policyname;
