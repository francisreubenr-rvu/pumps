import type { SupabaseClient } from "@supabase/supabase-js"

/** Trigger a client-side file download from a string payload. */
function download(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Escape a value for a CSV cell. */
function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Export the full training log as CSV — one row per set, flattened across
 * workout → exercise → set. RLS scopes to the signed-in user and hides
 * soft-deleted rows, so the export reflects exactly their live data.
 */
export async function exportWorkoutsCsv(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("workouts")
    .select(
      "name, started_at, workout_exercises(sort_order, exercises(name), exercise_sets(set_number, reps, weight_kg, completed))"
    )
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
  if (error) throw error

  const headers = ["date", "workout", "exercise", "set", "reps", "weight_kg", "volume", "completed"]
  const lines = [headers.join(",")]
  for (const w of (data ?? []) as any[]) {
    const wes = [...(w.workout_exercises ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    for (const we of wes) {
      const sets = [...(we.exercise_sets ?? [])].sort((a, b) => a.set_number - b.set_number)
      for (const s of sets) {
        lines.push(
          [
            w.started_at,
            w.name,
            we.exercises?.name ?? "",
            s.set_number,
            s.reps,
            s.weight_kg,
            s.reps * (s.weight_kg ?? 0),
            s.completed,
          ].map(csvCell).join(",")
        )
      }
    }
  }
  download(`pumps-workouts-${today()}.csv`, lines.join("\n"), "text/csv;charset=utf-8")
}

/**
 * Full data export as JSON — workouts (with exercises + sets), journals, and
 * meal logs. True portability ("it's my data").
 */
export async function exportAllJson(supabase: SupabaseClient, userId: string): Promise<void> {
  const [workouts, journals, meals] = await Promise.all([
    supabase
      .from("workouts")
      .select("*, workout_exercises(*, exercises(name), exercise_sets(*))")
      .eq("user_id", userId)
      .order("started_at", { ascending: false }),
    supabase.from("journals").select("*").eq("user_id", userId).order("date", { ascending: false }),
    supabase.from("meal_logs").select("*").eq("user_id", userId).order("date", { ascending: false }),
  ])
  const firstError = workouts.error || journals.error || meals.error
  if (firstError) throw firstError

  const payload = {
    exportedAt: new Date().toISOString(),
    workouts: workouts.data ?? [],
    journals: journals.data ?? [],
    meals: meals.data ?? [],
  }
  download(`pumps-export-${today()}.json`, JSON.stringify(payload, null, 2), "application/json")
}
