"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, Swords, Plus, Activity, Zap, ChevronRight, Clock, type LucideIcon } from "lucide-react"
import { useMode } from "@/lib/mode-context"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { AppNav } from "@/components/layout/nav"

function ScrambleCounter({ value, label, unit, icon: Icon, delay }: {
  value: number; label: string; unit?: string; icon: LucideIcon; delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [display, setDisplay] = useState("0")
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !mounted) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) { setDisplay(String(value)); return }

    const timer = setTimeout(() => {
      let current = 0; const steps = 20; const interval = 30; let step = 0
      const t = setInterval(() => {
        step++; current = Math.floor((value * step) / steps)
        setDisplay(String(current))
        if (step >= steps) { setDisplay(String(value)); clearInterval(t) }
      }, interval)
      return () => clearInterval(t)
    }, delay)
    return () => clearTimeout(timer)
  }, [visible, value, delay, mounted])

  return (
    <div ref={ref} className="card-surface" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon size={14} style={{ color: "var(--accent)" }} aria-hidden="true" />
        <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span aria-live="polite" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 36, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--fg)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{display}</span>
        {unit && <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", textTransform: "uppercase" }}>{unit}</span>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [workoutCount, setWorkoutCount] = useState(0)
  const [volume, setVolume] = useState(0)
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [activeComps, setActiveComps] = useState<any[]>([])
  const [volumeHistory, setVolumeHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { mode, meta } = useMode()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      setUser(data.user)
    })
  }, [router])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    Promise.all([
      supabase.from("workouts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("exercise_sets").select("reps, weight_kg, workout_exercises!inner(workout_id, workouts!inner(user_id))").eq("workout_exercises.workouts.user_id", user.id).eq("completed", true),
      supabase.from("workouts").select("*").eq("user_id", user.id).order("started_at", { ascending: false }).limit(6),
      supabase.from("competitions").select("*, exercises(name)").eq("status", "active").limit(4),
      supabase.from("exercise_sets").select("reps, weight_kg, created_at, workout_exercises!inner(workouts!inner(started_at))").eq("completed", true).eq("workout_exercises.workouts.user_id", user.id).order("created_at", { ascending: true }),
    ]).then(([wc, vol, rw, ac, vh]) => {
      wc ??= {}; vol ??= {}; rw ??= {}; ac ??= {}; vh ??= {}
      setWorkoutCount(wc.count ?? 0)
      setVolume(vol.data?.reduce((s: number, r: any) => s + (r.reps * (r.weight_kg ?? 0)), 0) ?? 0)
      setRecentWorkouts(rw.data ?? [])
      setActiveComps(ac.data ?? [])
      setLoading(false)

      const weekly: Record<string, { volume: number }> = {}
      ;(vh.data ?? []).forEach((r: any) => {
        const d = new Date(r.workout_exercises?.workouts?.started_at)
        d.setDate(d.getDate() - d.getDay())
        const k = d.toISOString().slice(0, 10)
        if (!weekly[k]) weekly[k] = { volume: 0 }
        weekly[k].volume += r.reps * (r.weight_kg ?? 0)
      })
      setVolumeHistory(Object.entries(weekly).map(([week, v]) => ({ week, ...v })).slice(-8))
    }).catch(() => {
      setLoading(false)
    })
  }, [user])

  const demoVolume = volumeHistory.length > 0 ? volumeHistory : [
    { week: "W1", volume: 12500 }, { week: "W2", volume: 18200 }, { week: "W3", volume: 15400 },
    { week: "W4", volume: 22100 }, { week: "W5", volume: 19800 }, { week: "W6", volume: 24600 },
    { week: "W7", volume: 20300 }, { week: "W8", volume: 28400 },
  ]

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />

      <main className="page-container">
        {/* Hero banner */}
        <div style={{ position: "relative", marginBottom: 40, padding: "32px 28px", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/hero-weights.jpg)", backgroundSize: "cover", backgroundPosition: "center 40%", opacity: 0.08 }} />
          <div style={{ position: "relative" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>
              {user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Athlete"}
            </h1>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", marginTop: 6 }}>
              {meta[mode].tagline}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 2, marginBottom: 32 }}>
          <ScrambleCounter value={workoutCount} label="WORKOUTS" icon={Zap} delay={100} />
          <ScrambleCounter value={volume} label="TOTAL VOLUME" unit="KG" icon={TrendingUp} delay={200} />
          <ScrambleCounter value={activeComps.length} label="LIVE COMPS" icon={Swords} delay={300} />
          <div className="card-surface" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Activity size={14} style={{ color: "var(--accent)" }} aria-hidden="true" />
              <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)" }}>STATUS</span>
            </div>
            <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: loading ? "var(--text-secondary)" : "var(--accent)", textTransform: "uppercase" }}>
              {loading ? "Loading…" : "Ready"}
            </span>
          </div>
        </div>

        {/* Volume chart */}
        <div className="card-surface" style={{ padding: 24, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)" }}>Volume History</h3>
            <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-secondary)" }}>LAST 8 WEEKS</span>
          </div>
          <div style={{ height: 200 }} aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoVolume}>
                <XAxis dataKey="week" stroke="var(--text-secondary)" fontSize={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 0, fontSize: 12, fontFamily: "var(--font-heading-stack)" }} />
                <Bar dataKey="volume" radius={[0, 0, 0, 0]}>
                  {demoVolume.map((_, i) => (
                    <Cell key={i} fill={i === demoVolume.length - 1 ? "var(--accent)" : "var(--surface-elevated)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two-column grid — stacks on mobile */}
        <div className="grid-2col" style={{ marginBottom: 32 }}>
          <div className="card-surface" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)" }}>Recent Workouts</h3>
              <Link href="/workouts" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                View all <ChevronRight size={12} />
              </Link>
            </div>
            {recentWorkouts.length > 0 ? (
              <div className="stagger">
                {recentWorkouts.map(w => (
                  <Link key={w.id} href={`/workouts/${w.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)", textDecoration: "none" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg)", textTransform: "uppercase" }}>{w.name}</p>
                      <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, letterSpacing: "0.03em", color: "var(--text-secondary)", marginTop: 2 }}>
                        <Clock size={11} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />
                        {new Date(w.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <span className="badge" style={{ background: w.completed_at ? "var(--accent)" : "var(--surface-elevated)", color: w.completed_at ? "var(--bg)" : "var(--text-secondary)" }}>
                      {w.completed_at ? "DONE" : "Active"}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)", padding: "20px 0", textAlign: "center" }}>No workouts yet</p>
            )}
          </div>

          <div className="card-surface" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)" }}>Active Competitions</h3>
              <Link href="/competitions" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                View all <ChevronRight size={12} />
              </Link>
            </div>
            {activeComps.length > 0 ? (
              <div className="stagger">
                {activeComps.map((c: any) => (
                  <Link key={c.id} href={`/competitions/${c.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)", textDecoration: "none" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg)", textTransform: "uppercase" }}>{c.name}</p>
                      <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, letterSpacing: "0.03em", color: "var(--text-secondary)", marginTop: 2 }}>
                        {c.exercises?.name} — {c.type?.replace("_", " ")}
                      </p>
                    </div>
                    <span className="badge" style={{ background: "var(--accent)", color: "var(--bg)", display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="status-dot active" aria-hidden="true" /> LIVE
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)" }}>No active competitions</p>
                <Link href="/competitions/new" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "var(--accent)", textDecoration: "none", display: "inline-block", marginTop: 8 }}>
                  Create One
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 2 }}>
          {[
            { href: "/workouts/new", label: "Log Workout", icon: Plus },
            { href: "/journal/new", label: "Write Journal", icon: ChevronRight },
            { href: "/competitions/new", label: "New Competition", icon: Swords },
            { href: "/progress", label: "View Progress", icon: TrendingUp },
          ].map((a, i) => (
            <Link key={i} href={a.href} className="card-surface" style={{ padding: "20px 16px", textDecoration: "none", display: "flex", alignItems: "center", gap: 10, transition: "border-color 100ms" }}>
              <a.icon size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--fg)" }}>{a.label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
