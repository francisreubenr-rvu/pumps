import { NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = await createServiceSupabaseClient()

    // Previous week: Mon 00:00 → Sun 23:59 UTC
    const now = new Date()
    const dayOfWeek = now.getUTCDay() // 0=Sun, 1=Mon...
    const daysToLastMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const lastMonday = new Date(now)
    lastMonday.setUTCDate(now.getUTCDate() - daysToLastMon - 7)
    lastMonday.setUTCHours(0, 0, 0, 0)
    const lastSunday = new Date(lastMonday)
    lastSunday.setUTCDate(lastMonday.getUTCDate() + 6)
    lastSunday.setUTCHours(23, 59, 59, 999)

    const weekStart = lastMonday.toISOString().slice(0, 10)

    // Pull all completed sets from last week with exercise info
    const { data: sets, error } = await supabase
      .from("exercise_sets")
      .select(`
        reps, weight_kg,
        workout_exercises!inner(
          workouts!inner(user_id, started_at),
          exercises!inner(name)
        )
      `)
      .eq("completed", true)
      .gte("created_at", lastMonday.toISOString())
      .lte("created_at", lastSunday.toISOString())

    if (error) throw error

    // Aggregate per user + exercise
    type Key = string
    const agg: Record<Key, { user_id: string; exercise_name: string; max_weight: number; total_volume: number }> = {}

    for (const s of sets ?? []) {
      const we = (s as any).workout_exercises
      const userId: string = we?.workouts?.user_id
      const exerciseName: string = we?.exercises?.name
      if (!userId || !exerciseName) continue

      const key: Key = `${userId}::${exerciseName}`
      const vol = (s.reps ?? 0) * (s.weight_kg ?? 0)
      if (!agg[key]) agg[key] = { user_id: userId, exercise_name: exerciseName, max_weight: 0, total_volume: 0 }
      if ((s.weight_kg ?? 0) > agg[key].max_weight) agg[key].max_weight = s.weight_kg ?? 0
      agg[key].total_volume += vol
    }

    // Rank per exercise
    const byExercise: Record<string, typeof agg[Key][]> = {}
    for (const v of Object.values(agg)) {
      if (!byExercise[v.exercise_name]) byExercise[v.exercise_name] = []
      byExercise[v.exercise_name].push(v)
    }

    const rows: { week_start: string; user_id: string; exercise_name: string; max_weight: number; total_volume: number; rank: number }[] = []
    for (const [exerciseName, entries] of Object.entries(byExercise)) {
      entries.sort((a, b) => b.max_weight - a.max_weight)
      entries.forEach((e, i) => {
        rows.push({
          week_start: weekStart,
          user_id: e.user_id,
          exercise_name: exerciseName,
          max_weight: e.max_weight,
          total_volume: e.total_volume,
          rank: i + 1,
        })
      })
    }

    if (rows.length > 0) {
      const { error: upsertError } = await supabase
        .from("weekly_leaderboard_snapshots")
        .upsert(rows, { onConflict: "week_start,user_id,exercise_name" })
      if (upsertError) throw upsertError
    }

    return NextResponse.json({ ok: true, week_start: weekStart, rows_written: rows.length })
  } catch (err) {
    console.error("[weekly-snapshot]", err)
    return NextResponse.json({ error: "Snapshot failed" }, { status: 500 })
  }
}
