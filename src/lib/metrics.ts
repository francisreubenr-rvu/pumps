/**
 * Canonical training metrics — the ONE place derived numbers are computed.
 *
 * The dashboard, progress, and workouts screens must all read their volume,
 * 1RM, streak, etc. from these functions. Previously each page rolled its own
 * inline aggregation, which is why the dashboard could read 0 while the detail
 * page showed a logged workout. If a metric needs to change, it changes here
 * and every screen moves together.
 *
 * All functions are pure and operate on normalized inputs so they are trivially
 * unit-testable (Stage 1) and free of Supabase/query coupling.
 */

/** A single logged set, normalized away from the DB row shape. */
export type SetInput = {
  reps: number
  weight_kg: number | null
}

/** A set with the date of its parent workout — for time-bucketed rollups. */
export type DatedSetInput = SetInput & {
  /** ISO string or Date of the parent workout's start. */
  date: string | Date
}

/** A dated set tagged with its exercise name — for per-exercise progressions. */
export type ExerciseSetInput = DatedSetInput & {
  exercise: string
}

/** Volume (kg) for a single set = reps × weight. Null/absent weight counts as 0. */
export function volumeOf(reps: number, weightKg: number | null): number {
  return reps * (weightKg ?? 0)
}

/** Total volume (kg) across a list of sets. The dashboard "Total Volume" stat. */
export function totalVolume(sets: SetInput[]): number {
  return sets.reduce((sum, s) => sum + volumeOf(s.reps, s.weight_kg), 0)
}

/**
 * Estimated one-rep max via the Epley formula: w × (1 + reps/30).
 * Reps ≤ 0 yields 0; a single rep returns the weight itself.
 */
export function epley1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0
  if (reps === 1) return weightKg
  return weightKg * (1 + reps / 30)
}

/** Best estimated 1RM (kg) across a list of sets. */
export function best1RM(sets: SetInput[]): number {
  return sets.reduce((max, s) => Math.max(max, epley1RM(s.weight_kg ?? 0, s.reps)), 0)
}

/** ISO day key (YYYY-MM-DD), local midnight. */
function dayKey(date: string | Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

/** Start-of-week (Sunday) ISO date key (YYYY-MM-DD) for a given date. */
function weekKey(date: string | Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().slice(0, 10)
}

/**
 * Heaviest weight (kg) lifted per (day, exercise), oldest→newest. Powers the
 * per-exercise max-weight progression chart. One point per day per exercise,
 * keeping the top set of that day.
 */
export function dailyMaxWeight(
  sets: ExerciseSetInput[]
): { day: string; weight_kg: number; exercise: string }[] {
  const best: Record<string, { day: string; weight_kg: number; exercise: string }> = {}
  for (const s of sets) {
    const day = dayKey(s.date)
    const w = s.weight_kg ?? 0
    const k = `${day}|${s.exercise}`
    if (!best[k] || w > best[k].weight_kg) best[k] = { day, weight_kg: w, exercise: s.exercise }
  }
  return Object.values(best).sort((a, b) => (a.day < b.day ? -1 : 1))
}

/** Distinct exercise names present in a set list, in first-seen order. */
export function distinctExercises(sets: ExerciseSetInput[]): string[] {
  return [...new Set(sets.map((s) => s.exercise))]
}

/**
 * Weekly volume rollup, oldest→newest, limited to the last `weeks` buckets.
 * Returns `{ week: "YYYY-MM-DD", volume }` rows — the dashboard volume chart.
 */
export function weeklyVolume(
  sets: DatedSetInput[],
  weeks = 8
): { week: string; volume: number }[] {
  const buckets: Record<string, number> = {}
  for (const s of sets) {
    const k = weekKey(s.date)
    buckets[k] = (buckets[k] ?? 0) + volumeOf(s.reps, s.weight_kg)
  }
  return Object.entries(buckets)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([week, volume]) => ({ week, volume }))
    .slice(-weeks)
}

/**
 * Current daily streak: count of consecutive days (ending today or yesterday)
 * on which at least one workout was logged. A gap of more than one day from the
 * latest workout means the streak is 0 (it has lapsed).
 */
export function currentStreak(workoutDates: (string | Date)[]): number {
  if (workoutDates.length === 0) return 0

  const days = new Set(
    workoutDates.map((d) => {
      const x = new Date(d)
      x.setHours(0, 0, 0, 0)
      return x.getTime()
    })
  )

  const DAY = 86_400_000
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // The streak may end today or, if today is a rest day so far, yesterday.
  let cursor = today.getTime()
  if (!days.has(cursor)) {
    cursor -= DAY
    if (!days.has(cursor)) return 0
  }

  let streak = 0
  while (days.has(cursor)) {
    streak += 1
    cursor -= DAY
  }
  return streak
}
