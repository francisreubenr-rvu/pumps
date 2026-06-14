"use client"

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { recordAuditEvent } from "@/lib/audit"
import { insertWorkout, type NewWorkoutInput } from "@/lib/workout-writes"
import { enqueueWorkoutCreate } from "@/lib/offline-queue"
import { queryKeys } from "./keys"

export type { NewWorkoutInput }

/** Everything a logged workout touches: dashboard stats, the list, progress. */
function invalidateWorkoutCaches(qc: QueryClient, userId: string): void {
  qc.invalidateQueries({ queryKey: queryKeys.dashboard.all(userId) })
  qc.invalidateQueries({ queryKey: queryKeys.workouts.list(userId) })
  qc.invalidateQueries({ queryKey: queryKeys.progress.all(userId) })
}

function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine
}

export type CreateWorkoutResult = { id: string | null; queued: boolean }

/**
 * Create a workout (+ exercises and completed sets), audit, and invalidate.
 *
 * Offline-aware: if the device is offline — or the request fails while offline
 * — the workout is appended to the persistent sync queue and replayed when the
 * connection returns (see offline-queue). `queued: true` tells the caller the
 * save is safe but deferred (no server id yet, so navigate to the list).
 */
export function useCreateWorkout(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewWorkoutInput): Promise<CreateWorkoutResult> => {
      if (!userId) throw new Error("not authenticated")

      if (isOffline()) {
        enqueueWorkoutCreate(userId, input)
        return { id: null, queued: true }
      }
      try {
        const id = await insertWorkout(createClient(), userId, input)
        return { id, queued: false }
      } catch (err) {
        // Lost connection mid-save — queue it rather than lose the workout.
        if (isOffline()) {
          enqueueWorkoutCreate(userId, input)
          return { id: null, queued: true }
        }
        throw err
      }
    },
    onSuccess: (res) => {
      if (userId && !res.queued) invalidateWorkoutCaches(qc, userId)
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
