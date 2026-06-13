-- =====================================================================
-- 00003: Journals, Meal Logs, User Modes
-- =====================================================================

-- JOURNALS (daily + weekly entries)
create table if not exists journals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  type text not null default 'daily' check (type in ('daily', 'weekly')),
  content_json jsonb not null default '{}',
  mood int check (mood between 1 and 5),
  energy_level int check (energy_level between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journals_user_date_idx on journals(user_id, date desc);
alter table journals enable row level security;

create policy "Users can manage own journals" on journals
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- JOURNAL INSIGHTS (AI-generated, inserted by server via service role)
create table if not exists journal_insights (
  id uuid primary key default uuid_generate_v4(),
  journal_id uuid not null references journals(id) on delete cascade,
  insight_text text not null,
  insight_type text not null default 'weekly_summary',
  created_at timestamptz not null default now()
);

alter table journal_insights enable row level security;

create policy "Users can view own journal insights" on journal_insights for select
  using (exists (
    select 1 from journals j
    where j.id = journal_insights.journal_id and j.user_id = auth.uid()
  ));

create policy "Service role can insert journal insights" on journal_insights for insert
  with check (true);

-- MEAL LOGS (calorie tracker)
create table if not exists meal_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text not null,
  calories int not null default 0,
  protein_g numeric(6,1) default 0,
  carbs_g numeric(6,1) default 0,
  fat_g numeric(6,1) default 0,
  image_url text,
  ai_identified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists meal_logs_user_date_idx on meal_logs(user_id, date desc);
alter table meal_logs enable row level security;

create policy "Users can manage own meal logs" on meal_logs
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- USER MODES (one row per user, upserted on mode change)
create table if not exists user_modes (
  user_id uuid primary key references profiles(id) on delete cascade,
  mode text not null default 'default' check (mode in ('default', 'monk', 'revenge', 'winter', 'happy')),
  activated_at timestamptz not null default now()
);

alter table user_modes enable row level security;

create policy "Users can manage own mode" on user_modes
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
