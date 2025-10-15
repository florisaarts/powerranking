-- SQL voor het aanmaken van de groups tabel in Supabase
-- Voer dit uit in de Supabase SQL Editor

-- Groups tabel
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Group members tabel (koppeltabel tussen users en groups)
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  joined_at timestamp with time zone default now(),
  unique(group_id, user_id)
);

-- RLS policies voor groups
alter table groups enable row level security;

create policy "Users can view groups they are a member of"
  on groups for select
  using (
    id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );

create policy "Users can create groups"
  on groups for insert
  with check (auth.uid() = created_by);

create policy "Group creators can update their groups"
  on groups for update
  using (auth.uid() = created_by);

create policy "Group creators can delete their groups"
  on groups for delete
  using (auth.uid() = created_by);

-- RLS policies voor group_members
alter table group_members enable row level security;

create policy "Users can view group members of their groups"
  on group_members for select
  using (
    group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );

create policy "Group creators can add members"
  on group_members for insert
  with check (
    group_id in (
      select id from groups where created_by = auth.uid()
    )
  );

create policy "Users can leave groups"
  on group_members for delete
  using (user_id = auth.uid());
