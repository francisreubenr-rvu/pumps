"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Save, Clock, Check } from "lucide-react"

export default function NewWorkoutPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const [exercises, setExercises] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [sets, setSets] = useState<Record<string, { reps: number; weight: number; completed: boolean }[]>>({})
  const [workoutName, setWorkoutName] = useState("")
  const [saving, setSaving] = useState(false)
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => { if (!data.user) router.replace("/auth/login"); else setUser(data.user) })
    supabase.from("exercises").select("*").order("category").then(({ data }) => setExercises(data ?? []))
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(t)
  }, [router, startTime])

  function addEx(id: string) { if (selected.includes(id)) return; setSelected([...selected, id]); setSets({ ...sets, [id]: [] }) }
  function removeEx(id: string) { setSelected(selected.filter(x => x !== id)); const ns = { ...sets }; delete ns[id]; setSets(ns) }
  function addSet(eid: string) { const cur = sets[eid] || []; setSets({ ...sets, [eid]: [...cur, { reps: 0, weight: 0, completed: false }] }) }
  function update(eid: string, i: number, f: "reps"|"weight", v: number) { const cur = [...(sets[eid]||[])]; cur[i] = { ...cur[i], [f]: v }; setSets({ ...sets, [eid]: cur }) }
  function toggle(eid: string, i: number) { const cur = [...(sets[eid]||[])]; cur[i] = { ...cur[i], completed: !cur[i].completed }; setSets({ ...sets, [eid]: cur }) }
  function removeSet(eid: string, i: number) { const cur = [...(sets[eid]||[])]; cur.splice(i, 1); setSets({ ...sets, [eid]: cur }) }

  async function save() {
    if (!user) return; setSaving(true)
    const supabase = createClient()
    const { data: w } = await supabase.from("workouts").insert({ user_id: user.id, name: workoutName || "Workout", started_at: new Date(startTime).toISOString(), completed_at: new Date().toISOString() }).select().single()
    if (!w) { setSaving(false); return }
    for (const [idx, eid] of selected.entries()) {
      const { data: we } = await supabase.from("workout_exercises").insert({ workout_id: w.id, exercise_id: eid, sort_order: idx }).select().single()
      if (!we) continue
      const es = sets[eid] || []
      await supabase.from("exercise_sets").insert(es.map((s, i) => ({ workout_exercise_id: we.id, set_number: i + 1, reps: s.reps, weight_kg: s.weight, completed: s.completed })))
    }
    setSaving(false); router.push(`/workouts/${w.id}`)
  }

  const cats = [...new Set(exercises.map(e => e.category))]
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2, "0")}`

  return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(5,5,5,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 56, display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
          <Link href="/dashboard" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 16, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "#ffffff", textDecoration: "none" }}>PUMPS</Link>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, color: "#8d8d8d" }}>/</span>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ccff00" }}>LOG WORKOUT</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 500, color: "#8d8d8d" }}>
            <Clock size={14} style={{ display: "inline", marginRight: 4 }} />{fmt(elapsed)}
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "#ffffff", lineHeight: 1.05 }}>NEW WORKOUT</h1>
          <input value={workoutName} onChange={e => setWorkoutName(e.target.value)} placeholder="Workout name" className="input-field" style={{ maxWidth: 320, marginTop: 16 }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {selected.map(eid => {
              const ex = exercises.find(e => e.id === eid)
              const ess = sets[eid] || []
              return (
                <div key={eid} className="card-elevated" style={{ padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", color: "#ffffff", textTransform: "uppercase" }}>{ex?.name}</h3>
                    <button onClick={() => removeEx(eid)} style={{ background: "none", border: "none", color: "#8d8d8d", cursor: "pointer" }}><Trash2 size={14} /></button>
                  </div>
                  <div className="stagger">
                    {ess.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, color: "#8d8d8d", width: 20, textAlign: "center" }}>{i + 1}</span>
                        <input type="number" placeholder="kg" value={s.weight || ""} onChange={e => update(eid, i, "weight", Number(e.target.value))} className="input-field" style={{ width: 80, padding: "6px 10px", fontSize: 13 }} />
                        <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, color: "#8d8d8d" }}>kg ×</span>
                        <input type="number" placeholder="reps" value={s.reps || ""} onChange={e => update(eid, i, "reps", Number(e.target.value))} className="input-field" style={{ width: 64, padding: "6px 10px", fontSize: 13 }} />
                        <button onClick={() => toggle(eid, i)} style={{ background: "none", border: "none", color: s.completed ? "#ccff00" : "#8d8d8d", cursor: "pointer", padding: 4 }}>
                          <Check size={16} />
                        </button>
                        <button onClick={() => removeSet(eid, i)} style={{ background: "none", border: "none", color: "#8d8d8d", cursor: "pointer", padding: 4 }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addSet(eid)} style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8d8d8d", background: "none", border: "1px dashed #1a1a1a", padding: "8px 0", width: "100%", cursor: "pointer", marginTop: 8 }}>
                      <Plus size={12} style={{ display: "inline", marginRight: 4 }} /> ADD SET
                    </button>
                  </div>
                </div>
              )
            })}
            {selected.length > 0 && (
              <button onClick={save} disabled={saving} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "16px 0", marginTop: 8 }}>
                <Save size={16} /> {saving ? "SAVING..." : "COMPLETE WORKOUT"}
              </button>
            )}
          </div>

          <div className="card-surface" style={{ padding: 24, position: "sticky", top: 72 }}>
            <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ffffff", marginBottom: 16 }}>EXERCISES</h3>
            {cats.map(cat => (
              <div key={cat} style={{ marginBottom: 16 }}>
                <p className="label-sm">{cat}</p>
                {exercises.filter(e => e.category === cat).map(ex => {
                  const added = selected.includes(ex.id)
                  return (
                    <button key={ex.id} onClick={() => addEx(ex.id)} disabled={added}
                      style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 500, color: added ? "#8d8d8d" : "#ffffff", background: "none", border: "none", cursor: added ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6, padding: "4px 0", width: "100%", textAlign: "left", opacity: added ? 0.4 : 1 }}>
                      <Plus size={12} style={{ color: added ? "#8d8d8d" : "#ccff00" }} /> {ex.name}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
