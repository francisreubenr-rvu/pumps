"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Plus, Clock } from "lucide-react"

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      supabase.from("workouts").select("*").eq("user_id", data.user.id).order("started_at", { ascending: false })
        .then(({ data }) => { setWorkouts(data ?? []); setMounted(true) })
        .catch(() => { setWorkouts([]); setMounted(true) })
    })
  }, [])

  return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(5,5,5,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          <Link href="/dashboard" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 16, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "#ffffff", textDecoration: "none" }}>PUMPS</Link>
          <Link href="/workouts/new" className="btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>
            <Plus size={14} /> LOG
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "#ffffff", lineHeight: 1.05, marginBottom: 4 }}>
          WORKOUTS
        </h1>
        <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ccff00", marginBottom: 40 }}>
          YOUR LOG
        </p>

        {workouts.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 2 }} className="stagger">
            {workouts.map(w => (
              <Link key={w.id} href={`/workouts/${w.id}`} className="card-surface" style={{ padding: 24, textDecoration: "none", display: "block", transition: "opacity 0.1s" }}>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", color: "#ffffff", textTransform: "uppercase" }}>{w.name}</p>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, letterSpacing: "0.03em", color: "#8d8d8d", marginTop: 4 }}>
                  <Clock size={11} style={{ display: "inline", marginRight: 4 }} />
                  {new Date(w.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
                <span className="badge" style={{ display: "inline-block", marginTop: 12, background: w.completed_at ? "#ccff00" : "#1a1a1a", color: w.completed_at ? "#050505" : "#8d8d8d" }}>
                  {w.completed_at ? "DONE" : "ACTIVE"}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-surface" style={{ padding: 60, textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, color: "#8d8d8d" }}>No workouts logged yet</p>
            <Link href="/workouts/new" className="btn-primary" style={{ display: "inline-flex", marginTop: 16 }}>LOG YOUR FIRST</Link>
          </div>
        )}
      </main>
    </div>
  )
}
