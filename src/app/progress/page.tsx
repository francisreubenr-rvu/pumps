"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Dumbbell, TrendingUp } from "lucide-react"
import { PageShell, PageTitle, Card, EmptyState } from "@/components/ui/kinetic"

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  fontSize: 12,
  fontFamily: "var(--font-heading-stack)",
}

// Format an ISO yyyy-mm-dd key into a short, sortable display label.
function fmtDay(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function ProgressPage() {
  const [exercises, setExercises] = useState<string[]>([])
  const [selected, setSelected] = useState("")
  const [maxWeight, setMaxWeight] = useState<any[]>([])
  const [volume, setVolume] = useState<any[]>([])
  const [tab, setTab] = useState<"weight" | "volume">("weight")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      setUser(data.user)
      supabase.from("exercise_sets").select(`reps, weight_kg, created_at, workout_exercises!inner(exercises!inner(name), workouts!inner(started_at))`)
        .eq("completed", true).eq("workout_exercises.workouts.user_id", data.user.id).order("created_at", { ascending: true })
        .then(({ data }) => {
          const rows = (data ?? []).map((r: any) => {
            // Stable ISO day key — reliable chronological sort + dedupe.
            const day = new Date(r.workout_exercises.workouts.started_at).toISOString().slice(0, 10)
            return {
              day,
              weight_kg: r.weight_kg ?? 0,
              reps: r.reps,
              volume: r.reps * (r.weight_kg ?? 0),
              exercise: r.workout_exercises.exercises.name,
            }
          })

          const uniq = [...new Set(rows.map(r => r.exercise))] as string[]
          setExercises(uniq)
          if (uniq.length > 0) setSelected(uniq[0])

          // Max weight: one point per (day, exercise), keeping the heaviest lift.
          const best: Record<string, any> = {}
          rows.forEach(r => {
            const k = `${r.day}|${r.exercise}`
            if (!best[k] || r.weight_kg > best[k].weight_kg) {
              best[k] = { day: r.day, date: fmtDay(r.day), weight_kg: r.weight_kg, exercise: r.exercise }
            }
          })
          setMaxWeight(Object.values(best).sort((a: any, b: any) => a.day.localeCompare(b.day)))

          // Weekly volume: bucket by ISO week-start (Sunday), summed.
          const weekly: Record<string, number> = {}
          rows.forEach(r => {
            const d = new Date(`${r.day}T00:00:00`)
            d.setDate(d.getDate() - d.getDay())
            const wk = d.toISOString().slice(0, 10)
            weekly[wk] = (weekly[wk] ?? 0) + r.volume
          })
          setVolume(
            Object.entries(weekly)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([wk, v]) => ({ period: fmtDay(wk), volume: Math.round(v) })),
          )
        })
    })
  }, [router])

  const filtered = maxWeight.filter((d: any) => d.exercise === selected)

  return (
    <PageShell>
      <PageTitle title="Progress" eyebrow="Strength over time" />

      <div className="k-section" style={{ display: "flex", gap: 2 }}>
        {[{ k: "weight" as const, l: "MAX WEIGHT", icon: Dumbbell }, { k: "volume" as const, l: "WEEKLY VOLUME", icon: TrendingUp }].map(t => {
          const active = tab === t.k
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              style={{
                fontFamily: "var(--font-heading-stack)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "8px 16px",
                background: active ? "var(--accent)" : "var(--surface-elevated)",
                color: active ? "var(--bg)" : "var(--text-secondary)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <t.icon size={14} /> {t.l}
            </button>
          )
        })}
      </div>

      {tab === "weight" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 className="k-title">Max weight</h3>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, color: "var(--fg)", background: "var(--surface-elevated)", border: "1px solid var(--border)", padding: "6px 10px" }}
            >
              {exercises.map(ex => <option key={ex}>{ex}</option>)}
            </select>
          </div>
          {filtered.length >= 2 ? (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filtered} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={10} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="weight_kg" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : filtered.length === 1 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p className="k-stat" style={{ color: "var(--accent)" }}>{filtered[0].weight_kg} kg</p>
              <p className="k-row-sub" style={{ marginTop: 8 }}>Best on {filtered[0].date} — log another session to chart a trend</p>
            </div>
          ) : (
            <EmptyState message="No data yet — complete a set to track your max weight" />
          )}
        </Card>
      )}

      {tab === "volume" && (
        <Card>
          <h3 className="k-title" style={{ marginBottom: 24 }}>Weekly volume</h3>
          {volume.length >= 2 ? (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volume} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <XAxis dataKey="period" stroke="var(--text-secondary)" fontSize={10} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="volume" fill="var(--accent)" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : volume.length === 1 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p className="k-stat" style={{ color: "var(--accent)" }}>{volume[0].volume.toLocaleString()} kg</p>
              <p className="k-row-sub" style={{ marginTop: 8 }}>Week of {volume[0].period} — train another week to compare</p>
            </div>
          ) : (
            <EmptyState message="No data yet — complete a set to track your volume" />
          )}
        </Card>
      )}
    </PageShell>
  )
}
