-- =====================================================================
-- 00014: Entitlements & quota — subscription tier + AI usage metering
-- =====================================================================
-- Foundation for Stage 3 billing. The TIER is the entitlement source; AI usage
-- is metered against a per-tier daily limit so the (paid) model API can't be
-- run unbounded.
--
-- SECURITY: users may only READ their subscription, never write it — otherwise
-- anyone could set their own tier to 'pro' for free. Only the service role
-- (the billing webhook) writes `subscriptions`. No user UPDATE/INSERT policy is
-- created, so RLS denies those for normal users while service-role bypasses RLS.
-- =====================================================================

create table if not exists subscriptions (
  user_id            uuid primary key references profiles(id) on delete cascade,
  tier               text not null default 'free' check (tier in ('free', 'pro')),
  status             text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  provider           text,                       -- e.g. 'stripe'
  provider_ref       text,                       -- external subscription id
  current_period_end timestamptz,
  updated_at         timestamptz not null default now()
);

alter table subscriptions enable row level security;

-- Read-only for the owner. Writes happen via the service role (billing webhook).
drop policy if exists "Users can view own subscription" on subscriptions;
create policy "Users can view own subscription" on subscriptions for select
  using (auth.uid() = user_id);

drop trigger if exists set_updated_at on subscriptions;
create trigger set_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- ── AI usage metering ─────────────────────────────────────────────────
-- One row per AI invocation; the per-day count is checked against the tier
-- limit before each call. Users may read + insert their own events but NOT
-- delete them (can't reset their own quota).
create table if not exists quota_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  kind       text not null,                       -- e.g. 'ai.workout_parse'
  created_at timestamptz not null default now()
);

create index if not exists quota_events_user_time_idx on quota_events(user_id, created_at desc);

alter table quota_events enable row level security;

drop policy if exists "Users can view own quota events" on quota_events;
create policy "Users can view own quota events" on quota_events for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own quota events" on quota_events;
create policy "Users can insert own quota events" on quota_events for insert
  with check (auth.uid() = user_id);
