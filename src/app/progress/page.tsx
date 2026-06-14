"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Dumbbell, TrendingUp, Flame, PieChart } from "lucide-react"
import { useUser } from "@/lib/queries/auth"
import { useProgressData } from "@/lib/queries/progress"
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
  const [selected, setSelected] = useState("")
  const [tab, setTab] = useState<"weight" | "e1rm" | "volume" | "split">("weight")
  const router = useRouter()

  const { data: user, isLoading: userLoading } = useUser()
  const { data } = useProgressData(user?.id)

  useEffect(() => {
    if (!userLoading && !user) router.replace("/auth/login")
  }, [userLoading, user, router])

  const exercises = useMemo(() => data?.exercises ?? [], [data])

  // Default the picker to the first exercise once data arrives.
  useEffect(() => {
    if (!selected && exercises.length > 0) setSelected(exercises[0])
  }, [selected, exercises])

  // Format the canonical metrics output for display (numbers come from
  // `metrics.ts`; only the date labels and rounding are presentational).
  const maxWeight = useMemo(
    () => (data?.maxWeight ?? []).map(r => ({ ...r, date: fmtDay(r.day) })),
    [data]
  )
  const e1rm = useMemo(
    () => (data?.e1rm ?? []).map(r => ({ ...r, date: fmtDay(r.day), e1rm: Math.round(r.e1rm) })),
    [data]
  )
  const volume = useMemo(
    () => (data?.volume ?? []).map(r => ({ period: fmtDay(r.week), volume: Math.round(r.volume) })),
    [data]
  )
  const muscleSplit = data?.muscleSplit ?? []
  const totalSplitSets = muscleSplit.reduce((s, m) => s + m.sets, 0)

  const filtered = maxWeight.filter(d => d.exercise === selected)
  const filteredE1rm = e1rm.filter(d => d.exercise === selected)

  return (
    <PageShell>
      <PageTitle title="Progress" eyebrow="Strength over time" />

      <div className="k-section" style={{ display: "flex", gap: 2 }}>
        {[{ k: "weight" as const, l: "MAX WEIGHT", icon: Dumbbell }, { k: "e1rm" as const, l: "EST. 1RM", icon: Flame }, { k: "volume" as const, l: "WEEKLY VOLUME", icon: TrendingUp }, { k: "split" as const, l: "MUSCLE SPLIT", icon: PieChart }].map(t => {
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

      {tab === "e1rm" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 className="k-title">Estimated 1RM</h3>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, color: "var(--fg)", background: "var(--surface-elevated)", border: "1px solid var(--border)", padding: "6px 10px" }}
            >
              {exercises.map(ex => <option key={ex}>{ex}</option>)}
            </select>
          </div>
          <p className="k-row-sub" style={{ marginBottom: 24 }}>Epley estimate — credits heavier reps, not just top weight.</p>
          {filteredE1rm.length >= 2 ? (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredE1rm} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={10} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="e1rm" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : filteredE1rm.length === 1 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p className="k-stat" style={{ color: "var(--accent)" }}>{filteredE1rm[0].e1rm} kg</p>
              <p className="k-row-sub" style={{ marginTop: 8 }}>Est. 1RM on {filteredE1rm[0].date} — log another session to chart a trend</p>
            </div>
          ) : (
            <EmptyState message="No data yet — complete a set to estimate your 1RM" />
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

      {tab === "split" && (
        <Card>
          <h3 className="k-title" style={{ marginBottom: 4 }}>Muscle split</h3>
          <p className="k-row-sub" style={{ marginBottom: 24 }}>Sets per muscle group — spot what you’re neglecting.</p>
          {muscleSplit.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {muscleSplit.map(m => {
                const pct = totalSplitSets > 0 ? Math.round((m.sets / totalSplitSets) * 100) : 0
                return (
                  <div key={m.category}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span className="k-row-title" style={{ textTransform: "capitalize" }}>{m.category}</span>
                      <span className="k-row-sub">{m.sets} {m.sets === 1 ? "set" : "sets"} · {pct}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: "var(--r-pill)", background: "var(--surface-elevated)", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: "var(--r-pill)" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState message="No data yet — complete a set to see your training split" />
          )}
        </Card>
      )}
    </PageShell>
  )
}
