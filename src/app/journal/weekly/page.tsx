"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AppNav } from "@/components/layout/nav"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2, Sparkles } from "lucide-react"

type Insight = { type: string; text: string }

export default function WeeklyJournalPage() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [insights, setInsights] = useState<Insight[] | null>(null)
  const [weekSummary, setWeekSummary] = useState("")
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Current week boundaries (Mon–Sun)
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek + 1)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

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
    supabase.from("journals")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "daily")
      .gte("date", monday.toISOString().slice(0, 10))
      .lte("date", sunday.toISOString().slice(0, 10))
      .order("date", { ascending: true })
      .then(({ data }) => {
        setEntries(data ?? [])
        setLoading(false)
      })
  }, [user])

  async function generateInsights() {
    if (entries.length === 0) return
    setGenerating(true)
    try {
      const res = await fetch("/api/ai/journal-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: entries.map(e => ({ date: e.date, mood: e.mood, energy_level: e.energy_level, content_json: e.content_json })) }),
      })
      const data = await res.json()
      if (data.insights) { setInsights(data.insights); setWeekSummary(data.week_summary ?? "") }
    } catch {
      // silent
    } finally {
      setGenerating(false)
    }
  }

  const moodData = entries.map(e => ({ day: new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }), mood: e.mood ?? 0, energy: e.energy_level ?? 0 }))

  const INSIGHT_COLORS: Record<string, string> = { energy: "var(--accent-blue)", recovery: "var(--accent)", progress: "var(--accent)", suggestion: "var(--text-secondary)" }

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
            This Week
          </h1>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 4 }}>
            {monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {sunday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "var(--text-secondary)" }}>Loading…</div>
        ) : (
          <>
            {entries.length > 0 && (
              <div className="card-surface" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)", marginBottom: 20 }}>Mood & Energy</h3>
                <div style={{ height: 160 }} aria-hidden="true">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodData}>
                      <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={10} />
                      <YAxis domain={[0, 5]} stroke="var(--text-secondary)" fontSize={10} />
                      <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 0, fontSize: 12, fontFamily: "var(--font-heading-stack)" }} />
                      <Line type="monotone" dataKey="mood" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 3 }} name="Mood" />
                      <Line type="monotone" dataKey="energy" stroke="var(--accent-blue)" strokeWidth={2} dot={{ fill: "var(--accent-blue)", r: 3 }} name="Energy" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Daily entries timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 32 }}>
              {entries.map(e => (
                <div key={e.id} className="card-surface" style={{ padding: 20, display: "flex", gap: 16 }}>
                  <div style={{ minWidth: 48, textAlign: "center" }}>
                    <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 20, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>
                      {new Date(e.date + "T12:00:00").getDate()}
                    </p>
                    <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                      {new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      {(e.content_json?.body ?? "").slice(0, 300) || "No notes."}
                    </p>
                    <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                      {e.mood != null && <span className="label-sm">Mood: {e.mood}/5</span>}
                      {e.energy_level != null && <span className="label-sm">Energy: {e.energy_level}/5</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            <div className="card-surface" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: insights ? 20 : 0 }}>
                <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)" }}>
                  AI Coach Insights
                </h3>
                <button
                  type="button"
                  onClick={generateInsights}
                  disabled={generating || entries.length === 0}
                  className="btn-outline"
                  style={{ fontSize: 11, padding: "8px 16px", gap: 6 }}
                >
                  {generating ? <Loader2 size={12} style={{ animation: "spin 0.6s linear infinite" }} /> : <Sparkles size={12} />}
                  {generating ? "Analyzing…" : "Generate Insights"}
                </button>
              </div>
              {weekSummary && (
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, color: "var(--fg)", marginBottom: 16, padding: "12px 16px", background: "var(--surface-elevated)", borderLeft: "3px solid var(--accent)" }}>
                  {weekSummary}
                </p>
              )}
              {insights && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {insights.map((ins, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: 14, background: "var(--surface-elevated)" }}>
                      <span style={{ width: 6, flexShrink: 0, background: INSIGHT_COLORS[ins.type] ?? "var(--accent)", alignSelf: "stretch" }} />
                      <div>
                        <span className="label-sm" style={{ color: INSIGHT_COLORS[ins.type] ?? "var(--accent)", marginBottom: 4, display: "block" }}>{ins.type}</span>
                        <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--fg)", lineHeight: 1.6 }}>{ins.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
