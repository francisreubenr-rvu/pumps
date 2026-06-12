'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [mounted, setMounted] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('exercises').select('*').order('category')
    setExercises(data ?? [])
  }
  useEffect(() => { load(); setMounted(true) }, [])

  async function add() {
    if (!name || !category) return
    const supabase = createClient()
    await supabase.from('exercises').insert({ name, category })
    setName(''); setCategory(''); load()
  }

  const cats = [...new Set(exercises.map(e => e.category))]

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-5xl mx-auto relative">
      <div style={{ animation: mounted ? 'chalkReveal 0.4s var(--ease-quart) both' : 'none' }}>
        <h1 className="text-4xl font-black tracking-tighter mb-1" style={{ fontFamily: 'var(--font-heading-stack)' }}>EXERCISE LIBRARY</h1>
        <p className="label-sm mb-8">BROWSE & CREATE</p>
      </div>

      {/* Add form */}
      <div className="flex flex-wrap gap-3 mb-10 items-end">
        <div>
          <label className="label-sm">NAME</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bulgarian Split Squat"
            className="input-field w-56" />
        </div>
        <div>
          <label className="label-sm">CATEGORY</label>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. legs"
            className="input-field w-36" />
        </div>
        <button onClick={add} className="btn-primary">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {cats.map(cat => (
        <div key={cat} className="mb-8">
          <h2 className="text-lg font-bold tracking-tighter capitalize mb-3" style={{ fontFamily: 'var(--font-heading-stack)' }}>{cat}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 stagger">
            {exercises.filter(e => e.category === cat).map(ex => (
              <div key={ex.id} className="card-glow p-4">
                <p className="text-sm font-medium">{ex.name}</p>
                <p className="text-[10px] tracking-wider uppercase mt-1 capitalize" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>{ex.category}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {exercises.length === 0 && <p className="text-sm py-12 text-center" style={{ color: 'var(--muted)' }}>No exercises yet. Add one above.</p>}
    </div>
  )
}
