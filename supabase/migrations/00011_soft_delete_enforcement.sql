-- =====================================================================
-- 00011: Soft-delete enforcement (RLS)
-- =====================================================================
-- Stage 1, step 2. Builds on 00010's deleted_at columns. Rewrites the
-- SELECT policies on user-history tables so soft-deleted rows disappear
-- from reads — including a soft-deleted workout's child exercise_sets, so
-- deleted volume leaves dashboards AND leaderboards atomically (only the
-- parent workout's deleted_at is set; the parent check below does the rest).
--
-- SELECT policies are OR'd, so EVERY select policy on a table must carry the
-- deleted_at guard or deleted rows leak through the most permissive one.
-- UPDATE policies deliberately do NOT filter deleted_at, so a row can be
-- restored (deleted_at -> null) later.
-- =====================================================================

-- ── workouts: owner + public select both exclude soft-deleted ─────────
drop policy if exists "Users can view own workouts" on workouts;
create policy "Users can view own workouts" on workouts for select
  using (auth.uid() = user_id and deleted_at is null);

drop policy if exists "Workouts are viewable by everyone" on workouts;
create policy "Workouts are viewable by everyone" on workouts for select
  using (deleted_at is null);

-- ── workout_exercises: hide rows whose parent workout is soft-deleted ──
drop policy if exists "Users can view own workout exercises" on workout_exercises;
create policy "Users can view own workout exercises" on workout_exercises for select using (
  exists (
    select 1 from workouts
    where workouts.id = workout_exercises.workout_id
      and workouts.user_id = auth.uid()
      and workouts.deleted_at is null
  )
);

-- ── exercise_sets: both select policies exclude the set's own deletion
--    AND any set whose parent workout is soft-deleted ───────────────────
drop policy if exists "Users can view own sets" on exercise_sets;
create policy "Users can view own sets" on exercise_sets for select using (
  exercise_sets.deleted_at is null
  and exists (
    select 1 from workout_exercises we
    join workouts w on w.id = we.workout_id
    where we.id = exercise_sets.workout_exercise_id
      and w.user_id = auth.uid()
      and w.deleted_at is null
  )
);

drop policy if exists "Completed sets are viewable by everyone" on exercise_sets;
create policy "Completed sets are viewable by everyone" on exercise_sets for select using (
  completed = true
  and exercise_sets.deleted_at is null
  and exists (
    select 1 from workout_exercises we
    join workouts w on w.id = we.workout_id
    where we.id = exercise_sets.workout_exercise_id
      and w.deleted_at is null
  )
);

-- ── journals: split the combined FOR ALL policy so SELECT hides deleted
--    rows while UPDATE still permits restore (deleted_at -> null) ────────
drop policy if exists "Users can manage own journals" on journals;
create policy "Users can view own journals" on journals for select
  using (auth.uid() = user_id and deleted_at is null);
create policy "Users can insert own journals" on journals for insert
  with check (auth.uid() = user_id);
create policy "Users can update own journals" on journals for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own journals" on journals for delete
  using (auth.uid() = user_id);

-- ── meal_logs: same split ─────────────────────────────────────────────
drop policy if exists "Users can manage own meal logs" on meal_logs;
create policy "Users can view own meal logs" on meal_logs for select
  using (auth.uid() = user_id and deleted_at is null);
create policy "Users can insert own meal logs" on meal_logs for insert
  with check (auth.uid() = user_id);
create policy "Users can update own meal logs" on meal_logs for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own meal logs" on meal_logs for delete
  using (auth.uid() = user_id);
