-- COMPLETE RESET van alle RLS policies
-- Voer dit uit in de Supabase SQL Editor

-- ============================================
-- STAP 1: Verwijder ALLE bestaande policies
-- ============================================

-- Verwijder alle groups policies
DROP POLICY IF EXISTS "Users can view their groups" ON groups;
DROP POLICY IF EXISTS "Users can view their groups and search by invite code" ON groups;
DROP POLICY IF EXISTS "Group creators can create groups" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;

-- Verwijder alle group_members policies
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Users can view all group members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON group_members;

-- ============================================
-- STAP 2: Maak nieuwe, werkende policies
-- ============================================

-- GROUPS POLICIES
-- ----------------

-- SELECT: Gebruikers kunnen hun eigen groepen zien + zoeken via invite code
CREATE POLICY "groups_select_policy" ON groups
  FOR SELECT
  USING (
    created_by = auth.uid() 
    OR id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    OR invite_code IS NOT NULL
  );

-- INSERT: Ingelogde gebruikers kunnen groepen maken
CREATE POLICY "groups_insert_policy" ON groups
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Alleen creators kunnen hun groepen updaten
CREATE POLICY "groups_update_policy" ON groups
  FOR UPDATE
  USING (created_by = auth.uid());

-- DELETE: Alleen creators kunnen hun groepen verwijderen
CREATE POLICY "groups_delete_policy" ON groups
  FOR DELETE
  USING (created_by = auth.uid());


-- GROUP_MEMBERS POLICIES
-- ----------------------

-- SELECT: Iedereen kan members zien (voorkomt recursie!)
CREATE POLICY "group_members_select_policy" ON group_members
  FOR SELECT
  USING (true);

-- INSERT: Users kunnen zichzelf toevoegen OF group creators kunnen toevoegen
CREATE POLICY "group_members_insert_policy" ON group_members
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

-- DELETE: Users kunnen zichzelf verwijderen OF group creators kunnen verwijderen
CREATE POLICY "group_members_delete_policy" ON group_members
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

-- ============================================
-- STAP 3: Verificatie
-- ============================================

-- Check of policies zijn aangemaakt
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('groups', 'group_members')
ORDER BY tablename, policyname;
