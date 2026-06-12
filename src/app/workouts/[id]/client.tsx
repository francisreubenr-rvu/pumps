"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft } from "lucide-react"

export default function WorkoutDetailClient() {
  const { id } = useParams<{ id: string }>()
  const [workout, setWorkout] = useState<any>(null)
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    supabase.from("workouts").select("*").eq("id", id).single().then(({ data }) => { setWorkout(data); setLoading(false) })
    supabase.from("workout_exercises").select("*, exercises(name, category)").eq("workout_id", id).order("sort_order")
      .then(async ({ data }) => {
        if (!data) return
        const supabase2 = createClient()
        const withSets = await Promise.all(data.map(async (we: any) => {
          const { data: sets } = await supabase2.from("exercise_sets").select("*").eq("workout_exercise_id", we.id).order("set_number")
          return { ...we, sets: sets || [] }
        }))
        setExercises(withSets)
      })
  }, [id])

  if (loading) return <div style={{ backgroundColor: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#8d8d8d" }}>…</span></div>
  if (!workout) return <div style={{ backgroundColor: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#8d8d8d" }}>Not found</span></div>

  const totalVolume = exercises.reduce((sum, we) => sum + we.sets.reduce((s: number, set: any) => s + (set.reps * (set.weight_kg ?? 0)), 0), 0)

  return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(5,5,5,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 56, display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
          <Link href="/workouts" style={{ color: "#8d8d8d", display: "flex" }}><ArrowLeft size={18} /></Link>
          <Link href="/dashboard" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 16, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "#ffffff", textDecoration: "none" }}>PUMPS</Link>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, color: "#8d8d8d" }}>/</span>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ccff00" }}>{workout.name}</span>
          <span className="badge" style={{ marginLeft: "auto", background: workout.completed_at ? "#ccff00" : "#1a1a1a", color: workout.completed_at ? "#050505" : "#8d8d8d" }}>{workout.completed_at ? "DONE" : "ACTIVE"}</span>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <div className="card-elevated" style={{ padding: 24, marginBottom: 2 }}>
          <p className="label-sm">TOTAL VOLUME</p>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em", color: "#ffffff" }}>{totalVolume.toLocaleString()} <span style={{ fontSize: 14, color: "#8d8d8d" }}>KG</span></span>
        </div>

        {exercises.map(we => (
          <div key={we.id} className="card-elevated" style={{ padding: 24, marginTop: 2 }}>
            <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", color: "#ffffff", textTransform: "uppercase", marginBottom: 16 }}>
              {we.exercises?.name}
              <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", color: "#8d8d8d", marginLeft: 8, textTransform: "uppercase" }}>{we.exercises?.category}</span>
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "#8d8d8d" }}>
                  <th style={{ textAlign: "left", padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>SET</th>
                  <th style={{ textAlign: "left", padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>WEIGHT</th>
                  <th style={{ textAlign: "left", padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>REPS</th>
                  <th style={{ textAlign: "right", padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>VOLUME</th>
                </tr>
              </thead>
              <tbody>
                {we.sets.map((s: any) => (
                  <tr key={s.id} style={{ borderTop: "1px solid #1a1a1a" }}>
                    <td style={{ padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 13, color: "#8d8d8d" }}>{s.set_number}</td>
                    <td style={{ padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{s.weight_kg ?? 0} kg</td>
                    <td style={{ padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{s.reps}</td>
                    <td style={{ padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, color: "#ccff00", textAlign: "right" }}>{(s.reps * (s.weight_kg ?? 0)).toLocaleString()} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </main>
    </div>
  )
}
