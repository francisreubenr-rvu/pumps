-- =====================================================================
-- 00008: Modern physique-influencer benchmarks (replaces legacy set)
-- =====================================================================
-- Swaps the old legends/strongmen list for 18 modern aesthetics-focused
-- influencers whose goal is physique. Lift figures are APPROXIMATE,
-- compiled from public training footage / interviews — not official meet
-- records. The `era` column is reused as a short descriptor/handle.
-- exercise_name values intentionally match the canonical exercises table
-- so the "you vs athlete" comparison query resolves correctly.
-- =====================================================================

begin;

delete from athlete_benchmarks;

insert into athlete_benchmarks (athlete_name, exercise_name, weight_kg, body_weight_kg, category, era) values
  -- Chris Bumstead — 5× Classic Physique Mr. Olympia
  ('Chris Bumstead', 'Squat', 295, 105, 'bodybuilder', '5× Classic Physique Olympia'),
  ('Chris Bumstead', 'Deadlift', 280, 105, 'bodybuilder', '5× Classic Physique Olympia'),
  ('Chris Bumstead', 'Bench Press', 180, 105, 'bodybuilder', '5× Classic Physique Olympia'),
  ('Chris Bumstead', 'Barbell Row', 140, 105, 'bodybuilder', '5× Classic Physique Olympia'),

  -- Noel Deyzel — mass monster, "Big Boi"
  ('Noel Deyzel', 'Bench Press', 160, 105, 'bodybuilder', 'Aesthetics / @noeldeyzel'),
  ('Noel Deyzel', 'Squat', 220, 105, 'bodybuilder', 'Aesthetics / @noeldeyzel'),
  ('Noel Deyzel', 'Deadlift', 250, 105, 'bodybuilder', 'Aesthetics / @noeldeyzel'),
  ('Noel Deyzel', 'Overhead Press', 100, 105, 'bodybuilder', 'Aesthetics / @noeldeyzel'),

  -- David Laid — GymShark, famed 600lb deadlift
  ('David Laid', 'Deadlift', 272, 88, 'bodybuilder', 'Aesthetics / 600lb deadlift'),
  ('David Laid', 'Squat', 205, 88, 'bodybuilder', 'Aesthetics / 600lb deadlift'),
  ('David Laid', 'Bench Press', 145, 88, 'bodybuilder', 'Aesthetics / 600lb deadlift'),
  ('David Laid', 'Barbell Row', 120, 88, 'bodybuilder', 'Aesthetics / 600lb deadlift'),

  -- Sam Sulek — viral high-volume training
  ('Sam Sulek', 'Bench Press', 140, 98, 'bodybuilder', 'High-volume / @sam_sulek'),
  ('Sam Sulek', 'Squat', 180, 98, 'bodybuilder', 'High-volume / @sam_sulek'),
  ('Sam Sulek', 'Incline Bench Press', 120, 98, 'bodybuilder', 'High-volume / @sam_sulek'),
  ('Sam Sulek', 'Deadlift', 220, 98, 'bodybuilder', 'High-volume / @sam_sulek'),

  -- Jeff Nippard — science-based, competed in powerlifting
  ('Jeff Nippard', 'Squat', 227, 74, 'bodybuilder', 'Science-based lifter'),
  ('Jeff Nippard', 'Bench Press', 145, 74, 'bodybuilder', 'Science-based lifter'),
  ('Jeff Nippard', 'Deadlift', 250, 74, 'bodybuilder', 'Science-based lifter'),

  -- Tristyn Lee — freakish strength-to-weight
  ('Tristyn Lee', 'Bench Press', 140, 75, 'bodybuilder', 'Strength-to-weight freak'),
  ('Tristyn Lee', 'Squat', 180, 75, 'bodybuilder', 'Strength-to-weight freak'),
  ('Tristyn Lee', 'Deadlift', 220, 75, 'bodybuilder', 'Strength-to-weight freak'),

  -- Nick Walker — "The Mutant", IFBB Pro
  ('Nick Walker', 'Squat', 270, 120, 'bodybuilder', 'IFBB Pro / The Mutant'),
  ('Nick Walker', 'Deadlift', 300, 120, 'bodybuilder', 'IFBB Pro / The Mutant'),
  ('Nick Walker', 'Bench Press', 180, 120, 'bodybuilder', 'IFBB Pro / The Mutant'),
  ('Nick Walker', 'Barbell Row', 150, 120, 'bodybuilder', 'IFBB Pro / The Mutant'),

  -- Ryan Terry — IFBB Men's Physique Olympia
  ('Ryan Terry', 'Bench Press', 150, 95, 'bodybuilder', 'Men''s Physique Olympia'),
  ('Ryan Terry', 'Squat', 200, 95, 'bodybuilder', 'Men''s Physique Olympia'),
  ('Ryan Terry', 'Deadlift', 240, 95, 'bodybuilder', 'Men''s Physique Olympia'),

  -- Larry Wheels — strength influencer / aesthetics crossover
  ('Larry Wheels', 'Bench Press', 300, 115, 'powerlifter', 'Strength influencer'),
  ('Larry Wheels', 'Squat', 400, 115, 'powerlifter', 'Strength influencer'),
  ('Larry Wheels', 'Deadlift', 430, 115, 'powerlifter', 'Strength influencer'),
  ('Larry Wheels', 'Barbell Row', 180, 115, 'powerlifter', 'Strength influencer'),

  -- Simeon Panda — classic aesthetics
  ('Simeon Panda', 'Bench Press', 160, 95, 'bodybuilder', 'Classic aesthetics'),
  ('Simeon Panda', 'Squat', 200, 95, 'bodybuilder', 'Classic aesthetics'),
  ('Simeon Panda', 'Deadlift', 240, 95, 'bodybuilder', 'Classic aesthetics'),
  ('Simeon Panda', 'Barbell Row', 130, 95, 'bodybuilder', 'Classic aesthetics'),

  -- Ulisses Jr — golden-era aesthetics
  ('Ulisses Jr', 'Bench Press', 150, 92, 'bodybuilder', 'Golden-era aesthetics'),
  ('Ulisses Jr', 'Squat', 190, 92, 'bodybuilder', 'Golden-era aesthetics'),
  ('Ulisses Jr', 'Deadlift', 230, 92, 'bodybuilder', 'Golden-era aesthetics'),

  -- Lazar Angelov — ripped aesthetics icon
  ('Lazar Angelov', 'Bench Press', 150, 88, 'bodybuilder', 'Aesthetics icon'),
  ('Lazar Angelov', 'Squat', 200, 88, 'bodybuilder', 'Aesthetics icon'),
  ('Lazar Angelov', 'Deadlift', 240, 88, 'bodybuilder', 'Aesthetics icon'),

  -- Jeff Seid — youngest IFBB Physique Pro
  ('Jeff Seid', 'Bench Press', 140, 88, 'bodybuilder', 'Physique Pro'),
  ('Jeff Seid', 'Squat', 180, 88, 'bodybuilder', 'Physique Pro'),
  ('Jeff Seid', 'Deadlift', 220, 88, 'bodybuilder', 'Physique Pro'),

  -- Mike Thurston — aesthetics / business
  ('Mike Thurston', 'Bench Press', 140, 88, 'bodybuilder', 'Aesthetics / @mikethurston'),
  ('Mike Thurston', 'Squat', 180, 88, 'bodybuilder', 'Aesthetics / @mikethurston'),
  ('Mike Thurston', 'Deadlift', 220, 88, 'bodybuilder', 'Aesthetics / @mikethurston'),
  ('Mike Thurston', 'Overhead Press', 80, 88, 'bodybuilder', 'Aesthetics / @mikethurston'),

  -- Bradley Martyn — strength + size
  ('Bradley Martyn', 'Bench Press', 180, 105, 'bodybuilder', 'Strength + size'),
  ('Bradley Martyn', 'Squat', 250, 105, 'bodybuilder', 'Strength + size'),
  ('Bradley Martyn', 'Deadlift', 280, 105, 'bodybuilder', 'Strength + size'),
  ('Bradley Martyn', 'Overhead Press', 100, 105, 'bodybuilder', 'Strength + size'),

  -- Jesse James West — "raise the bar"
  ('Jesse James West', 'Bench Press', 150, 90, 'bodybuilder', 'Raise the bar'),
  ('Jesse James West', 'Squat', 200, 90, 'bodybuilder', 'Raise the bar'),
  ('Jesse James West', 'Deadlift', 230, 90, 'bodybuilder', 'Raise the bar'),
  ('Jesse James West', 'Incline Bench Press', 120, 90, 'bodybuilder', 'Raise the bar'),

  -- Andrei Deiu — modern classic physique
  ('Andrei Deiu', 'Bench Press', 140, 85, 'bodybuilder', 'Classic Physique Pro'),
  ('Andrei Deiu', 'Squat', 180, 85, 'bodybuilder', 'Classic Physique Pro'),
  ('Andrei Deiu', 'Deadlift', 220, 85, 'bodybuilder', 'Classic Physique Pro'),

  -- Wesley Vissers — classic physique, "the architect"
  ('Wesley Vissers', 'Bench Press', 150, 95, 'bodybuilder', 'The Architect'),
  ('Wesley Vissers', 'Squat', 210, 95, 'bodybuilder', 'The Architect'),
  ('Wesley Vissers', 'Deadlift', 250, 95, 'bodybuilder', 'The Architect'),

  -- Steve Cook — physique / fitness media
  ('Steve Cook', 'Bench Press', 150, 95, 'bodybuilder', 'Physique / fitness media'),
  ('Steve Cook', 'Squat', 200, 95, 'bodybuilder', 'Physique / fitness media'),
  ('Steve Cook', 'Deadlift', 240, 95, 'bodybuilder', 'Physique / fitness media');

commit;
