'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [workout, setWorkout] = useState<any>(null)
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    supabase.from('workouts').select('*').eq('id', id).single().then(({ data }) => {
      setWorkout(data); setLoading(false)
    })
    supabase.from('workout_exercises').select('*, exercises(name, category)').eq('workout_id', id).order('sort_order')
      .then(async ({ data }) => {
        if (!data) return
        const supabase2 = createClient()
        const withSets = await Promise.all(data.map(async (we: any) => {
          const { data: sets } = await supabase2.from('exercise_sets').select('*').eq('workout_exercise_id', we.id).order('set_number')
          return { ...we, sets: sets || [] }
        }))
        setExercises(withSets)
      })
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono-stack)' }}>…loading</p></div>
  if (!workout) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm" style={{ color: 'var(--muted)' }}>Workout not found</p></div>

  const totalVolume = exercises.reduce((sum, we) => sum + we.sets.reduce((s: number, set: any) => s + (set.reps * (set.weight_kg ?? 0)), 0), 0)

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-3xl mx-auto relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/workouts" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--muted)' }}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-4xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>{workout.name}</h1>
          <p className="text-xs tracking-wider uppercase mt-1" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
            {new Date(workout.started_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
        <span className="ml-auto badge-chalk" style={{ background: workout.completed_at ? 'var(--success-dim)' : 'var(--warning)', color: 'var(--bg)' }}>
          {workout.completed_at ? 'COMPLETED' : 'ACTIVE'}
        </span>
      </div>

      {/* Total volume */}
      <div className="card-chalk p-5 mb-8 flex items-center justify-between">
        <span className="label-sm mb-0">TOTAL VOLUME</span>
        <p className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-mono-stack)' }}>
          {totalVolume.toLocaleString()} <span className="text-base" style={{ color: 'var(--muted)' }}>kg</span>
        </p>
      </div>

      {/* Exercise tables */}
      <div className="space-y-4 stagger">
        {exercises.map(we => (
          <div key={we.id} className="card-sheet">
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base font-bold tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>
                {we.exercises?.name}
                <span className="ml-2 text-[10px] tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
                  {we.exercises?.category}
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--muted)' }}>
                    <th className="text-left p-3 pb-2 text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--font-mono-stack)' }}>Set</th>
                    <th className="text-left p-3 pb-2 text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--font-mono-stack)' }}>Weight</th>
                    <th className="text-left p-3 pb-2 text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--font-mono-stack)' }}>Reps</th>
                    <th className="text-right p-3 pb-2 text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--font-mono-stack)' }}>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {we.sets.map((s: any) => (
                    <tr key={s.id} className="border-t hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-3" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>{s.set_number}</td>
                      <td className="p-3 font-medium">{s.weight_kg ?? 0} kg</td>
                      <td className="p-3 font-medium">{s.reps}</td>
                      <td className="p-3 text-right" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--primary)' }}>
                        {(s.reps * (s.weight_kg ?? 0)).toLocaleString()} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
