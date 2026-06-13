"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { AppNav } from "@/components/layout/nav"
import { Plus, BookOpen, Zap } from "lucide-react"

function MoodDots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{ width: 6, height: 6, background: i < value ? "var(--accent)" : "var(--surface-elevated)", border: i < value ? "none" : "1px solid var(--border)" }} />
      ))}
    </div>
  )
}

export default function JournalPage() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"daily" | "weekly">("daily")
  const router = useRouter()

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
    supabase
      .from("journals")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", tab)
      .order("date", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setEntries(data ?? [])
        setLoading(false)
      })
  }, [user, tab])

  const today = new Date().toISOString().slice(0, 10)
  const hasEntryToday = entries.some(e => e.date === today)

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
              Journal
            </h1>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 4 }}>
              {entries.length} entries
            </p>
          </div>
          <Link href="/journal/new" className="btn-primary" style={{ gap: 8 }}>
            <Plus size={14} aria-hidden="true" />
            {hasEntryToday ? "Update Today" : "Write Today's Entry"}
          </Link>
        </div>

        <div style={{ display: "flex", gap: 2, marginBottom: 32 }}>
          {(["daily", "weekly"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 20px",
                fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                background: tab === t ? "var(--accent)" : "var(--surface)",
                color: tab === t ? "var(--bg)" : "var(--text-secondary)",
                border: "1px solid var(--border)", cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "var(--text-secondary)" }}>Loading…</div>
        ) : entries.length === 0 ? (
          <div className="card-surface" style={{ padding: 64, textAlign: "center" }}>
            <BookOpen size={32} style={{ color: "var(--text-secondary)", marginBottom: 16 }} />
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
              No {tab} entries yet
            </p>
            <Link href="/journal/new" className="btn-primary" style={{ marginTop: 24, display: "inline-flex" }}>
              Write Your First Entry
            </Link>
          </div>
        ) : (
          <div className="stagger" style={{ display: "grid", gap: 2 }}>
            {entries.map(e => (
              <div key={e.id} className="card-surface" style={{ padding: 20, display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ minWidth: 80 }}>
                  <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>
                    {new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                  <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>
                    {new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
                    {e.mood != null && (
                      <div>
                        <span className="label-sm" style={{ display: "block", marginBottom: 4 }}>Mood</span>
                        <MoodDots value={e.mood} />
                      </div>
                    )}
                    {e.energy_level != null && (
                      <div>
                        <span className="label-sm" style={{ display: "block", marginBottom: 4 }}>Energy</span>
                        <MoodDots value={e.energy_level} />
                      </div>
                    )}
                  </div>
                  <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {(e.content_json?.body ?? "").slice(0, 200) || "No notes."}
                    {(e.content_json?.body ?? "").length > 200 && "…"}
                  </p>
                  {e.content_json?.workout && (
                    <span className="badge" style={{ background: "var(--accent)", color: "var(--bg)", marginTop: 8, display: "inline-flex", gap: 4 }}>
                      <Zap size={10} /> Workout logged
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link href="/journal/weekly" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", textDecoration: "none" }}>
            View Weekly Summaries →
          </Link>
        </div>
      </main>
    </div>
  )
}
