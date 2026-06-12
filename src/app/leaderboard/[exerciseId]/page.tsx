'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Crown, Medal } from 'lucide-react'

export default function ExerciseLeaderboardPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const [exercise, setExercise] = useState<any>(null)
  const [ranked, setRanked] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!exerciseId) return
    const supabase = createClient()
    supabase.from('exercises').select('*').eq('id', exerciseId).single().then(({ data }) => setExercise(data))
    supabase.from('exercise_sets').select(`
      weight_kg, reps, workout_exercises!inner(exercise_id, exercises!inner(name), workouts!inner(user_id))
    `).eq('completed', true).eq('workout_exercises.exercise_id', exerciseId).then(({ data }) => {
      supabase.from('profiles').select('id, username').then(({ data: profiles }) => {
        const pm = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]))
        const best: Record<string, any> = {}
        ;(data ?? []).forEach((s: any) => {
          const uid = s.workout_exercises.workouts.user_id
          const prof = pm[uid]; if (!prof) return
          const w = Number(s.weight_kg ?? 0)
          if (w > (best[uid]?.weight ?? 0)) best[uid] = { weight: w, username: prof.username }
        })
        setRanked(Object.values(best).sort((a: any, b: any) => b.weight - a.weight).map((e: any, i: number) => ({ rank: i + 1, ...e })))
        setLoading(false)
      })
    })
  }, [exerciseId])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm" style={{ color: 'var(--muted)' }}>…</p></div>

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-3xl mx-auto relative">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/leaderboard" className="hover:opacity-70" style={{ color: 'var(--muted)' }}><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-4xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>{exercise?.name ?? 'Exercise'}</h1>
          <p className="text-xs tracking-wider uppercase mt-1" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>{exercise?.category}</p>
        </div>
      </div>

      {ranked.length > 0 ? (
        <div className="card-sheet">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--muted)' }}>
                <th className="text-left p-4 pb-2 text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--font-mono-stack)' }}>#</th>
                <th className="text-left p-4 pb-2 text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--font-mono-stack)' }}>ATHLETE</th>
                <th className="text-right p-4 pb-2 text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--font-mono-stack)' }}>BEST</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map(e => (
                <tr key={e.rank} className="border-t hover:opacity-70 transition-opacity" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4">
                    {e.rank === 1 ? <Crown className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} /> :
                     e.rank === 2 ? <Medal className="h-4 w-4" style={{ color: 'var(--muted)' }} /> :
                     e.rank === 3 ? <Medal className="h-4 w-4" style={{ color: 'var(--secondary)' }} /> :
                     <span style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>{e.rank}</span>}
                  </td>
                  <td className="p-4 font-semibold">{e.username}</td>
                  <td className="p-4 text-right">
                    <span className="badge-chalk" style={{ background: 'var(--primary)', color: 'var(--bg)' }}>
                      {Math.round(e.weight).toLocaleString()} kg
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="text-sm py-12 text-center" style={{ color: 'var(--muted)' }}>No lifts logged for this exercise yet</p>}
    </div>
  )
}
