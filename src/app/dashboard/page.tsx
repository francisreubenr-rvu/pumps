"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Dumbbell, TrendingUp, Swords, Plus, Activity, Zap, Heart, ChevronRight, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

function ScrambleCounter({ value, label, unit, icon: Icon, delay }: {
  value: number; label: string; unit?: string; icon: React.ElementType; delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      const target = value
      let current = 0
      const steps = 20
      const interval = 30
      let step = 0
      const t = setInterval(() => {
        step++
        current = Math.floor((target * step) / steps)
        setDisplay(String(current))
        if (step >= steps) { setDisplay(String(target)); clearInterval(t) }
      }, interval)
      return () => clearInterval(t)
    }, delay)
    return () => clearTimeout(timer)
  }, [visible, value, delay])

  return (
    <div ref={ref} className="card-surface" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon size={14} style={{ color: "#ccff00" }} />
        <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8d8d8d" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 36, fontWeight: 700, letterSpacing: "-0.04em", color: "#ffffff", lineHeight: 1 }}>{display}</span>
        {unit && <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 500, color: "#8d8d8d", textTransform: "uppercase" }}>{unit}</span>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const [workoutCount, setWorkoutCount] = useState(0)
  const [volume, setVolume] = useState(0)
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [activeComps, setActiveComps] = useState<any[]>([])
  const [volumeHistory, setVolumeHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      setUser(data.user)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase.from("workouts").select("*", { count: "exact", head: true }).eq("user_id", user.id).then(({ count }) => setWorkoutCount(count ?? 0))
    supabase.from("exercise_sets")
      .select("reps, weight_kg, workout_exercises!inner(workout_id, workouts!inner(user_id))")
      .eq("workout_exercises.workouts.user_id", user.id).eq("completed", true)
      .then(({ data }) => setVolume(data?.reduce((s: number, r: any) => s + (r.reps * (r.weight_kg ?? 0)), 0) ?? 0))
    supabase.from("workouts").select("*").eq("user_id", user.id).order("started_at", { ascending: false }).limit(6)
      .then(({ data }) => { setRecentWorkouts(data ?? []); setLoading(false) })
    supabase.from("competitions").select("*, exercises(name)").eq("status", "active").limit(4)
      .then(({ data }) => setActiveComps(data ?? []))

    // Build volume history
    supabase.from("exercise_sets")
      .select("reps, weight_kg, created_at, workout_exercises!inner(workouts!inner(started_at))")
      .eq("completed", true)
      .eq("workout_exercises.workouts.user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        const weekly: Record<string, { volume: number; workouts: number }> = {}
        ;(data ?? []).forEach((r: any) => {
          const d = new Date(r.workout_exercises.workouts.started_at)
          d.setDate(d.getDate() - d.getDay())
          const k = d.toISOString().slice(0, 10)
          if (!weekly[k]) weekly[k] = { volume: 0, workouts: 0 }
          weekly[k].volume += r.reps * (r.weight_kg ?? 0)
          weekly[k].workouts = Math.max(weekly[k].workouts, 1)
        })
        const hist = Object.entries(weekly).map(([week, v]) => ({ week, ...v })).slice(-8)
        setVolumeHistory(hist)
      })
  }, [user])

  const demoVolume = volumeHistory.length > 0 ? volumeHistory : [
    { week: "W1", volume: 12500 }, { week: "W2", volume: 18200 }, { week: "W3", volume: 15400 },
    { week: "W4", volume: 22100 }, { week: "W5", volume: 19800 }, { week: "W6", volume: 24600 },
    { week: "W7", volume: 20300 }, { week: "W8", volume: 28400 },
  ]

  return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(5,5,5,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          <Link href="/" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 16, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "#ffffff", textDecoration: "none" }}>PUMPS</Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[
              { href: "/dashboard", label: "DASHBOARD" },
              { href: "/workouts/new", label: "LOG" },
              { href: "/competitions", label: "COMPETE" },
              { href: "/leaderboard", label: "RANKS" },
              { href: "/progress", label: "PROGRESS" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8d8d8d", textDecoration: "none", padding: "8px 14px", transition: "color 0.1s" }}>
                {l.label}
              </Link>
            ))}
            <Link href="/workouts/new" className="btn-primary" style={{ marginLeft: 12, fontSize: 12, padding: "8px 16px" }}>
              <Plus size={14} /> LOG
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}>
        {/* Hero banner */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "#ffffff", lineHeight: 1.05 }}>
            {user?.user_metadata?.display_name || user?.email?.split("@")[0] || "ATHLETE"}
          </h1>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ccff00", marginTop: 4 }}>
            OVERVIEW
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, marginBottom: 48 }}>
          <ScrambleCounter value={workoutCount} label="WORKOUTS" icon={Zap} delay={100} />
          <ScrambleCounter value={volume} label="TOTAL VOLUME" unit="KG" icon={TrendingUp} delay={200} />
          <ScrambleCounter value={activeComps.length} label="LIVE COMPS" icon={Swords} delay={300} />
          <div className="card-surface" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Activity size={14} style={{ color: "#ccff00" }} />
              <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8d8d8d" }}>STATUS</span>
            </div>
            <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: loading ? "#8d8d8d" : "#ccff00", textTransform: "uppercase" }}>
              {loading ? "LOADING" : "READY"}
            </span>
          </div>
        </div>

        {/* Volume chart */}
        <div className="card-surface" style={{ padding: 24, marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ffffff" }}>VOLUME HISTORY</h3>
            <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8d8d8d" }}>LAST 8 WEEKS</span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoVolume}>
                <XAxis dataKey="week" stroke="#8d8d8d" fontSize={10} />
                <YAxis stroke="#8d8d8d" fontSize={10} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 0, fontSize: 12, fontFamily: "var(--font-heading-stack)" }} />
                <Bar dataKey="volume" radius={[0, 0, 0, 0]}>
                  {demoVolume.map((_, i) => (
                    <Cell key={i} fill={i === demoVolume.length - 1 ? "#ccff00" : "#1a1a1a"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent workouts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 48 }}>
          <div className="card-surface" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ffffff" }}>RECENT WORKOUTS</h3>
              <Link href="/workouts" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ccff00", textDecoration: "none" }}>
                VIEW ALL <ChevronRight size={12} style={{ display: "inline" }} />
              </Link>
            </div>
            {recentWorkouts.length > 0 ? (
              <div className="stagger">
                {recentWorkouts.map(w => (
                  <Link key={w.id} href={`/workouts/${w.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1a1a1a", textDecoration: "none" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em", color: "#ffffff", textTransform: "uppercase" }}>{w.name}</p>
                      <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, letterSpacing: "0.03em", color: "#8d8d8d", marginTop: 2 }}>
                        <Clock size={11} style={{ display: "inline", marginRight: 4 }} />
                        {new Date(w.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <span className="badge" style={{ background: w.completed_at ? "#ccff00" : "#1a1a1a", color: w.completed_at ? "#050505" : "#8d8d8d" }}>
                      {w.completed_at ? "DONE" : "ACTIVE"}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "#8d8d8d", padding: "20px 0", textAlign: "center" }}>No workouts yet</p>
            )}
          </div>

          <div className="card-surface" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ffffff" }}>ACTIVE COMPETITIONS</h3>
              <Link href="/competitions" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ccff00", textDecoration: "none" }}>
                VIEW ALL <ChevronRight size={12} style={{ display: "inline" }} />
              </Link>
            </div>
            {activeComps.length > 0 ? (
              <div className="stagger">
                {activeComps.map((c: any) => (
                  <Link key={c.id} href={`/competitions/${c.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1a1a1a", textDecoration: "none" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em", color: "#ffffff", textTransform: "uppercase" }}>{c.name}</p>
                      <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, letterSpacing: "0.03em", color: "#8d8d8d", marginTop: 2 }}>
                        {c.exercises?.name} — {c.type?.replace("_", " ")}
                      </p>
                    </div>
                    <span className="badge" style={{ background: "#ccff00", color: "#050505", display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="status-dot active" /> LIVE
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "#8d8d8d" }}>No active competitions</p>
                <Link href="/competitions/new" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "#ccff00", textDecoration: "none", display: "inline-block", marginTop: 8 }}>
                  CREATE ONE
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
