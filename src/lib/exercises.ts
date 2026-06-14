import type { SupabaseClient } from "@supabase/supabase-js"

/** Title-case a free-text name for a clean canonical record ("bench press" → "Bench Press"). */
function titleCase(name: string): string {
  return name.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

/**
 * Resolve a free-text exercise name to a canonical `exercises.id`.
 *
 * Order:
 *   1. `exercise_aliases` exact match on the normalized (lower-cased) name.
 *   2. case-insensitive match on `exercises.name`.
 *   3. create a new canonical exercise.
 *
 * In cases 2 and 3 we LEARN the alias, so the next time the same variant
 * appears it resolves directly. This is what stops "bench" / "Bench Press" /
 * "barbell bench" from each spawning a duplicate canonical exercise — the old
 * flow did an exact `eq("name", …)` and inserted a new row on any miss.
 *
 * Returns the canonical id, or null if both resolution and creation failed.
 */
export async function resolveExerciseId(
  supabase: SupabaseClient,
  rawName: string
): Promise<string | null> {
  const name = rawName.trim()
  if (!name) return null
  const key = name.toLowerCase()

  // 1. Known alias.
  const { data: alias } = await supabase
    .from("exercise_aliases")
    .select("exercise_id")
    .eq("alias", key)
    .maybeSingle()
  if (alias?.exercise_id) return alias.exercise_id

  // 2. Existing canonical exercise (case-insensitive; names have no wildcards).
  const { data: ex } = await supabase
    .from("exercises")
    .select("id")
    .ilike("name", name)
    .maybeSingle()
  if (ex?.id) {
    await learnAlias(supabase, key, ex.id)
    return ex.id
  }

  // 3. New canonical exercise + learned alias.
  const { data: created, error } = await supabase
    .from("exercises")
    .insert({ name: titleCase(name), category: "other" })
    .select("id")
    .single()
  if (error || !created) {
    console.error("[exercises] failed to create canonical exercise:", error?.message)
    return null
  }
  await learnAlias(supabase, key, created.id)
  return created.id
}

/** Best-effort alias write; a unique violation (23505) just means it's already learned. */
async function learnAlias(supabase: SupabaseClient, alias: string, exerciseId: string): Promise<void> {
  const { error } = await supabase.from("exercise_aliases").insert({ alias, exercise_id: exerciseId })
  if (error && error.code !== "23505") {
    console.error("[exercises] failed to learn alias:", alias, error.message)
  }
}
