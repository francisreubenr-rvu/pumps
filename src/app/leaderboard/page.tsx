'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Crown, Medal } from 'lucide-react'

export default function LeaderboardPage() {
  const [tab, setTab] = useState('max-weight')
  const [maxWeight, setMaxWeight] = useState<any[]>([])
  const [totalVolume, setTotalVolume] = useState<any[]>([])
  const [perExercise, setPerExercise] = useState<Record<string, any[]>>({})
  const [exercises, setExercises] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('exercises').select('*').order('category').then(({ data }) => setExercises(data ?? []))
    supabase.from('exercise_sets').select(`
      weight_kg, reps, workout_exercises!inner(exercise_id, exercises!inner(name), workouts!inner(user_id))
    `).eq('completed', true).then(({ data }) => {
      supabase.from('profiles').select('id, username').then(({ data: profiles }) => {
        const pm = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]))
        const ub: Record<string, any> = {}; const uv: Record<string, any> = {}; const eb: Record<string, Record<string, any>> = {}
        ;(data ?? []).forEach((s: any) => {
          const uid = s.workout_exercises.workouts.user_id
          const prof = pm[uid]; if (!prof) return
          const w = Number(s.weight_kg ?? 0)
          const eid = s.workout_exercises.exercise_id
          const ename = s.workout_exercises.exercises.name
          if (w > (ub[uid]?.weight ?? 0)) ub[uid] = { weight: w, username: prof.username, exercise: ename }
          uv[uid] = { volume: (uv[uid]?.volume ?? 0) + s.reps * w, username: prof.username }
          if (!eb[eid]) eb[eid] = {}
          if (w > (eb[eid][uid]?.weight ?? 0)) eb[eid][uid] = { weight: w, username: prof.username }
        })
        setMaxWeight(Object.values(ub).sort((a: any, b: any) => b.weight - a.weight).map((e: any, i: number) => ({ rank: i + 1, ...e })))
        setTotalVolume(Object.values(uv).sort((a: any, b: any) => b.volume - a.volume).map((e: any, i: number) => ({ rank: i + 1, ...e })))
        const pe: Record<string, any[]> = {}
        Object.entries(eb).forEach(([eid, users]) => {
          pe[eid] = Object.values(users).sort((a: any, b: any) => b.weight - a.weight).map((e: any, i: number) => ({ rank: i + 1, ...e }))
        })
        setPerExercise(pe); setLoading(false); setMounted(true)
      })
    })
  }, [])

  const cats = [...new Set(exercises.map(e => e.category))]
  const tabs = [{ key: 'max-weight', label: 'MAX WEIGHT' }, { key: 'volume', label: 'TOTAL VOLUME' }, ...cats.map(c => ({ key: `cat-${c}`, label: c.toUpperCase() }))]

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-5xl mx-auto relative">
      <div style={{ animation: mounted ? 'chalkReveal 0.4s var(--ease-quart) both' : 'none' }}>
        <h1 className="text-4xl font-black tracking-tighter mb-1" style={{ fontFamily: 'var(--font-heading-stack)' }}>LEADERBOARDS</h1>
        <p className="label-sm mb-6">WHO DOMINATES THE GYM</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded text-xs tracking-wider uppercase font-medium transition-all"
            style={{ fontFamily: 'var(--font-mono-stack)', background: tab === t.key ? 'var(--primary)' : 'var(--surface1)', color: tab === t.key ? 'var(--bg)' : 'var(--muted)', border: `1px solid ${tab === t.key ? 'var(--primary)' : 'var(--border)'}` }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm py-12 text-center" style={{ color: 'var(--muted)' }}>…</p> : (
        <>
          {tab === 'max-weight' && <LBTable data={maxWeight} valueKey="weight" unit="kg" showExercise />}
          {tab === 'volume' && <LBTable data={totalVolume} valueKey="volume" unit="kg" />}
          {cats.map(c => tab === `cat-${c}` && (
            <div key={c} className="space-y-4 stagger">
              {exercises.filter(e => e.category === c).map(ex => (
                <div key={ex.id} className="card-sheet">
                  <h3 className="text-base font-bold tracking-tighter p-4 border-b" style={{ fontFamily: 'var(--font-heading-stack)', borderColor: 'var(--border)' }}>{ex.name}</h3>
                  <div className="p-4"><LBTable data={(perExercise[ex.id] || []).slice(0, 20)} valueKey="weight" unit="kg" compact /></div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {!loading && maxWeight.length === 0 && <p className="text-sm py-12 text-center" style={{ color: 'var(--muted)' }}>No data yet. Log some workouts.</p>}
    </div>
  )
}

function LBTable({ data, valueKey, unit, showExercise, compact }: any) {
  if (!data || data.length === 0) return <p className="text-xs py-8 text-center" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>No rankings yet</p>

  return (
    <table className="w-full text-sm">
      <thead>
        <tr style={{ color: 'var(--muted)' }}>
          <th className="text-left pb-3 w-12 text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--font-mono-stack)' }}>#</th>
          <th className="text-left pb-3 text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--font-mono-stack)' }}>ATHLETE</th>
          {!compact && showExercise && <th className="text-left pb-3 text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--font-mono-stack)' }}>EXERCISE</th>}
          <th className="text-right pb-3 text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--font-mono-stack)' }}>BEST</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e: any) => (
          <tr key={e.rank} className="border-t hover:opacity-70 transition-opacity" style={{ borderColor: 'var(--border)' }}>
            <td className="py-3">
              {e.rank === 1 ? <Crown className="h-4 w-4" /> :
               e.rank === 2 ? <Medal className="h-4 w-4" style={{ color: 'var(--muted)' }} /> :
               e.rank === 3 ? <Medal className="h-4 w-4" style={{ color: 'var(--secondary)' }} /> :
               <span style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>{e.rank}</span>}
            </td>
            <td className="py-3 font-semibold">{e.username}</td>
            {!compact && showExercise && <td className="py-3" style={{ color: 'var(--muted)' }}>{e.exercise}</td>}
            <td className="py-3 text-right">
              <span className="badge-chalk" style={{ background: 'var(--primary)', color: 'var(--bg)' }}>
                {Math.round(e[valueKey]).toLocaleString()} {unit}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
