-- =====================================================================
-- 00015: Admin role + audit-trail access (ops/moderation tooling)
-- =====================================================================
-- A secure admin role. Like `subscriptions.tier`, admin status must NOT be
-- self-settable — so it lives in a dedicated `admins` table with NO client
-- write policy; only the service role / a manual SQL insert grants it.
--
-- Membership is checked via a SECURITY DEFINER `is_admin()` function so the
-- policies don't recurse (a policy on `admins` that queried `admins` directly
-- would loop — the classic recursive-RLS trap). The function reads the table
-- as its owner, bypassing RLS, so it's safe to call from within policies.
-- =====================================================================

create table if not exists admins (
  user_id    uuid primary key references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admins where user_id = uid);
$$;

-- Admins can read the admin list; nobody can write it via the client.
drop policy if exists "Admins can view admins" on admins;
create policy "Admins can view admins" on admins for select
  using (is_admin(auth.uid()));

-- Admins can read the FULL audit trail (OR'd with the owner-only policy from
-- 00010, so users still see their own events).
drop policy if exists "Admins can view all audit events" on audit_events;
create policy "Admins can view all audit events" on audit_events for select
  using (is_admin(auth.uid()));

-- To grant the first admin, run (once) in the SQL editor:
--   insert into admins (user_id) values ('<your-auth-user-uuid>');
