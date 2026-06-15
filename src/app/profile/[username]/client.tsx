"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { totalVolume } from "@/lib/metrics"
import { Dumbbell, TrendingUp, Clock } from "lucide-react"
import { PageShell, Card, StatCard, SectionHeader, ListRow, Badge, EmptyState, Fill } from "@/components/ui/kinetic"

export default function ProfileClient() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<any>(null)
  const [workoutCount, setWorkoutCount] = useState(0)
  const [volume, setVolume] = useState(0)
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username) return
    let cancelled = false
    const supabase = createClient()

    async function load() {
      const { data: p } = await supabase.from("profiles").select("*").eq("username", username).single()
      if (cancelled) return
      if (!p) { setProfile(null); setLoading(false); return }
      setProfile(p)
      setLoading(false)

      // Volume is cross-user, so only completed sets are visible (RLS) — match
      // that and run it through the canonical metric.
      const [wc, sets, rw] = await Promise.all([
        supabase.from("workouts").select("*", { count: "exact", head: true }).eq("user_id", p.id),
        supabase
          .from("exercise_sets")
          .select("reps, weight_kg, workout_exercises!inner(workouts!inner(user_id))")
          .eq("workout_exercises.workouts.user_id", p.id)
          .eq("completed", true),
        supabase.from("workouts").select("*").eq("user_id", p.id).order("started_at", { ascending: false }).limit(5),
      ])
      if (cancelled) return
      setWorkoutCount(wc.count ?? 0)
      setVolume(totalVolume((sets.data ?? []) as { reps: number; weight_kg: number | null }[]))
      setRecent(rw.data ?? [])
    }

    load().catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [username])

  if (loading) return <Fill>…</Fill>
  if (!profile) return <Fill>Profile not found</Fill>

  const initials = (profile.username ?? "?").slice(0, 2).toUpperCase()
  const joined = new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
  const subtitle = [`@${profile.username}`, profile.experience_level, `joined ${joined}`].filter(Boolean).join(" · ")

  return (
    <PageShell>
      {/* Cover + avatar */}
      <Card padded={false} className="k-section" style={{ overflow: "hidden" }}>
        <div style={{ height: 96, background: "radial-gradient(120% 160% at 80% -40%, color-mix(in oklch, var(--accent) 22%, transparent), transparent 55%), linear-gradient(180deg, var(--surface-elevated), var(--bg-elevated))" }} />
        <div style={{ padding: "0 24px 24px", marginTop: -38, position: "relative" }}>
          <div style={{ width: 76, height: 76, borderRadius: 22, background: "var(--surface-elevated)", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading-stack)", fontSize: 26, fontWeight: 700, color: "var(--accent)", boxShadow: "0 0 30px color-mix(in oklch, var(--accent) 25%, transparent)" }}>
            {initials}
          </div>
          <h1 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--fg)", marginTop: 14 }}>{profile.username}</h1>
          <p className="k-row-sub" style={{ marginTop: 4, textTransform: "capitalize" }}>{subtitle}</p>
        </div>
      </Card>

      {/* Stats */}
      <div className="k-stats-grid k-section">
        <StatCard icon={Dumbbell} label="WORKOUTS" value={workoutCount} />
        <StatCard icon={TrendingUp} label="TOTAL VOLUME" value={volume} unit="KG" />
      </div>

      {/* Recent */}
      <Card>
        <SectionHeader title="Recent workouts" />
        {recent.length > 0 ? (
          <div className="stagger">
            {recent.map(w => (
              <ListRow
                key={w.id}
                title={w.name}
                subtitle={
                  <>
                    <Clock size={11} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />
                    {new Date(w.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </>
                }
                trailing={<Badge variant={w.completed_at ? "solid" : "muted"}>{w.completed_at ? "DONE" : "ACTIVE"}</Badge>}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="No workouts yet" />
        )}
      </Card>
    </PageShell>
  )
}
