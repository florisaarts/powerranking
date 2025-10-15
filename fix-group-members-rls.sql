-- Fix RLS policy voor group_members zodat users alle members van hun groepen kunnen zien
-- Voer dit uit in de Supabase SQL Editor
-- BELANGRIJK: Dit bestand is vervangen door fix-invite-code-rls.sql
-- Gebruik dat bestand in plaats hiervan!

-- Verwijder de oude SELECT policy
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;

-- Simpele policy: iedereen kan alle group members zien (voorkomt infinite recursion)
CREATE POLICY "Users can view all group members"
  ON group_members FOR SELECT
  USING (true);
