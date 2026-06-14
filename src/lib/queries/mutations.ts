"use client"

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { recordAuditEvent } from "@/lib/audit"
import { log } from "@/lib/log"
import { queryKeys } from "./keys"

/** Everything a logged workout touches: dashboard stats, the list, progress. */
function invalidateWorkoutCaches(qc: QueryClient, userId: string): void {
  qc.invalidateQueries({ queryKey: queryKeys.dashboard.all(userId) })
  qc.invalidateQueries({ queryKey: queryKeys.workouts.list(userId) })
  qc.invalidateQueries({ queryKey: queryKeys.progress.all(userId) })
}

export type NewWorkoutInput = {
  name: string
  /** ISO start timestamp. */
  startedAt: string
  exercises: { exerciseId: string; sets: { reps: number; weight: number }[] }[]
}

/**
 * Create a workout (+ its exercises and completed sets) in one mutation.
 * Centralizes the write that used to live inline in workouts/new: audit event,
 * cache invalidation, and structured error logging all happen here. Returns the
 * new workout id for navigation.
 */
export function useCreateWorkout(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewWorkoutInput): Promise<string> => {
      if (!userId) throw new Error("not authenticated")
      const supabase = createClient()

      const { data: w, error: wErr } = await supabase
        .from("workouts")
        .insert({ user_id: userId, name: input.name || "Workout", started_at: input.startedAt, completed_at: new Date().toISOString() })
        .select("id")
        .single()
      if (wErr || !w) throw wErr ?? new Error("workout insert failed")

      for (const [idx, ex] of input.exercises.entries()) {
        const { data: we, error: weErr } = await supabase
          .from("workout_exercises")
          .insert({ workout_id: w.id, exercise_id: ex.exerciseId, sort_order: idx })
          .select("id")
          .single()
        if (weErr || !we) {
          log.error("workout.exercise_insert_failed", { detail: weErr?.message })
          continue
        }
        // Completed=true so sets count toward leaderboards/profiles (RLS exposes
        // only completed sets cross-user).
        const { error: sErr } = await supabase.from("exercise_sets").insert(
          ex.sets.map((s, i) => ({ workout_exercise_id: we.id, set_number: i + 1, reps: s.reps, weight_kg: s.weight, completed: true }))
        )
        if (sErr) log.error("workout.sets_insert_failed", { detail: sErr.message })
      }

      recordAuditEvent(supabase, {
        actorId: userId,
        action: "workout.create",
        entityType: "workout",
        entityId: w.id,
        metadata: { name: input.name, exercises: input.exercises.length },
      })
      return w.id
    },
    onSuccess: () => {
      if (userId) invalidateWorkoutCaches(qc, userId)
    },
  })
}

type DeleteContext = { prev?: unknown[]; key?: readonly unknown[] }

/**
 * Soft-delete a workout, OPTIMISTICALLY removing it from the cached list so the
 * card vanishes instantly. Rolls the cache back if the server rejects, and
 * reconciles all workout caches once settled.
 */
export function useSoftDeleteWorkout(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (workoutId: string): Promise<string> => {
      const supabase = createClient()
      const { error } = await supabase
        .from("workouts")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", workoutId)
      if (error) throw error
      if (userId) {
        recordAuditEvent(supabase, { actorId: userId, action: "workout.delete", entityType: "workout", entityId: workoutId })
      }
      return workoutId
    },
    onMutate: async (workoutId: string): Promise<DeleteContext> => {
      if (!userId) return {}
      const key = queryKeys.workouts.list(userId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<unknown[]>(key)
      qc.setQueryData<any[]>(key, (old) => (old ?? []).filter((w) => w?.id !== workoutId))
      return { prev, key }
    },
    onError: (_err, _id, ctx?: DeleteContext) => {
      if (ctx?.key && ctx.prev !== undefined) qc.setQueryData(ctx.key, ctx.prev)
    },
    onSettled: () => {
      if (userId) invalidateWorkoutCaches(qc, userId)
    },
  })
}
