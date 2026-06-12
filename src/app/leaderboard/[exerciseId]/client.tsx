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

  useEffect(() => {
    if (!exerciseId) return
    const supabase = createClient()
    supabase.from("exercises").select("*").eq("id", exerciseId).single().then(({ data }) => setExercise(data))
    supabase.from("exercise_sets").select(`weight_kg, reps, workout_exercises!inner(exercise_id, exercises!inner(name), workouts!inner(user_id))`).eq("completed", true).eq("workout_exercises.exercise_id", exerciseId).then(({ data }) => {
      supabase.from("profiles").select("id, username").then(({ data: profiles }) => {
        const pm = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]))
        const best: Record<string, any> = {}
        ;(data ?? []).forEach((s: any) => { const uid = s.workout_exercises.workouts.user_id; const prof = pm[uid]; if (!prof) return; const w = Number(s.weight_kg ?? 0); if (w > (best[uid]?.weight ?? 0)) best[uid] = { weight: w, username: prof.username } })
        setRanked(Object.values(best).sort((a: any, b: any) => b.weight - a.weight).map((e: any, i: number) => ({ rank: i + 1, ...e })))
        setLoading(false)
      })
    })
  }, [exerciseId])

  if (loading) return <div style={{ backgroundColor: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#8d8d8d" }}>…</span></div>

  return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(5,5,5,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 56, display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
          <Link href="/leaderboard" style={{ color: "#8d8d8d", display: "flex" }}><ArrowLeft size={18} /></Link>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ccff00" }}>{exercise?.name ?? "Exercise"} Leaderboard</span>
        </div>
      </header>
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
        {ranked.length > 0 ? (
          <div className="card-elevated" style={{ padding: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ color: "#8d8d8d" }}>
                <th style={{ textAlign: "left", padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>#</th>
                <th style={{ textAlign: "left", padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>ATHLETE</th>
                <th style={{ textAlign: "right", padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>BEST</th>
              </tr></thead>
              <tbody>{ranked.map(e => (
                <tr key={e.rank} style={{ borderTop: "1px solid #1a1a1a" }}>
                  <td style={{ padding: "10px 0" }}>{e.rank === 1 ? <Crown size={14} style={{ color: "#ccff00" }} /> : e.rank === 2 ? <Medal size={14} style={{ color: "#8d8d8d" }} /> : e.rank === 3 ? <Medal size={14} style={{ color: "#3a3aff" }} /> : <span style={{ color: "#8d8d8d", fontSize: 12 }}>{e.rank}</span>}</td>
                  <td style={{ padding: "10px 0" }}><span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{e.username}</span></td>
                  <td style={{ padding: "10px 0", textAlign: "right" }}><span className="badge">{Math.round(e.weight).toLocaleString()} kg</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p style={{ color: "#8d8d8d", textAlign: "center", padding: "40px 0", fontFamily: "var(--font-heading-stack)", fontSize: 12 }}>No data yet</p>}
      </main>
    </div>
  )
}
