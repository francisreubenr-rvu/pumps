-- =====================================================================
-- 00017: Settings profile columns + public avatars bucket
-- Adds phone/address to profiles for the new settings editing page.
-- Creates a PUBLIC avatars Storage bucket for profile picture uploads.
-- All additive + idempotent.
-- =====================================================================

-- ── New profile columns ──────────────────────────────────────────────
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists address text;

-- ── Public avatars bucket ────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Everyone can view avatars (public bucket).
drop policy if exists "Anyone can view avatars" on storage.objects;
create policy "Anyone can view avatars" on storage.objects for select
  using (bucket_id = 'avatars');

-- Only authenticated users can upload.
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Only the uploader can update their own avatar objects.
-- (The first path segment is the user id.)
drop policy if exists "Users can update own avatars" on storage.objects;
create policy "Users can update own avatars" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Only the owner can delete their own avatar objects.
drop policy if exists "Users can delete own avatars" on storage.objects;
create policy "Users can delete own avatars" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
