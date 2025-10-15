-- Fix RLS policy voor group_members zodat users alle members van hun groepen kunnen zien
-- Voer dit uit in de Supabase SQL Editor

-- Verwijder de oude SELECT policy
DROP POLICY IF EXISTS "Users can view group members" ON group_members;

-- Nieuwe SELECT policy: gebruikers kunnen members zien van groepen waar ze zelf lid van zijn
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  USING (
    group_id IN (
      SELECT group_id 
      FROM group_members 
      WHERE user_id = auth.uid()
    )
  );
