"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { volumeOf } from "@/lib/metrics"
import { queryKeys } from "./keys"

export type LeaderboardData = {
  exercises: any[]
  maxWeight: any[]
  totalVolume: any[]
}

/**
 * All-time leaderboards: per-user best lift (max weight) and total volume,
 * plus the exercise catalog for category tabs.
 *
 * Filters on `completed=true` deliberately — this is a CROSS-user board, and
 * RLS exposes only completed sets across users. (Per-user pages like the
 * dashboard count all sets; that asymmetry is correct.) The per-set volume uses
 * the canonical `volumeOf` so it agrees with every other screen.
 */
export function useLeaderboard() {
  return useQuery<LeaderboardData>({
    queryKey: queryKeys.leaderboard.allTime(),
    queryFn: async () => {
      const supabase = createClient()

      const exRes = await supabase.from("exercises").select("*").order("category")

      const setsRes = await supabase
        .from("exercise_sets")
        .select(`weight_kg, reps, workout_exercises!inner(exercise_id, exercises!inner(name), workouts!inner(user_id))`)
        .eq("completed", true)
      if (setsRes.error) {
        console.error("Leaderboard sets query failed:", setsRes.error)
        throw setsRes.error
      }

      const profRes = await supabase.from("profiles").select("id, username")
      const pm = Object.fromEntries((profRes.data ?? []).map((p: any) => [p.id, p]))

      const ub: Record<string, any> = {}
      const uv: Record<string, any> = {}
      for (const s of setsRes.data ?? []) {
        const uid = (s as any).workout_exercises?.workouts?.user_id
        const prof = pm[uid]
        if (!prof) continue
        const w = Number((s as any).weight_kg ?? 0)
        if (w > (ub[uid]?.weight ?? 0)) {
          ub[uid] = { weight: w, username: prof.username, exercise: (s as any).workout_exercises.exercises.name }
        }
        uv[uid] = { volume: (uv[uid]?.volume ?? 0) + volumeOf((s as any).reps, (s as any).weight_kg), username: prof.username }
      }

      return {
        exercises: exRes.data ?? [],
        maxWeight: Object.values(ub)
          .sort((a: any, b: any) => b.weight - a.weight)
          .map((e: any, i: number) => ({ rank: i + 1, ...e })),
        totalVolume: Object.values(uv)
          .sort((a: any, b: any) => b.volume - a.volume)
          .map((e: any, i: number) => ({ rank: i + 1, ...e })),
      }
    },
  })
}

/** ISO date (YYYY-MM-DD) of the current week's Monday. */
export function currentWeekStart(now = new Date()): string {
  const day = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

/**
 * This-week leaderboard from the precomputed `weekly_leaderboard_snapshots`.
 * `enabled` lets the page defer the fetch until the "This week" tab is opened.
 */
export function useWeeklyLeaderboard(weekStart: string, enabled: boolean) {
  return useQuery<any[]>({
    queryKey: queryKeys.leaderboard.weekly(weekStart),
    enabled,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("weekly_leaderboard_snapshots")
        .select("*, profiles!user_id(username)")
        .eq("week_start", weekStart)
        .order("rank", { ascending: true })
        .limit(50)
      if (error) {
        console.error("Weekly leaderboard query failed:", error)
        return []
      }
      return (data ?? []).map((r: any) => ({ ...r, username: r.profiles?.username ?? "unknown" }))
    },
  })
}
