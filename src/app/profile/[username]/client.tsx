"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CalendarDays, Dumbbell, TrendingUp } from "lucide-react"

export default function ProfileClient() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<any>(null)
  const [workoutCount, setWorkoutCount] = useState(0)
  const [volume, setVolume] = useState(0)
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    if (!username) return
    const supabase = createClient()
    supabase.from("profiles").select("*").eq("username", username).single().then(({ data }) => {
      if (!data) return; setProfile(data)
      supabase.from("workouts").select("*", { count: "exact", head: true }).eq("user_id", data.id).then(({ count }) => setWorkoutCount(count ?? 0)).catch(() => {})
      supabase.from("exercise_sets").select("reps, weight_kg, workout_exercises!inner(workout_id, workouts!inner(user_id))").eq("workout_exercises.workouts.user_id", data.id).eq("completed", true).then(({ data: sets }) => setVolume((sets ?? []).reduce((s: number, r: any) => s + r.reps * (r.weight_kg ?? 0), 0))).catch(() => {})
      supabase.from("workouts").select("*").eq("user_id", data.id).order("started_at", { ascending: false }).limit(5).then(({ data }) => setRecent(data ?? [])).catch(() => {})
    }).catch(() => {})
  }, [username])

  if (!profile) return <div style={{ backgroundColor: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#8d8d8d" }}>Profile not found</span></div>

  return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(5,5,5,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 16, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "#ffffff" }}>PUMPS</span>
        </div>
      </header>
      <main style={{ maxWidth: 1024, margin: "0 auto", padding: "40px 24px" }}>
        <div className="card-elevated" style={{ padding: 32, marginBottom: 2, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "#ccff00", color: "#050505", fontFamily: "var(--font-heading-stack)", fontSize: 20, fontWeight: 700 }}>{profile.username?.slice(0, 2).toUpperCase()}</div>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "#ffffff" }}>{profile.username}</h1>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", color: "#8d8d8d", marginTop: 2 }}>Joined {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, marginBottom: 2 }}>
          <div className="card-elevated" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><Dumbbell size={14} style={{ color: "#ccff00" }} /><span className="label-sm" style={{ margin: 0 }}>WORKOUTS</span></div>
            <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 28, fontWeight: 700, color: "#ffffff" }}>{workoutCount}</span>
          </div>
          <div className="card-elevated" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><TrendingUp size={14} style={{ color: "#ccff00" }} /><span className="label-sm" style={{ margin: 0 }}>VOLUME</span></div>
            <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 28, fontWeight: 700, color: "#ffffff" }}>{volume.toLocaleString()} kg</span>
          </div>
          <div className="card-elevated" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><CalendarDays size={14} style={{ color: "#ccff00" }} /><span className="label-sm" style={{ margin: 0 }}>SINCE</span></div>
            <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 700, color: "#ffffff" }}>{new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
          </div>
        </div>

        <div className="card-elevated" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ffffff", marginBottom: 16 }}>RECENT WORKOUTS</h3>
          {recent.length > 0 ? recent.map(w => (
            <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
              <div>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{w.name}</p>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, color: "#8d8d8d", marginTop: 2 }}>{new Date(w.started_at).toLocaleDateString()}</p>
              </div>
              <span className="badge" style={{ background: w.completed_at ? "#ccff00" : "#1a1a1a", color: w.completed_at ? "#050505" : "#8d8d8d" }}>{w.completed_at ? "DONE" : "ACTIVE"}</span>
            </div>
          )) : <p style={{ color: "#8d8d8d", textAlign: "center", padding: "20px 0", fontFamily: "var(--font-heading-stack)", fontSize: 12 }}>No workouts yet</p>}
        </div>
      </main>
    </div>
  )
}
