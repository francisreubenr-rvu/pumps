-- =====================================================================
-- RLS contract tests — soft-delete enforcement (migration 00011) +
-- the public cross-user visibility policies (00002).
-- =====================================================================
-- Run with:  supabase test db   (requires the local Supabase stack / Docker).
-- NOTE: written + reviewed but NOT executed in the cloud agent environment —
-- run it locally before relying on the results.
--
-- The contract under test:
--   * an owner sees their non-deleted rows, never their soft-deleted ones;
--   * live workouts are publicly visible (profiles/leaderboards);
--   * a soft-deleted workout is hidden from everyone, AND its completed sets
--     drop out of the cross-user (leaderboard) view via the parent check;
--   * journals are owner-only and hide soft-deleted rows.
-- =====================================================================

begin;
select plan(8);

-- ── Fixtures (run as the migration/superuser role — bypasses RLS) ──────
-- Two users; the handle_new_user trigger auto-creates their profiles.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev'),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.dev');

-- Alice: one live workout + one soft-deleted workout, each with a completed set.
insert into workouts (id, user_id, name, completed_at, deleted_at) values
  ('a1a1a1a1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Alice Live',    now(), null),
  ('a1a1a1a1-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Alice Deleted', now(), now());

insert into workout_exercises (id, workout_id, exercise_id, sort_order)
select 'b2b2b2b2-0000-0000-0000-000000000001', 'a1a1a1a1-0000-0000-0000-000000000001', id, 0 from exercises limit 1;
insert into workout_exercises (id, workout_id, exercise_id, sort_order)
select 'b2b2b2b2-0000-0000-0000-000000000002', 'a1a1a1a1-0000-0000-0000-000000000002', id, 0 from exercises limit 1;

insert into exercise_sets (workout_exercise_id, set_number, reps, weight_kg, completed) values
  ('b2b2b2b2-0000-0000-0000-000000000001', 1, 5, 100, true),   -- live workout's set
  ('b2b2b2b2-0000-0000-0000-000000000002', 1, 5, 120, true);   -- deleted workout's set

insert into journals (id, user_id, type, content_json, deleted_at) values
  ('c3c3c3c3-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'daily', '{}', null),
  ('c3c3c3c3-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'daily', '{}', now());

-- Impersonation helper: become a given authenticated user for RLS checks.
create function pg_temp.act_as(uid text) returns void as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
end $$ language plpgsql;

-- ── Alice's own view ───────────────────────────────────────────────────
select pg_temp.act_as('11111111-1111-1111-1111-111111111111');

select is(
  (select count(*) from workouts where user_id = '11111111-1111-1111-1111-111111111111')::int,
  1, 'owner sees only their non-deleted workout (soft-deleted one is hidden)'
);
select is(
  (select count(*) from journals where user_id = '11111111-1111-1111-1111-111111111111')::int,
  1, 'owner sees only their non-deleted journal'
);
select is(
  (select count(*) from exercise_sets)::int,
  1, 'owner sees only the live workout''s set (deleted workout''s set hidden via parent check)'
);

-- ── Bob's view (cross-user / public policies) ──────────────────────────
select pg_temp.act_as('22222222-2222-2222-2222-222222222222');

select is(
  (select count(*) from workouts where id = 'a1a1a1a1-0000-0000-0000-000000000001')::int,
  1, 'another user CAN see a live workout (public "viewable by everyone")'
);
select is(
  (select count(*) from workouts where id = 'a1a1a1a1-0000-0000-0000-000000000002')::int,
  0, 'another user CANNOT see a soft-deleted workout'
);
select is(
  (select count(*) from exercise_sets where weight_kg = 100)::int,
  1, 'completed set of a live workout is visible cross-user (leaderboard)'
);
select is(
  (select count(*) from exercise_sets where weight_kg = 120)::int,
  0, 'completed set of a soft-deleted workout is hidden cross-user (volume leaves the leaderboard)'
);
select is(
  (select count(*) from journals where user_id = '11111111-1111-1111-1111-111111111111')::int,
  0, 'another user cannot see someone else''s journals (owner-only)'
);

-- Reset to a privileged role so finish()/rollback aren't RLS-constrained.
select set_config('role', 'postgres', true);
select * from finish();
rollback;
