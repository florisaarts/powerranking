-- Fix RLS policy zodat gebruikers groepen kunnen vinden via invite code
-- Voer dit uit in de Supabase SQL Editor

-- EERST: Verwijder en hermaak group_members policy (simpel, geen recursie)
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;

CREATE POLICY "Users can view all group members"
  ON group_members FOR SELECT
  USING (true);  -- Simpel: iedereen kan members zien (geen recursie)

-- DAN: Fix groups policy
DROP POLICY IF EXISTS "Users can view their groups" ON groups;
DROP POLICY IF EXISTS "Users can view their groups and search by invite code" ON groups;

-- Nieuwe SELECT policy: gebruikers kunnen hun eigen groepen zien EN groepen vinden via invite_code
CREATE POLICY "Users can view their groups and search by invite code"
  ON groups FOR SELECT
  USING (
    created_by = auth.uid() 
    OR id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    OR invite_code IS NOT NULL  -- Sta toe om te zoeken op invite_code
  );
