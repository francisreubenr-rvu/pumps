"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Save, Clock, Check } from "lucide-react"
import { DetailShell, Card, PageTitle } from "@/components/ui/kinetic"

export default function NewWorkoutPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const [exercises, setExercises] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [sets, setSets] = useState<Record<string, { reps: number; weight: number; completed: boolean }[]>>({})
  const [workoutName, setWorkoutName] = useState("")
  const [saving, setSaving] = useState(false)
  const [startTime] = useState(() => Date.now())
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
    try {
      const supabase = createClient()
      const { data: w } = await supabase.from("workouts").insert({ user_id: user.id, name: workoutName || "Workout", started_at: new Date(startTime).toISOString(), completed_at: new Date().toISOString() }).select().single()
      if (!w) return
      for (const [idx, eid] of selected.entries()) {
        const { data: we } = await supabase.from("workout_exercises").insert({ workout_id: w.id, exercise_id: eid, sort_order: idx }).select().single()
        if (!we) continue
        const es = sets[eid] || []
        await supabase.from("exercise_sets").insert(es.map((s, i) => ({ workout_exercise_id: we.id, set_number: i + 1, reps: s.reps, weight_kg: s.weight, completed: s.completed })))
      }
      router.push(`/workouts/${w.id}`)
    } catch {
      // silently fail — user can retry
    } finally {
      setSaving(false)
    }
  }

  const cats = [...new Set(exercises.map(e => e.category))]
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2, "0")}`

  return (
    <DetailShell
      crumb="Log Workout"
      trailing={
        <span className="k-row-sub" style={{ fontSize: 14 }}>
          <Clock size={14} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />{fmt(elapsed)}
        </span>
      }
    >
      <div className="k-section">
        <PageTitle title="New Workout" />
        <input value={workoutName} onChange={e => setWorkoutName(e.target.value)} placeholder="Workout name" className="input-field" style={{ maxWidth: 320, marginTop: 16 }} />
      </div>

      <div className="new-workout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {selected.map(eid => {
            const ex = exercises.find(e => e.id === eid)
            const ess = sets[eid] || []
            return (
              <Card key={eid} elevated>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 className="k-title">{ex?.name}</h3>
                  <button type="button" onClick={() => removeEx(eid)} aria-label="Remove exercise" style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 4, display: "flex" }}><Trash2 size={14} /></button>
                </div>
                <div className="stagger">
                  {ess.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span className="k-eyebrow" style={{ width: 20, textAlign: "center" }}>{i + 1}</span>
                      <input type="number" inputMode="decimal" placeholder="kg" value={s.weight || ""} onChange={e => update(eid, i, "weight", Number(e.target.value))} className="input-field" style={{ width: 80, padding: "6px 10px", fontSize: 13 }} />
                      <span className="k-row-sub">kg ×</span>
                      <input type="number" inputMode="numeric" placeholder="reps" value={s.reps || ""} onChange={e => update(eid, i, "reps", Number(e.target.value))} className="input-field" style={{ width: 64, padding: "6px 10px", fontSize: 13 }} />
                      <button type="button" onClick={() => toggle(eid, i)} aria-label="Toggle set complete" style={{ background: "none", border: "none", color: s.completed ? "var(--accent)" : "var(--text-secondary)", cursor: "pointer", padding: 4, display: "flex" }}>
                        <Check size={16} />
                      </button>
                      <button type="button" onClick={() => removeSet(eid, i)} aria-label="Remove set" style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 4, display: "flex" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addSet(eid)} className="k-eyebrow" style={{ background: "none", border: "1px dashed var(--border)", padding: "10px 0", width: "100%", cursor: "pointer", marginTop: 8 }}>
                    <Plus size={12} style={{ display: "inline", marginRight: 4 }} /> Add set
                  </button>
                </div>
              </Card>
            )
          })}
          {selected.length > 0 && (
            <button type="button" onClick={save} disabled={saving} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "16px 0", marginTop: 8 }}>
              <Save size={16} /> {saving ? "SAVING..." : "COMPLETE WORKOUT"}
            </button>
          )}
        </div>

        <Card style={{ position: "sticky", top: 72 }}>
          <h3 className="k-title" style={{ marginBottom: 16 }}>Exercises</h3>
          {cats.map(cat => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <p className="label-sm">{cat}</p>
              {exercises.filter(e => e.category === cat).map(ex => {
                const added = selected.includes(ex.id)
                return (
                  <button key={ex.id} type="button" onClick={() => addEx(ex.id)} disabled={added}
                    style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 500, color: added ? "var(--text-secondary)" : "var(--fg)", background: "none", border: "none", cursor: added ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6, padding: "6px 0", width: "100%", textAlign: "left", opacity: added ? 0.4 : 1 }}>
                    <Plus size={12} style={{ color: added ? "var(--text-secondary)" : "var(--accent)", flexShrink: 0 }} /> {ex.name}
                  </button>
                )
              })}
            </div>
          ))}
        </Card>
      </div>
    </DetailShell>
  )
}
