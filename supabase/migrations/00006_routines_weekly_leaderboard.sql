-- =====================================================================
-- 00006: Saved Routines + Weekly Leaderboard Snapshots
-- =====================================================================

-- SAVED ROUTINES (AI-generated workout plans)
create table if not exists saved_routines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  goal text not null,
  days_per_week int not null default 4,
  equipment text not null default 'full_gym',
  experience text not null default 'intermediate',
  routine_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table saved_routines enable row level security;

create policy "Users can manage own routines" on saved_routines
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- WEEKLY LEADERBOARD SNAPSHOTS (populated by cron every Monday)
create table if not exists weekly_leaderboard_snapshots (
  id uuid primary key default uuid_generate_v4(),
  week_start date not null,
  user_id uuid not null references profiles(id) on delete cascade,
  exercise_name text not null,
  max_weight numeric(8,2) not null default 0,
  total_volume numeric(12,2) not null default 0,
  rank int,
  created_at timestamptz not null default now(),
  unique(week_start, user_id, exercise_name)
);

create index if not exists weekly_lb_week_rank_idx on weekly_leaderboard_snapshots(week_start desc, rank asc);
alter table weekly_leaderboard_snapshots enable row level security;

create policy "Snapshots are publicly readable" on weekly_leaderboard_snapshots for select using (true);
create policy "Service role can insert snapshots" on weekly_leaderboard_snapshots for insert with check (true);
create policy "Service role can update snapshots" on weekly_leaderboard_snapshots for update using (true);
