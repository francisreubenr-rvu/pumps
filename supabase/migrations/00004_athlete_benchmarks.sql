-- =====================================================================
-- 00004: Athlete Benchmarks (static reference data)
-- =====================================================================

create table if not exists athlete_benchmarks (
  id uuid primary key default uuid_generate_v4(),
  athlete_name text not null,
  exercise_name text not null,
  weight_kg numeric(8,2) not null,
  body_weight_kg numeric(6,2),
  category text not null check (category in ('bodybuilder', 'powerlifter', 'weightlifter', 'crossfit')),
  era text
);

alter table athlete_benchmarks enable row level security;
create policy "Benchmarks are publicly readable" on athlete_benchmarks for select using (true);

insert into athlete_benchmarks (athlete_name, exercise_name, weight_kg, body_weight_kg, category, era) values
  ('Ronnie Coleman', 'Squat', 455, 130, 'bodybuilder', '2000-2005'),
  ('Ronnie Coleman', 'Deadlift', 365, 130, 'bodybuilder', '2000-2005'),
  ('Ronnie Coleman', 'Bench Press', 200, 130, 'bodybuilder', '2000-2005'),
  ('Ronnie Coleman', 'Barbell Row', 272, 130, 'bodybuilder', '2000-2005'),
  ('Arnold Schwarzenegger', 'Bench Press', 227, 107, 'bodybuilder', '1970-1975'),
  ('Arnold Schwarzenegger', 'Squat', 215, 107, 'bodybuilder', '1970-1975'),
  ('Arnold Schwarzenegger', 'Deadlift', 317, 107, 'bodybuilder', '1970-1975'),
  ('Dorian Yates', 'Deadlift', 315, 118, 'bodybuilder', '1992-1997'),
  ('Dorian Yates', 'Bench Press', 200, 118, 'bodybuilder', '1992-1997'),
  ('Eddie Hall', 'Deadlift', 500, 196, 'powerlifter', '2016'),
  ('Eddie Hall', 'Squat', 395, 196, 'powerlifter', '2016'),
  ('Larry Wheels', 'Bench Press', 325, 117, 'powerlifter', '2020'),
  ('Larry Wheels', 'Squat', 420, 117, 'powerlifter', '2020'),
  ('Larry Wheels', 'Deadlift', 426, 117, 'powerlifter', '2020'),
  ('Chris Bumstead', 'Squat', 295, 100, 'bodybuilder', '2020-2024'),
  ('Chris Bumstead', 'Bench Press', 180, 100, 'bodybuilder', '2020-2024'),
  ('Chris Bumstead', 'Deadlift', 280, 100, 'bodybuilder', '2020-2024');
