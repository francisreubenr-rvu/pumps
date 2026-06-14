"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useCreateWorkout } from "@/lib/queries/mutations"
import { Plus, Trash2, Save, Clock, Check, RotateCcw } from "lucide-react"
import { DetailShell, Card, PageTitle } from "@/components/ui/kinetic"

// Local draft so an in-progress workout survives a refresh, crash, or accidental
// navigation — you never lose a logged session. One draft at a time (per device).
const DRAFT_KEY = "kinetic_workout_draft"
type WorkoutDraft = {
  workoutName: string
  selected: string[]
  sets: Record<string, { reps: number; weight: number; completed: boolean }[]>
  startTime: number
}

export default function NewWorkoutPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const createWorkout = useCreateWorkout(user?.id)
  const [exercises, setExercises] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [sets, setSets] = useState<Record<string, { reps: number; weight: number; completed: boolean }[]>>({})
  const [workoutName, setWorkoutName] = useState("")
  const [saving, setSaving] = useState(false)
  const [startTime, setStartTime] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  // `hydrated` gates the persist effect until the restore effect has run, so we
  // never overwrite a saved draft with the empty initial state.
  const [hydrated, setHydrated] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => { if (!data.user) router.replace("/auth/login"); else setUser(data.user) })
    supabase.from("exercises").select("*").order("category").then(({ data }) => setExercises(data ?? []))
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(t)
  }, [router, startTime])

  // Restore a saved draft once, after mount (localStorage is client-only —
  // reading it during render would diverge from the server HTML / hydration).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const d = JSON.parse(raw) as WorkoutDraft
        if (d?.selected?.length || d?.workoutName) {
          setWorkoutName(d.workoutName ?? "")
          setSelected(d.selected ?? [])
          setSets(d.sets ?? {})
          if (typeof d.startTime === "number") setStartTime(d.startTime)
          setDraftRestored(true)
        }
      }
    } catch { /* corrupt draft — ignore */ }
    setHydrated(true)
  }, [])

  // Persist the draft whenever it changes (after hydration).
  useEffect(() => {
    if (!hydrated) return
    const hasContent = selected.length > 0 || workoutName.trim() !== ""
    try {
      if (hasContent) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ workoutName, selected, sets, startTime }))
      } else {
        localStorage.removeItem(DRAFT_KEY)
      }
    } catch { /* storage full / unavailable — non-fatal */ }
  }, [hydrated, workoutName, selected, sets, startTime])

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
  }

  function discardDraft() {
    clearDraft()
    setWorkoutName("")
    setSelected([])
    setSets({})
    setStartTime(Date.now())
    setDraftRestored(false)
  }

  function addEx(id: string) { if (selected.includes(id)) return; setSelected([...selected, id]); setSets({ ...sets, [id]: [] }) }
  function removeEx(id: string) { setSelected(selected.filter(x => x !== id)); const ns = { ...sets }; delete ns[id]; setSets(ns) }
  function addSet(eid: string) { const cur = sets[eid] || []; setSets({ ...sets, [eid]: [...cur, { reps: 0, weight: 0, completed: false }] }) }
  function update(eid: string, i: number, f: "reps"|"weight", v: number) { const cur = [...(sets[eid]||[])]; cur[i] = { ...cur[i], [f]: v }; setSets({ ...sets, [eid]: cur }) }
  function toggle(eid: string, i: number) { const cur = [...(sets[eid]||[])]; cur[i] = { ...cur[i], completed: !cur[i].completed }; setSets({ ...sets, [eid]: cur }) }
  function removeSet(eid: string, i: number) { const cur = [...(sets[eid]||[])]; cur.splice(i, 1); setSets({ ...sets, [eid]: cur }) }

  async function save() {
    if (!user) return

    // Drop exercises that have no sets — they'd persist as hollow workout_exercises.
    const toSave = selected.filter(eid => (sets[eid]?.length ?? 0) > 0)
    if (toSave.length === 0) return

    setSaving(true)
    try {
      // The create mutation owns the inserts, audit event, and cache
      // invalidation — and queues the save if the device is offline.
      const res = await createWorkout.mutateAsync({
        name: workoutName,
        startedAt: new Date(startTime).toISOString(),
        exercises: toSave.map(eid => ({
          exerciseId: eid,
          sets: (sets[eid] || []).map(s => ({ reps: s.reps, weight: s.weight })),
        })),
      })
      clearDraft() // committed (or safely queued) — the draft is no longer needed
      // Offline: no server id yet — go to the list (the queued workout appears
      // once it syncs; the SyncManager badge shows it's pending).
      router.push(res.queued ? "/workouts" : `/workouts/${res.id}`)
    } catch (err) {
      console.error("Save workout failed:", err)
    } finally {
      setSaving(false)
    }
  }

  const cats = [...new Set(exercises.map(e => e.category))]
  const hasLoggedSets = selected.some(eid => (sets[eid]?.length ?? 0) > 0)
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
        {draftRestored && (
          <div className="card-surface" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", marginTop: 16, flexWrap: "wrap" }}>
            <span className="k-row-sub" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <RotateCcw size={13} style={{ color: "var(--accent)" }} aria-hidden="true" /> Resumed your in-progress workout.
            </span>
            <button type="button" onClick={discardDraft} className="k-eyebrow" style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
              Discard
            </button>
          </div>
        )}
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
            <button type="button" onClick={save} disabled={saving || !hasLoggedSets} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "16px 0", marginTop: 8, opacity: hasLoggedSets ? 1 : 0.5 }}>
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
