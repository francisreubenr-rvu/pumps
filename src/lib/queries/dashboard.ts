"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  totalVolume,
  weeklyVolume,
  currentStreak,
  acuteChronicRatio,
  readinessFromRatio,
  type DatedSetInput,
  type Readiness,
} from "@/lib/metrics"
import { queryKeys } from "./keys"

export type DashboardData = {
  workoutCount: number
  volume: number
  streak: number
  readiness: Readiness & { ratio: number | null }
  recentWorkouts: any[]
  activeComps: any[]
  volumeHistory: { week: string; volume: number }[]
}

/**
 * All dashboard data for a user, in one cached query. Aggregation (volume,
 * weekly history) is delegated to the canonical `metrics` module — the page
 * never recomputes numbers, so it can never drift from Progress/Workouts.
 *
 * Gated on `userId` via `enabled`, so it only runs once the user is known.
 */
export function useDashboardData(userId: string | undefined) {
  return useQuery<DashboardData>({
    queryKey: userId ? queryKeys.dashboard.all(userId) : ["dashboard", "anon"],
    enabled: !!userId,
    queryFn: async () => {
      const supabase = createClient()

      // Volume counts every logged set. Sets default to completed=false (the
      // in-workout checkmark is rarely toggled), so filtering on completed would
      // zero out real logs — we count all sets to match what users save.
      const [wc, vol, rw, ac, vh, wd] = await Promise.all([
        supabase.from("workouts").select("*", { count: "exact", head: true }).eq("user_id", userId!),
        supabase
          .from("exercise_sets")
          .select("reps, weight_kg, workout_exercises!inner(workout_id, workouts!inner(user_id))")
          .eq("workout_exercises.workouts.user_id", userId!),
        supabase.from("workouts").select("*").eq("user_id", userId!).order("started_at", { ascending: false }).limit(6),
        supabase.from("competitions").select("*, exercises(name)").eq("status", "active").limit(4),
        supabase
          .from("exercise_sets")
          .select("reps, weight_kg, created_at, workout_exercises!inner(workouts!inner(started_at))")
          .eq("workout_exercises.workouts.user_id", userId!)
          .order("created_at", { ascending: true }),
        supabase.from("workouts").select("started_at").eq("user_id", userId!),
      ])

      // Surface query errors loudly rather than silently rendering zeros.
      for (const [name, res] of [
        ["workout count", wc],
        ["volume", vol],
        ["recent workouts", rw],
        ["active comps", ac],
        ["volume history", vh],
        ["workout dates", wd],
      ] as const) {
        if (res?.error) {
          console.error(`Dashboard ${name} query failed:`, res.error)
          throw res.error
        }
      }

      const volumeSets = (vol.data ?? []) as { reps: number; weight_kg: number | null }[]

      const historySets: DatedSetInput[] = (vh.data ?? []).map((r: any) => ({
        reps: r.reps,
        weight_kg: r.weight_kg,
        date: r.workout_exercises?.workouts?.started_at ?? r.created_at,
      }))

      const acwr = acuteChronicRatio(historySets)

      return {
        workoutCount: wc.count ?? 0,
        volume: totalVolume(volumeSets),
        streak: currentStreak((wd.data ?? []).map((r: any) => r.started_at)),
        readiness: { ...readinessFromRatio(acwr.ratio), ratio: acwr.ratio },
        recentWorkouts: rw.data ?? [],
        activeComps: ac.data ?? [],
        volumeHistory: weeklyVolume(historySets, 8),
      }
    },
  })
}
