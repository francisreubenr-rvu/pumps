"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AppNav } from "@/components/layout/nav"
import { Loader2, Zap, ChevronDown, ChevronRight, BookMarked, Trash2 } from "lucide-react"

type Exercise = { name: string; sets: number; reps: string; rest_seconds: number; notes: string }
type Day = { day: string; focus: string; exercises: Exercise[] }
type Routine = { name: string; overview: string; days: Day[] }

const GOALS = [
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "strength", label: "Strength" },
  { value: "fat_loss", label: "Fat Loss" },
  { value: "endurance", label: "Endurance" },
  { value: "athletic", label: "Athletic Performance" },
]
const EQUIPMENT = [
  { value: "full_gym", label: "Full Gym" },
  { value: "dumbbells_only", label: "Dumbbells Only" },
  { value: "home_gym", label: "Home Gym" },
  { value: "bodyweight", label: "Bodyweight" },
]
const EXPERIENCE = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

function DayAccordion({ day }: { day: Day }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card-elevated" style={{ marginBottom: 2 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "none", border: "none", cursor: "pointer" }}
      >
        <div style={{ textAlign: "left" }}>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--fg)" }}>{day.day}</p>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{day.focus}</p>
        </div>
        {open ? <ChevronDown size={16} style={{ color: "var(--text-secondary)" }} /> : <ChevronRight size={16} style={{ color: "var(--text-secondary)" }} />}
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Exercise", "Sets", "Reps", "Rest", "Notes"].map(h => (
                  <th key={h} style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)", textAlign: "left", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {day.exercises.map((ex, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, color: "var(--fg)", padding: "8px 0", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{ex.name}</td>
                  <td style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--fg)", padding: "8px 8px", borderBottom: "1px solid var(--border)", fontVariantNumeric: "tabular-nums" }}>{ex.sets}</td>
                  <td style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--accent)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{ex.reps}</td>
                  <td style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--text-secondary)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{ex.rest_seconds}s</td>
                  <td style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--text-secondary)", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>{ex.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function RoutinesPage() {
  const [user, setUser] = useState<any>(null)
  const [goal, setGoal] = useState("muscle_gain")
  const [days, setDays] = useState(4)
  const [equipment, setEquipment] = useState("full_gym")
  const [experience, setExperience] = useState("intermediate")
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<Routine | null>(null)
  const [genError, setGenError] = useState("")
  const [saved, setSaved] = useState(false)
  const [savedRoutines, setSavedRoutines] = useState<any[]>([])
  const [expandedSaved, setExpandedSaved] = useState<string | null>(null)
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
    supabase.from("saved_routines").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setSavedRoutines(data ?? []))
  }, [user, saved])

  async function generateRoutine() {
    setGenerating(true)
    setGenError("")
    setGenerated(null)
    setSaved(false)
    try {
      const res = await fetch("/api/ai/generate-routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, days_per_week: days, equipment, experience }),
      })
      const data = await res.json()
      if (data.error) { setGenError(data.error); return }
      setGenerated(data)
    } catch {
      setGenError("Failed to generate. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  async function saveRoutine() {
    if (!generated || !user) return
    const supabase = createClient()
    await supabase.from("saved_routines").insert({
      user_id: user.id, name: generated.name, goal, days_per_week: days, equipment, experience, routine_json: generated,
    })
    setSaved(true)
  }

  async function deleteRoutine(id: string) {
    const supabase = createClient()
    await supabase.from("saved_routines").delete().eq("id", id)
    setSavedRoutines(prev => prev.filter(r => r.id !== id))
  }

  const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div>
      <label className="label-sm" style={{ display: "block", marginBottom: 6 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="input-field" style={{ width: "100%", padding: "10px 12px" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
            Routines
          </h1>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 4 }}>
            AI-Generated Workout Plans
          </p>
        </div>

        {/* Generator */}
        <div className="card-surface" style={{ padding: 28, marginBottom: 32 }}>
          <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)", marginBottom: 20 }}>
            Generate Plan
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 20 }}>
            <SelectField label="Goal" value={goal} onChange={setGoal} options={GOALS} />
            <SelectField label="Equipment" value={equipment} onChange={setEquipment} options={EQUIPMENT} />
            <SelectField label="Experience" value={experience} onChange={setExperience} options={EXPERIENCE} />
            <div>
              <label className="label-sm" style={{ display: "block", marginBottom: 6 }}>Days Per Week: {days}</label>
              <input type="range" min={2} max={7} value={days} onChange={e => setDays(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--accent)" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="label-sm">2</span>
                <span className="label-sm">7</span>
              </div>
            </div>
          </div>
          <button onClick={generateRoutine} disabled={generating} className="btn-primary" style={{ gap: 8 }}>
            {generating ? <><Loader2 size={14} style={{ animation: "spin 0.6s linear infinite" }} /> Generating…</> : <><Zap size={14} /> Generate Routine</>}
          </button>
          {genError && <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--accent-red)", marginTop: 12 }}>{genError}</p>}
        </div>

        {/* Generated result */}
        {generated && (
          <div className="card-surface" style={{ padding: 28, marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, textTransform: "uppercase", color: "var(--fg)", letterSpacing: "-0.02em" }}>{generated.name}</h3>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{generated.overview}</p>
              </div>
              <button
                onClick={saveRoutine}
                disabled={saved}
                className={saved ? "btn-outline" : "btn-primary"}
                style={{ gap: 8, whiteSpace: "nowrap" }}
              >
                <BookMarked size={13} />
                {saved ? "Saved!" : "Save Routine"}
              </button>
            </div>
            {generated.days.map((d, i) => <DayAccordion key={i} day={d} />)}
          </div>
        )}

        {/* Saved routines */}
        {savedRoutines.length > 0 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)", marginBottom: 16 }}>
              Saved Routines
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {savedRoutines.map(r => {
                const routine: Routine = r.routine_json
                const isExpanded = expandedSaved === r.id
                return (
                  <div key={r.id} className="card-surface">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
                      <button type="button" onClick={() => setExpandedSaved(isExpanded ? null : r.id)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", flex: 1 }}>
                        <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--fg)" }}>{routine.name}</p>
                        <p className="label-sm" style={{ marginTop: 4 }}>{r.goal.replace("_", " ")} · {r.days_per_week} days/week · {r.experience}</p>
                      </button>
                      <div style={{ display: "flex", gap: 8 }}>
                        {isExpanded ? <ChevronDown size={16} style={{ color: "var(--text-secondary)" }} /> : <ChevronRight size={16} style={{ color: "var(--text-secondary)" }} />}
                        <button type="button" onClick={() => deleteRoutine(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 0 }}>
                          <Trash2 size={14} aria-label="Delete routine" />
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: "0 20px 20px" }}>
                        <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>{routine.overview}</p>
                        {routine.days.map((d, i) => <DayAccordion key={i} day={d} />)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
