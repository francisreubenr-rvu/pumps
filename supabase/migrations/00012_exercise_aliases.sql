-- =====================================================================
-- 00012: Exercise aliases — canonical name normalization
-- =====================================================================
-- The AI workout parser (and free-text entry) produces exercise names like
-- "bench", "barbell bench", "Bench Press". The old commit flow matched on an
-- exact name and CREATED a new exercise on any miss, polluting the canonical
-- library with duplicates. This table maps normalized (lower-cased) free-text
-- names -> a canonical exercises.id, so variants resolve to one stable entity.
-- The app resolver (src/lib/exercises.ts) also LEARNS new aliases at runtime.
-- =====================================================================

create table if not exists exercise_aliases (
  id          uuid primary key default gen_random_uuid(),
  alias       text not null unique,        -- normalized (lower-cased) name
  exercise_id uuid not null references exercises(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists exercise_aliases_exercise_idx on exercise_aliases(exercise_id);

alter table exercise_aliases enable row level security;

-- Same access model as exercises: world-readable, authenticated can add.
drop policy if exists "Aliases are viewable by everyone" on exercise_aliases;
create policy "Aliases are viewable by everyone" on exercise_aliases for select using (true);

drop policy if exists "Authenticated users can create aliases" on exercise_aliases;
create policy "Authenticated users can create aliases" on exercise_aliases for insert
  with check (auth.role() = 'authenticated');

-- ── Seed high-confidence aliases for the built-in exercises ───────────
-- Joined to exercises by canonical name so it works regardless of uuid.
insert into exercise_aliases (alias, exercise_id)
select a.alias, e.id
from (values
  ('bench', 'Bench Press'),
  ('bench press', 'Bench Press'),
  ('barbell bench press', 'Bench Press'),
  ('bb bench', 'Bench Press'),
  ('flat bench', 'Bench Press'),
  ('incline bench', 'Incline Bench Press'),
  ('incline press', 'Incline Bench Press'),
  ('incline bench press', 'Incline Bench Press'),
  ('dumbbell fly', 'Dumbbell Fly'),
  ('db fly', 'Dumbbell Fly'),
  ('chest fly', 'Dumbbell Fly'),
  ('flyes', 'Dumbbell Fly'),
  ('squat', 'Squat'),
  ('squats', 'Squat'),
  ('back squat', 'Squat'),
  ('barbell squat', 'Squat'),
  ('deadlift', 'Deadlift'),
  ('deadlifts', 'Deadlift'),
  ('dl', 'Deadlift'),
  ('deads', 'Deadlift'),
  ('conventional deadlift', 'Deadlift'),
  ('rdl', 'Romanian Deadlift'),
  ('romanian deadlift', 'Romanian Deadlift'),
  ('romanian deadlifts', 'Romanian Deadlift'),
  ('pull up', 'Pull-Up'),
  ('pullup', 'Pull-Up'),
  ('pullups', 'Pull-Up'),
  ('pull ups', 'Pull-Up'),
  ('barbell row', 'Barbell Row'),
  ('bb row', 'Barbell Row'),
  ('bent over row', 'Barbell Row'),
  ('bent-over row', 'Barbell Row'),
  ('overhead press', 'Overhead Press'),
  ('ohp', 'Overhead Press'),
  ('military press', 'Overhead Press'),
  ('shoulder press', 'Overhead Press'),
  ('lateral raise', 'Lateral Raise'),
  ('lat raise', 'Lateral Raise'),
  ('side raise', 'Lateral Raise'),
  ('lateral raises', 'Lateral Raise'),
  ('bicep curl', 'Bicep Curl'),
  ('biceps curl', 'Bicep Curl'),
  ('curl', 'Bicep Curl'),
  ('curls', 'Bicep Curl'),
  ('dumbbell curl', 'Bicep Curl'),
  ('tricep pushdown', 'Tricep Pushdown'),
  ('pushdown', 'Tricep Pushdown'),
  ('tricep pressdown', 'Tricep Pushdown'),
  ('triceps pushdown', 'Tricep Pushdown'),
  ('leg press', 'Leg Press'),
  ('cable crossover', 'Cable Crossover'),
  ('cable fly', 'Cable Crossover'),
  ('crossover', 'Cable Crossover'),
  ('face pull', 'Face Pull'),
  ('face pulls', 'Face Pull'),
  ('hammer curl', 'Hammer Curl'),
  ('hammer curls', 'Hammer Curl'),
  ('skull crusher', 'Skull Crusher'),
  ('skullcrusher', 'Skull Crusher'),
  ('lying tricep extension', 'Skull Crusher'),
  ('lat pulldown', 'Lat Pulldown'),
  ('pulldown', 'Lat Pulldown'),
  ('lat pull down', 'Lat Pulldown'),
  ('leg extension', 'Leg Extension'),
  ('leg extensions', 'Leg Extension'),
  ('quad extension', 'Leg Extension'),
  ('leg curl', 'Leg Curl'),
  ('leg curls', 'Leg Curl'),
  ('hamstring curl', 'Leg Curl'),
  ('calf raise', 'Calf Raise'),
  ('calf raises', 'Calf Raise'),
  ('plank', 'Plank'),
  ('planks', 'Plank'),
  ('russian twist', 'Russian Twist'),
  ('russian twists', 'Russian Twist'),
  ('hanging leg raise', 'Hanging Leg Raise'),
  ('hanging leg raises', 'Hanging Leg Raise'),
  ('leg raise', 'Hanging Leg Raise'),
  ('leg raises', 'Hanging Leg Raise')
) as a(alias, canonical)
join exercises e on e.name = a.canonical
on conflict (alias) do nothing;
