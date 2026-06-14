"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  dailyMaxWeight,
  dailyBest1RM,
  muscleFrequency,
  distinctExercises,
  weeklyVolume,
  type ExerciseSetInput,
  type CategorizedSetInput,
} from "@/lib/metrics"
import { queryKeys } from "./keys"

export type ProgressData = {
  exercises: string[]
  /** Heaviest lift per (day, exercise), oldest→newest. */
  maxWeight: { day: string; weight_kg: number; exercise: string }[]
  /** Best estimated 1RM per (day, exercise), oldest→newest. */
  e1rm: { day: string; e1rm: number; exercise: string }[]
  /** Weekly volume rollup, oldest→newest. */
  volume: { week: string; volume: number }[]
  /** Sets per muscle group / category, busiest first. */
  muscleSplit: { category: string; sets: number }[]
}

/**
 * A user's progress analytics. All aggregation flows through the canonical
 * `metrics` module so the weekly-volume numbers here are identical to the
 * dashboard's — no more per-page drift.
 *
 * Note: we intentionally do NOT filter on `completed`. Sets default to
 * completed=false (the in-workout checkmark is rarely toggled), so the old
 * `.eq("completed", true)` filter zeroed out real logs and left this page
 * empty. Counting all logged sets matches the dashboard's canonical decision.
 */
export function useProgressData(userId: string | undefined) {
  return useQuery<ProgressData>({
    queryKey: userId ? queryKeys.progress.all(userId) : ["progress", "anon"],
    enabled: !!userId,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("exercise_sets")
        .select(
          `reps, weight_kg, created_at, workout_exercises!inner(exercises!inner(name, category), workouts!inner(started_at))`
        )
        .eq("workout_exercises.workouts.user_id", userId!)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Progress query failed:", error)
        throw error
      }

      // One normalized row carrying everything the metrics need (exercise +
      // category); each function reads only the fields it uses.
      const sets: (ExerciseSetInput & CategorizedSetInput)[] = (data ?? []).map((r: any) => ({
        reps: r.reps,
        weight_kg: r.weight_kg,
        date: r.workout_exercises?.workouts?.started_at ?? r.created_at,
        exercise: r.workout_exercises?.exercises?.name ?? "Unknown",
        category: r.workout_exercises?.exercises?.category ?? "other",
      }))

      return {
        exercises: distinctExercises(sets),
        maxWeight: dailyMaxWeight(sets),
        e1rm: dailyBest1RM(sets),
        volume: weeklyVolume(sets, 12),
        muscleSplit: muscleFrequency(sets),
      }
    },
  })
}
