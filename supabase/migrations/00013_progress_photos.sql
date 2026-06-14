-- =====================================================================
-- 00013: Progress photos — media pipeline (private Storage + signed URLs)
-- =====================================================================
-- Body/progress photos stored PRIVATELY in a Storage bucket; the app reads
-- them via short-lived signed URLs. Files live under a per-user folder
-- (`<user_id>/<file>`) and storage RLS pins access to the owner's folder.
-- =====================================================================

create table if not exists progress_photos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  storage_path text not null,                 -- object key in the bucket
  weight_kg    numeric(6,2),                   -- optional bodyweight at capture
  taken_at     timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index if not exists progress_photos_user_idx on progress_photos(user_id, taken_at desc);

alter table progress_photos enable row level security;

-- Photos are private — owner-only CRUD.
drop policy if exists "Users manage own progress photos" on progress_photos;
create policy "Users manage own progress photos" on progress_photos
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Private storage bucket ────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Access is pinned to the user's own folder: the first path segment of the
-- object name must equal their uid. Files are uploaded as `<uid>/<name>`.
drop policy if exists "Users read own progress photos" on storage.objects;
create policy "Users read own progress photos" on storage.objects for select
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users upload own progress photos" on storage.objects;
create policy "Users upload own progress photos" on storage.objects for insert
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete own progress photos" on storage.objects;
create policy "Users delete own progress photos" on storage.objects for delete
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
