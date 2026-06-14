import type { SupabaseClient } from "@supabase/supabase-js"
import { recordAuditEvent } from "@/lib/audit"
import { log } from "@/lib/log"

export type NewWorkoutInput = {
  name: string
  /** ISO start timestamp (the real time the session began). */
  startedAt: string
  exercises: { exerciseId: string; sets: { reps: number; weight: number }[] }[]
}

/**
 * Insert a workout + its exercises and completed sets, and record the audit
 * event. Pure DB write — no cache/React concerns — so it is shared by the
 * online mutation (useCreateWorkout) AND the offline queue replay. Returns the
 * new workout id.
 */
export async function insertWorkout(
  supabase: SupabaseClient,
  userId: string,
  input: NewWorkoutInput
): Promise<string> {
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
    // completed=true so sets count toward leaderboards/profiles (RLS exposes
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
}
