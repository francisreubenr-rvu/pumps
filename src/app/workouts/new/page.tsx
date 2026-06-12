'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Check, Trash2, Save, Clock } from 'lucide-react'

export default function NewWorkoutPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const [exercises, setExercises] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [sets, setSets] = useState<Record<string, { reps: number; weight: number; completed: boolean }[]>>({})
  const [workoutName, setWorkoutName] = useState('')
  const [saving, setSaving] = useState(false)
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/auth/login'); else setUser(data.user)
    })
    supabase.from('exercises').select('*').order('category').then(({ data }) => setExercises(data ?? []))
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(t)
  }, [])

  function addEx(id: string) {
    if (selected.includes(id)) return
    setSelected([...selected, id]); setSets({ ...sets, [id]: [] })
  }
  function removeEx(id: string) {
    setSelected(selected.filter(x => x !== id))
    const ns = { ...sets }; delete ns[id]; setSets(ns)
  }
  function addSet(eid: string) {
    const cur = sets[eid] || []
    setSets({ ...sets, [eid]: [...cur, { reps: 0, weight: 0, completed: false }] })
  }
  function updateSet(eid: string, i: number, f: 'reps'|'weight', v: number) {
    const cur = [...(sets[eid] || [])]
    cur[i] = { ...cur[i], [f]: v }; setSets({ ...sets, [eid]: cur })
  }
  function toggleSet(eid: string, i: number) {
    const cur = [...(sets[eid] || [])]
    cur[i] = { ...cur[i], completed: !cur[i].completed }; setSets({ ...sets, [eid]: cur })
  }
  function removeSet(eid: string, i: number) {
    const cur = [...(sets[eid] || [])]; cur.splice(i, 1); setSets({ ...sets, [eid]: cur })
  }

  async function save() {
    if (!user) return; setSaving(true)
    const supabase = createClient()
    const { data: w } = await supabase.from('workouts').insert({
      user_id: user.id, name: workoutName || 'Workout',
      started_at: new Date(startTime).toISOString(), completed_at: new Date().toISOString(),
    }).select().single()
    if (!w) { setSaving(false); return }

    for (const [idx, eid] of selected.entries()) {
      const { data: we } = await supabase.from('workout_exercises').insert({
        workout_id: w.id, exercise_id: eid, sort_order: idx,
      }).select().single()
      if (!we) continue
      const es = sets[eid] || []
      await supabase.from('exercise_sets').insert(es.map((s, i) => ({
        workout_exercise_id: we.id, set_number: i + 1, reps: s.reps, weight_kg: s.weight, completed: s.completed,
      })))
    }
    setSaving(false); router.push(`/workouts/${w.id}`)
  }

  const cats = [...new Set(exercises.map(e => e.category))]
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 relative">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>NEW WORKOUT</h1>
          <span className="flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--primary)' }}>
            <Clock className="h-4 w-4" /> {fmt(elapsed)}
          </span>
        </div>
        <input value={workoutName} onChange={e => setWorkoutName(e.target.value)} placeholder="Workout name"
          className="input-field max-w-xs" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise panels */}
        <div className="lg:col-span-2 space-y-4">
          {selected.map(eid => {
            const ex = exercises.find(e => e.id === eid)
            const ess = sets[eid] || []
            return (
              <div key={eid} className="card-sheet">
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-base font-bold tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>{ex?.name}</h3>
                  <button onClick={() => removeEx(eid)} className="hover:opacity-60 transition-opacity" style={{ color: 'var(--danger)' }}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 space-y-2 stagger">
                  {ess.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>{i + 1}</span>
                      <input type="number" placeholder="kg" value={s.weight || ''}
                        onChange={e => updateSet(eid, i, 'weight', Number(e.target.value))}
                        className="w-24 input-field py-1.5 text-sm" />
                      <span className="text-[10px] tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>kg ×</span>
                      <input type="number" placeholder="reps" value={s.reps || ''}
                        onChange={e => updateSet(eid, i, 'reps', Number(e.target.value))}
                        className="w-20 input-field py-1.5 text-sm" />
                      <button onClick={() => toggleSet(eid, i)} className="p-1 rounded transition-colors"
                        style={{ color: s.completed ? 'var(--success)' : 'var(--muted)' }}>
                        <Check className="h-5 w-5" />
                      </button>
                      <button onClick={() => removeSet(eid, i)} className="p-1 rounded transition-colors hover:opacity-60"
                        style={{ color: 'var(--muted)' }}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addSet(eid)}
                    className="w-full py-2 border border-dashed rounded text-xs tracking-wider uppercase hover:opacity-70 transition-opacity"
                    style={{ fontFamily: 'var(--font-mono-stack)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
                    <Plus className="inline h-3 w-3 mr-1" /> Add Set
                  </button>
                </div>
              </div>
            )
          })}
          {selected.length > 0 && (
            <button onClick={save} disabled={saving} className="btn-primary w-full py-4 text-base">
              <Save className="h-5 w-5" /> {saving ? 'Saving...' : 'Complete Workout'}
            </button>
          )}
        </div>

        {/* Exercise picker */}
        <div className="card-sheet p-4 h-fit">
          <h3 className="text-base font-bold tracking-tighter mb-4" style={{ fontFamily: 'var(--font-heading-stack)' }}>EXERCISES</h3>
          {cats.map(cat => (
            <div key={cat} className="mb-4">
              <p className="label-sm mb-1">{cat}</p>
              {exercises.filter(e => e.category === cat).map(ex => {
                const added = selected.includes(ex.id)
                return (
                  <button key={ex.id} onClick={() => addEx(ex.id)} disabled={added}
                    className="w-full text-left px-3 py-1.5 text-sm rounded transition-colors mb-0.5 flex items-center gap-2"
                    style={{ color: added ? 'var(--muted)' : 'var(--fg)', opacity: added ? 0.5 : 1 }}>
                    <Plus className="h-3 w-3" style={{ color: added ? 'var(--muted)' : 'var(--primary)' }} />
                    {ex.name}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
