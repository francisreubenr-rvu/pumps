-- =====================================================================
-- 00009: Onboarding profile stats
-- Adds the structured stat columns captured during first-entry onboarding
-- (keyboard or voice -> DeepSeek parse -> review -> save).
-- The base `profiles` table (00001) only had id / username / avatar_url /
-- created_at, so every column below is genuinely missing and added here.
-- All additive + idempotent. Existing rows keep NULLs.
--
-- NOTE: must be applied in Supabase SQL editor (this file is NOT run
-- automatically by the app).
-- =====================================================================

alter table profiles add column if not exists display_name text;
alter table profiles add column if not exists age int;
alter table profiles add column if not exists sex text;
alter table profiles add column if not exists height_cm numeric(5,1);
alter table profiles add column if not exists weight_kg numeric(5,1);
alter table profiles add column if not exists body_fat_pct numeric(4,1);
alter table profiles add column if not exists experience_level text;
alter table profiles add column if not exists primary_goal text;
alter table profiles add column if not exists bench_press_kg numeric(6,1);
alter table profiles add column if not exists squat_kg numeric(6,1);
alter table profiles add column if not exists deadlift_kg numeric(6,1);
alter table profiles add column if not exists overhead_press_kg numeric(6,1);
alter table profiles add column if not exists onboarded_at timestamptz;
