-- =====================================================================
-- 00005: Squads and Squad Members
-- =====================================================================

-- STEP 1: Create both tables first (no cross-references yet)

create table if not exists squads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_by uuid not null references profiles(id) on delete cascade,
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists squad_members (
  id uuid primary key default uuid_generate_v4(),
  squad_id uuid not null references squads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  unique(squad_id, user_id)
);

-- STEP 2: Enable RLS on both tables

alter table squads enable row level security;
alter table squad_members enable row level security;

-- STEP 3: Policies for squads (squad_members now exists so subqueries work)

create policy "Public squads are visible" on squads for select
  using (is_public = true);

create policy "Squad members can see their squad" on squads for select
  using (exists (
    select 1 from squad_members sm
    where sm.squad_id = squads.id and sm.user_id = auth.uid()
  ));

create policy "Authenticated users can create squads" on squads for insert
  with check (auth.uid() = created_by);

create policy "Squad owner can update" on squads for update
  using (auth.uid() = created_by);

-- STEP 4: Policies for squad_members

create policy "Members can see squad roster" on squad_members for select
  using (exists (
    select 1 from squad_members sm2
    where sm2.squad_id = squad_members.squad_id and sm2.user_id = auth.uid()
  ));

create policy "Users can join squads" on squad_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave squads" on squad_members for delete
  using (auth.uid() = user_id);

-- STEP 5: Auto-add creator as owner when squad is created

create or replace function handle_new_squad()
returns trigger as $$
begin
  insert into squad_members(squad_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_squad_created on squads;
create trigger on_squad_created
  after insert on squads
  for each row execute function handle_new_squad();
