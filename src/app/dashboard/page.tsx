"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, Swords, Plus, Activity, Zap, ChevronRight, Clock } from "lucide-react"
import { useMode } from "@/lib/mode-context"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import {
  PageShell,
  PageHero,
  SectionHeader,
  Card,
  StatCard,
  Badge,
  ListRow,
  EmptyState,
} from "@/components/ui/kinetic"

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

  const quickActions = [
    { href: "/workouts/new", label: "Log Workout", icon: Plus },
    { href: "/journal/new", label: "Write Journal", icon: ChevronRight },
    { href: "/competitions/new", label: "New Competition", icon: Swords },
    { href: "/progress", label: "View Progress", icon: TrendingUp },
  ]

  return (
    <PageShell>
      <PageHero
        title={user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Athlete"}
        tagline={meta[mode].tagline}
        bgImage="/images/hero-weights.jpg"
      />

      {/* Stats */}
      <div className="k-stats-grid k-section">
        <StatCard icon={Zap} label="WORKOUTS" value={workoutCount} animate delay={100} />
        <StatCard icon={TrendingUp} label="TOTAL VOLUME" value={volume} unit="KG" animate delay={200} />
        <StatCard icon={Swords} label="LIVE COMPS" value={activeComps.length} animate delay={300} />
        <StatCard
          icon={Activity}
          label="STATUS"
          value={loading ? "…" : "Ready"}
        />
      </div>

      {/* Volume chart */}
      <Card className="k-section">
        <SectionHeader
          title="Volume History"
          action={<span className="k-eyebrow">Last 8 weeks</span>}
        />
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
      </Card>

      {/* Recent + competitions */}
      <div className="grid-2col k-section">
        <Card>
          <SectionHeader title="Recent Workouts" viewAllHref="/workouts" />
          {recentWorkouts.length > 0 ? (
            <div className="stagger">
              {recentWorkouts.map(w => (
                <ListRow
                  key={w.id}
                  href={`/workouts/${w.id}`}
                  title={w.name}
                  subtitle={
                    <>
                      <Clock size={11} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />
                      {new Date(w.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </>
                  }
                  trailing={
                    <Badge variant={w.completed_at ? "solid" : "muted"}>
                      {w.completed_at ? "DONE" : "Active"}
                    </Badge>
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No workouts yet" />
          )}
        </Card>

        <Card>
          <SectionHeader title="Active Competitions" viewAllHref="/competitions" />
          {activeComps.length > 0 ? (
            <div className="stagger">
              {activeComps.map((c: any) => (
                <ListRow
                  key={c.id}
                  href={`/competitions/${c.id}`}
                  title={c.name}
                  subtitle={`${c.exercises?.name ?? ""}${c.type ? ` — ${c.type.replace("_", " ")}` : ""}`}
                  trailing={<Badge variant="live">LIVE</Badge>}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No active competitions" actionHref="/competitions/new" actionLabel="Create one" />
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div className="k-quick-grid">
        {quickActions.map(a => (
          <Card key={a.href} href={a.href} interactive padded={false} style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <a.icon size={14} style={{ color: "var(--accent)", flexShrink: 0 }} aria-hidden="true" />
            <span className="k-title" style={{ fontSize: 12, letterSpacing: "0.04em" }}>{a.label}</span>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
