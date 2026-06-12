'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Swords } from 'lucide-react'

export default function NewCompetitionPage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<any[]>([])
  const [name, setName] = useState('')
  const [exerciseId, setExerciseId] = useState('')
  const [type, setType] = useState('max_weight')

  useEffect(() => {
    createClient().from('exercises').select('*').order('name').then(({ data }) => setExercises(data ?? []))
  }, [])

  async function create() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !name || !exerciseId) return
    const { data: c } = await supabase.from('competitions').insert({
      name, exercise_id: exerciseId, type, status: 'waiting', created_by: user.id,
    }).select().single()
    if (c) {
      await supabase.from('competition_participants').insert({ competition_id: c.id, user_id: user.id })
      router.push(`/competitions/${c.id}`)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-lg mx-auto relative">
      <h1 className="text-4xl font-black tracking-tighter mb-1" style={{ fontFamily: 'var(--font-heading-stack)' }}>NEW COMPETITION</h1>
      <p className="label-sm mb-6">CHALLENGE FRIENDS</p>

      <div className="card-sheet p-5 space-y-4">
        <div>
          <label className="label-sm">NAME</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bench Press Showdown" className="input-field" />
        </div>
        <div>
          <label className="label-sm">EXERCISE</label>
          <select value={exerciseId} onChange={e => setExerciseId(e.target.value)}
            className="input-field">
            <option value="">Select exercise</option>
            {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label-sm">TYPE</label>
          <select value={type} onChange={e => setType(e.target.value)} className="input-field">
            <option value="max_weight">Max Weight</option>
            <option value="max_reps">Max Reps</option>
            <option value="total_volume">Total Volume</option>
          </select>
        </div>
        <button onClick={create} disabled={!name || !exerciseId} className="btn-primary w-full py-3">
          <Swords className="h-4 w-4" /> Create Competition
        </button>
      </div>
    </div>
  )
}
