-- =====================================================================
-- 00010: Data-trust foundation — updated_at, soft deletes, audit log
-- =====================================================================
-- Stage 1, step 1 (the recoverability spine). This migration is ADDITIVE
-- and NON-BREAKING: it adds columns, triggers, and an audit table without
-- changing any existing read/write behavior.
--
-- Deliberately deferred to a follow-up migration (00011) because it changes
-- RLS and needs careful testing:
--   * hiding soft-deleted rows on SELECT (and a soft-deleted workout's sets,
--     so deleted volume drops out of dashboards/leaderboards),
--   * an UPDATE path that allows restore (deleted_at -> null),
--   * switching the app's hard DELETE to a soft-delete UPDATE.
-- Until 00011 lands, the deleted_at columns simply stay null — harmless.
-- =====================================================================

-- ── Shared trigger: stamp updated_at on every UPDATE ──────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── updated_at columns (additive) ─────────────────────────────────────
alter table workouts      add column if not exists updated_at timestamptz not null default now();
alter table exercise_sets add column if not exists updated_at timestamptz not null default now();
alter table meal_logs     add column if not exists updated_at timestamptz not null default now();
alter table competitions  add column if not exists updated_at timestamptz not null default now();
alter table profiles      add column if not exists updated_at timestamptz not null default now();
-- journals.updated_at already exists (00003); it just lacked a trigger.

-- ── updated_at triggers (idempotent) ──────────────────────────────────
drop trigger if exists set_updated_at on workouts;
create trigger set_updated_at before update on workouts
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on exercise_sets;
create trigger set_updated_at before update on exercise_sets
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on meal_logs;
create trigger set_updated_at before update on meal_logs
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on competitions;
create trigger set_updated_at before update on competitions
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on profiles;
create trigger set_updated_at before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on journals;
create trigger set_updated_at before update on journals
  for each row execute function set_updated_at();

-- ── Soft-delete columns (additive; RLS enforcement lands in 00011) ────
alter table workouts      add column if not exists deleted_at timestamptz;
alter table exercise_sets add column if not exists deleted_at timestamptz;
alter table journals      add column if not exists deleted_at timestamptz;
alter table meal_logs     add column if not exists deleted_at timestamptz;

-- Partial indexes for the common "live rows only" access path.
create index if not exists workouts_live_idx  on workouts(user_id)        where deleted_at is null;
create index if not exists meal_logs_live_idx on meal_logs(user_id, date) where deleted_at is null;
create index if not exists journals_live_idx  on journals(user_id, date)  where deleted_at is null;

-- ── Audit trail ───────────────────────────────────────────────────────
-- One row per meaningful change: edits, deletes/restores, AI commits, admin
-- actions. `metadata` carries a small JSON snapshot (e.g. before/after values
-- or AI request id) for forensics without a full shadow table.
create table if not exists audit_events (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references profiles(id) on delete set null,
  action      text not null,          -- e.g. 'workout.create', 'workout.delete', 'ai.commit'
  entity_type text not null,          -- 'workout' | 'exercise_set' | 'journal' | 'meal_log' | ...
  entity_id   uuid,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists audit_events_entity_idx on audit_events(entity_type, entity_id);
create index if not exists audit_events_actor_idx  on audit_events(actor_id, created_at desc);

alter table audit_events enable row level security;

-- Owners can read their own trail; service-role (server) bypasses RLS for ops.
drop policy if exists "Users can view own audit events" on audit_events;
create policy "Users can view own audit events" on audit_events for select
  using (auth.uid() = actor_id);

-- Clients may log only events attributed to themselves (no forging actors).
drop policy if exists "Actors can insert own audit events" on audit_events;
create policy "Actors can insert own audit events" on audit_events for insert
  with check (auth.uid() = actor_id);
