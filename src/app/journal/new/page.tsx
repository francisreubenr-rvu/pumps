"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { resolveExerciseId } from "@/lib/exercises"
import { AppNav } from "@/components/layout/nav"
import { useMode, JOURNAL_PROMPTS } from "@/lib/mode-context"
import { Loader2, Zap, Check } from "lucide-react"

function ScoreSelector({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div>
      <span className="label-sm" style={{ display: "block", marginBottom: 8 }}>{label}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              width: 32, height: 32,
              background: n <= value ? "var(--accent)" : "var(--surface-elevated)",
              color: n <= value ? "var(--bg)" : "var(--text-secondary)",
              border: "1px solid var(--border)", cursor: "pointer",
              fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 700,
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

type ParsedExercise = { name: string; sets: { reps: number; weight_kg: number }[] }

export default function NewJournalPage() {
  const [user, setUser] = useState<any>(null)
  const [body, setBody] = useState("")
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [dumpText, setDumpText] = useState("")
  const [parsing, setParsing] = useState(false)
  const [parsedWorkout, setParsedWorkout] = useState<ParsedExercise[] | null>(null)
  const [parseError, setParseError] = useState("")

  const router = useRouter()
  const { mode } = useMode()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      setUser(data.user)
    })
  }, [router])

  async function parseWorkout() {
    if (!dumpText.trim()) return
    setParsing(true)
    setParseError("")
    setParsedWorkout(null)
    try {
      const res = await fetch("/api/ai/workout-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: dumpText }),
      })
      const data = await res.json()
      if (data.error) { setParseError(data.error); return }
      setParsedWorkout(data.exercises)
    } catch {
      setParseError("Failed to connect. Check your network.")
    } finally {
      setParsing(false)
    }
  }

  async function saveEntry() {
    if (!user) return
    setSaving(true)
    const supabase = createClient()
    const contentJson: any = { body }
    if (parsedWorkout) contentJson.workout = parsedWorkout

    const today = new Date().toISOString().slice(0, 10)
    const { data: existing } = await supabase.from("journals").select("id").eq("user_id", user.id).eq("date", today).eq("type", "daily").single()

    const payload = { user_id: user.id, date: today, type: "daily", content_json: contentJson, mood, energy_level: energy }

    if (existing) {
      await supabase.from("journals").update(payload).eq("id", existing.id)
    } else {
      await supabase.from("journals").insert(payload)
    }

    // If workout was parsed, also create a workout entry
    if (parsedWorkout && parsedWorkout.length > 0) {
      const { data: wk } = await supabase.from("workouts").insert({ user_id: user.id, name: `Journal — ${today}`, started_at: new Date().toISOString(), completed_at: new Date().toISOString() }).select("id").single()
      if (wk) {
        for (let i = 0; i < parsedWorkout.length; i++) {
          const ex = parsedWorkout[i]
          // Resolve to a canonical exercise via the alias layer (handles
          // "bench" / "Bench Press" / "barbell bench" → one entity) instead of
          // exact-matching and creating a duplicate on every variant.
          const exerciseId = await resolveExerciseId(supabase, ex.name)
          if (!exerciseId) continue
          const { data: we } = await supabase.from("workout_exercises").insert({ workout_id: wk.id, exercise_id: exerciseId, sort_order: i }).select("id").single()
          if (we) {
            await supabase.from("exercise_sets").insert(ex.sets.map((s, j) => ({ workout_exercise_id: we.id, set_number: j + 1, reps: s.reps, weight_kg: s.weight_kg, completed: true })))
          }
        }
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => router.push("/journal"), 1200)
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
            Today&apos;s Entry
          </h1>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 4 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {/* Left: Journal entry */}
          <div className="card-surface" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label className="label-sm" style={{ display: "block", marginBottom: 8 }}>
                {JOURNAL_PROMPTS[mode]}
              </label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write here…"
                rows={10}
                className="input-field"
                style={{ width: "100%", resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
            <ScoreSelector value={mood} onChange={setMood} label="Mood (1–5)" />
            <ScoreSelector value={energy} onChange={setEnergy} label="Energy (1–5)" />
            <button
              type="button"
              onClick={saveEntry}
              disabled={saving || saved}
              className="btn-primary"
              style={{ justifyContent: "center", padding: "14px 0" }}
            >
              {saved ? <><Check size={14} /> Saved!</> : saving ? <><Loader2 size={14} style={{ animation: "spin 0.6s linear infinite" }} /> Saving…</> : "Save Entry"}
            </button>
          </div>

          {/* Right: Workout chat dump */}
          <div className="card-surface" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--fg)", marginBottom: 4 }}>
                Workout Chat Dump
              </h3>
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--text-secondary)" }}>
                Describe your workout in plain English — AI will structure it.
              </p>
            </div>
            <textarea
              value={dumpText}
              onChange={e => setDumpText(e.target.value)}
              placeholder="e.g. did bench 3x8 at 80kg, then squats 5x5 at 100kg, finished with pulldowns 4x12 60kg"
              rows={6}
              className="input-field"
              style={{ width: "100%", resize: "vertical" }}
            />
            <button
              type="button"
              onClick={parseWorkout}
              disabled={parsing || !dumpText.trim()}
              className="btn-outline"
              style={{ justifyContent: "center", padding: "12px 0" }}
            >
              {parsing ? <><Loader2 size={14} style={{ animation: "spin 0.6s linear infinite" }} /> Parsing…</> : <><Zap size={14} /> Parse Workout</>}
            </button>
            {parseError && (
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--accent-red)", padding: "8px 12px", background: "var(--surface-elevated)" }}>{parseError}</p>
            )}
            {parsedWorkout && (
              <div>
                <p className="label-sm" style={{ marginBottom: 12 }}>Parsed — save entry to add to workouts</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {parsedWorkout.map((ex, i) => (
                    <div key={i} className="card-elevated" style={{ padding: 12 }}>
                      <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--fg)", marginBottom: 6 }}>{ex.name}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {ex.sets.map((s, j) => (
                          <span key={j} className="badge" style={{ background: "var(--surface-elevated)" }}>
                            {s.reps} × {s.weight_kg}kg
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
