"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Crown, Medal } from "lucide-react"

export default function ExerciseLeaderboardClient() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const [exercise, setExercise] = useState<any>(null)
  const [ranked, setRanked] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    if (!exerciseId) return
    const supabase = createClient()
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError("")
      try {
        const exRes = await supabase.from("exercises").select("*").eq("id", exerciseId).single()
        if (!cancelled) setExercise(exRes.data ?? null)

        const setsRes = await supabase
          .from("exercise_sets")
          .select(`weight_kg, reps, workout_exercises!inner(exercise_id, exercises!inner(name), workouts!inner(user_id))`)
          .eq("completed", true)
          .eq("workout_exercises.exercise_id", exerciseId)
        if (setsRes.error) throw setsRes.error

        const profRes = await supabase.from("profiles").select("id, username")
        const pm = Object.fromEntries((profRes.data ?? []).map((p: any) => [p.id, p]))

        const best: Record<string, any> = {}
        ;(setsRes.data ?? []).forEach((s: any) => {
          const uid = s.workout_exercises?.workouts?.user_id
          const prof = pm[uid]
          if (!prof) return
          const w = Number(s.weight_kg ?? 0)
          if (w > (best[uid]?.weight ?? 0)) best[uid] = { weight: w, username: prof.username }
        })
        if (cancelled) return
        setRanked(Object.values(best).sort((a: any, b: any) => b.weight - a.weight).map((e: any, i: number) => ({ rank: i + 1, ...e })))
      } catch (err: any) {
        if (!cancelled) {
          setRanked([])
          setLoadError(err?.message || "Couldn't load this leaderboard. Please try again.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [exerciseId])

  if (loading) return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-heading-stack)", fontSize: 12 }}>Loading…</span>
    </div>
  )

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "color-mix(in oklch, var(--bg) 95%, transparent)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 56, display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
          <Link href="/leaderboard" style={{ color: "var(--text-secondary)", display: "flex" }} aria-label="Back to leaderboards"><ArrowLeft size={18} aria-hidden="true" /></Link>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>{exercise?.name ?? "Exercise"} leaderboard</span>
        </div>
      </header>
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
        {loadError ? (
          <div className="card-elevated" style={{ padding: 24, textAlign: "center" }}>
            <p style={{ color: "var(--accent-red)", fontFamily: "var(--font-heading-stack)", fontSize: 12, marginBottom: 12 }}>{loadError}</p>
            <button onClick={() => location.reload()} className="btn-outline" style={{ fontSize: 11, padding: "8px 16px" }}>Retry</button>
          </div>
        ) : ranked.length > 0 ? (
          <div className="card-elevated" style={{ padding: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ color: "var(--text-secondary)" }}>
                <th style={{ textAlign: "left", padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>#</th>
                <th style={{ textAlign: "left", padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Athlete</th>
                <th style={{ textAlign: "right", padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Best</th>
              </tr></thead>
              <tbody>{ranked.map(e => (
                <tr key={e.rank} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 0" }}>{e.rank === 1 ? <Crown size={14} style={{ color: "var(--accent)" }} aria-label="1st" /> : e.rank === 2 ? <Medal size={14} style={{ color: "var(--text-secondary)" }} aria-label="2nd" /> : e.rank === 3 ? <Medal size={14} style={{ color: "var(--accent-blue)" }} aria-label="3rd" /> : <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{e.rank}</span>}</td>
                  <td style={{ padding: "10px 0" }}><span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{e.username}</span></td>
                  <td style={{ padding: "10px 0", textAlign: "right" }}><span className="badge">{Math.round(e.weight).toLocaleString()} kg</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="card-elevated" style={{ padding: 24, textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-heading-stack)", fontSize: 12 }}>No rankings yet — log a completed set of this lift to appear here.</p>
          </div>
        )}
      </main>
    </div>
  )
}
