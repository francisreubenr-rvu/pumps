-- =====================================================================
-- 00016: Fix infinite recursion in squad RLS
-- =====================================================================
-- Bug: the `squad_members` SELECT policy queried `squad_members` inside its own
-- USING clause, so evaluating it re-triggered the same policy → Postgres error
-- "infinite recursion detected in policy for relation squad_members". The
-- `squads` "members can see their squad" policy hit it transitively.
--
-- Fix (the pattern the original architecture review prescribed): a SECURITY
-- DEFINER `is_squad_member()` that reads the table as its owner, bypassing RLS —
-- so the membership check inside a policy on `squad_members` no longer recurses.
-- =====================================================================

create or replace function is_squad_member(sid uuid, uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from squad_members where squad_id = sid and user_id = uid);
$$;

-- Roster is visible to members — via the function, so no self-recursion.
drop policy if exists "Members can see squad roster" on squad_members;
create policy "Members can see squad roster" on squad_members for select
  using (is_squad_member(squad_id, auth.uid()));

-- Members can see their squad — same function (replaces the subquery that
-- transitively triggered the recursive squad_members policy).
drop policy if exists "Squad members can see their squad" on squads;
create policy "Squad members can see their squad" on squads for select
  using (is_squad_member(id, auth.uid()));
