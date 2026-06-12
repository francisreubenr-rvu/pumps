'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Dumbbell, TrendingUp } from 'lucide-react'

export default function ProgressPage() {
  const [exercises, setExercises] = useState<string[]>([])
  const [selected, setSelected] = useState('')
  const [maxWeight, setMaxWeight] = useState<any[]>([])
  const [volume, setVolume] = useState<any[]>([])
  const [tab, setTab] = useState<'weight' | 'volume'>('weight')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from('exercise_sets').select(`
        reps, weight_kg, created_at, workout_exercises!inner(exercises!inner(name), workouts!inner(started_at))
      `).eq('completed', true).eq('workout_exercises.workouts.user_id', data.user.id)
        .order('created_at', { ascending: true }).then(({ data }) => {
          const uniq = [...new Set((data ?? []).map((d: any) => d.workout_exercises.exercises.name))] as string[]
          setExercises(uniq)
          if (uniq.length > 0) setSelected(uniq[0])

          const all: any[] = (data ?? []).map((r: any) => ({
            date: new Date(r.workout_exercises.workouts.started_at).toLocaleDateString(),
            weight_kg: r.weight_kg ?? 0, reps: r.reps,
            volume: r.reps * (r.weight_kg ?? 0),
            exercise: r.workout_exercises.exercises.name,
          }))

          const mwd: any[] = []; const seen: Record<string, number> = {}
          all.forEach((d: any) => {
            const k = `${d.date}|${d.exercise}`
            if (!seen[k] || d.weight_kg > seen[k]) { seen[k] = d.weight_kg; mwd.push(d) }
          })
          setMaxWeight(mwd.sort((a: any, b: any) => a.date.localeCompare(b.date)))

          const vw: Record<string, number> = {}
          all.forEach((d: any) => {
            const dt = new Date(d.date.replace(/\//g, '-'))
            dt.setDate(dt.getDate() - dt.getDay())
            vw[dt.toLocaleDateString()] = (vw[dt.toLocaleDateString()] || 0) + d.volume
          })
          setVolume(Object.entries(vw).map(([p, v]) => ({ period: p, volume: Math.round(v) })).sort((a, b) => a.period.localeCompare(b.period)))
          setMounted(true)
        })
    })
  }, [])

  const filtered = maxWeight.filter((d: any) => d.exercise === selected)

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-5xl mx-auto relative">
      <div style={{ animation: mounted ? 'chalkReveal 0.4s var(--ease-quart) both' : 'none' }}>
        <h1 className="text-4xl font-black tracking-tighter mb-1" style={{ fontFamily: 'var(--font-heading-stack)' }}>PROGRESS</h1>
        <p className="label-sm mb-6">STRENGTH OVER TIME</p>
      </div>

      <div className="flex gap-2 mb-8">
        {[
          { key: 'weight' as const, label: 'MAX WEIGHT', icon: Dumbbell },
          { key: 'volume' as const, label: 'WEEKLY VOLUME', icon: TrendingUp },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded text-xs tracking-wider uppercase font-medium transition-all"
            style={{ fontFamily: 'var(--font-mono-stack)', background: tab === t.key ? 'var(--primary)' : 'var(--surface1)', color: tab === t.key ? 'var(--bg)' : 'var(--muted)', border: `1px solid ${tab === t.key ? 'var(--primary)' : 'var(--border)'}` }}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'weight' && (
        <div className="card-sheet p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>MAX WEIGHT</h3>
            <select value={selected} onChange={e => setSelected(e.target.value)}
              className="text-xs px-3 py-1.5 rounded border outline-none"
              style={{ fontFamily: 'var(--font-mono-stack)', background: 'var(--surface1)', color: 'var(--fg)', borderColor: 'var(--border)' }}>
              {exercises.map(ex => <option key={ex}>{ex}</option>)}
            </select>
          </div>
          {filtered.length > 0 ? (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filtered}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted)" fontSize={10} />
                  <YAxis stroke="var(--muted)" fontSize={10} />
                  <Tooltip contentStyle={{ background: 'var(--surface0)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono-stack)' }} />
                  <Line type="monotone" dataKey="weight_kg" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-xs py-8 text-center" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>No data for {selected}</p>}
        </div>
      )}

      {tab === 'volume' && (
        <div className="card-sheet p-5">
          <h3 className="text-base font-bold tracking-tighter mb-4" style={{ fontFamily: 'var(--font-heading-stack)' }}>WEEKLY VOLUME</h3>
          {volume.length > 0 ? (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="period" stroke="var(--muted)" fontSize={10} />
                  <YAxis stroke="var(--muted)" fontSize={10} />
                  <Tooltip contentStyle={{ background: 'var(--surface0)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono-stack)' }} />
                  <Bar dataKey="volume" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-xs py-8 text-center" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>Log workouts to see volume charts</p>}
        </div>
      )}
    </div>
  )
}
