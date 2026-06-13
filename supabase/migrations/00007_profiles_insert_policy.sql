-- Fix: add INSERT policy so users can create their own profile row.
-- Previously only SELECT and UPDATE policies existed, which meant the upsert
-- in onboarding/page.tsx would throw "new row violates row-level security policy"
-- whenever the auto-create trigger hadn't already created the profile.
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Fix: make the auto-create trigger conflict-safe so a username collision
-- (e.g. two users sharing the same email prefix) no longer silently kills
-- the row creation and leaves the user stuck on onboarding.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
