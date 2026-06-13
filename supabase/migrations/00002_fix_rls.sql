-- Fix RLS policies for leaderboards and public profiles

-- exercise_sets: Leaderboard pages query ALL users' completed sets for public display.
-- The existing policy ("Users can view own sets") only allows viewing your own sets
-- through the workouts chain. This policy allows completed sets to be visible globally,
-- enabling the leaderboard feature. RLS policies are additive (OR'd together).
create policy "Completed sets are viewable by everyone" on exercise_sets for select using (completed = true);

-- workouts: Profile pages need to show other users' workout history and count.
-- The existing policy ("Users can view own workouts") restricts to own workouts only.
-- This policy opens all workouts for public read, which is required for profile pages
-- to display workout stats and history of any user.
create policy "Workouts are viewable by everyone" on workouts for select using (true);
