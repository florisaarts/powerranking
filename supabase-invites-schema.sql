-- SQL voor uitnodigingen en groepscodes
-- Voer dit uit in de Supabase SQL Editor

-- Voeg invite_code toe aan groups tabel
ALTER TABLE groups ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;

-- Genereer automatisch een unieke code voor bestaande groepen
UPDATE groups SET invite_code = UPPER(SUBSTR(MD5(RANDOM()::text), 1, 6)) WHERE invite_code IS NULL;

-- Maak invite_code verplicht voor nieuwe groepen
ALTER TABLE groups ALTER COLUMN invite_code SET NOT NULL;

-- Functie om automatisch een invite code te genereren
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := UPPER(SUBSTR(MD5(RANDOM()::text), 1, 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger om invite code te genereren bij het aanmaken van een groep
DROP TRIGGER IF EXISTS generate_invite_code_trigger ON groups;
CREATE TRIGGER generate_invite_code_trigger
  BEFORE INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION generate_invite_code();

-- Group invites tabel (voor persoonlijke uitnodigingen)
CREATE TABLE IF NOT EXISTS group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade not null,
  invited_by uuid references auth.users(id) on delete cascade not null,
  invited_user_email text not null,
  invited_user_id uuid references auth.users(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS voor group_invites
ALTER TABLE group_invites ENABLE ROW LEVEL SECURITY;

-- Gebruikers kunnen hun eigen uitnodigingen zien
CREATE POLICY "Users can view their own invites"
  ON group_invites FOR SELECT
  USING (invited_user_id = auth.uid() OR invited_by = auth.uid());

-- Groep members kunnen uitnodigingen versturen
CREATE POLICY "Group members can create invites"
  ON group_invites FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Gebruikers kunnen hun eigen uitnodigingen updaten (accepteren/afwijzen)
CREATE POLICY "Users can update their own invites"
  ON group_invites FOR UPDATE
  USING (invited_user_id = auth.uid());

-- Index voor snellere queries
CREATE INDEX IF NOT EXISTS idx_group_invites_user ON group_invites(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_group_invites_status ON group_invites(status);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);
