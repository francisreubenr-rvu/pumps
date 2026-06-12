'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CalendarDays, Dumbbell, TrendingUp } from 'lucide-react'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<any>(null)
  const [workoutCount, setWorkoutCount] = useState(0)
  const [volume, setVolume] = useState(0)
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    if (!username) return
    const supabase = createClient()
    supabase.from('profiles').select('*').eq('username', username).single().then(({ data }) => {
      if (!data) return; setProfile(data)
      supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', data.id).then(({ count }) => setWorkoutCount(count ?? 0))
      supabase.from('exercise_sets').select('reps, weight_kg, workout_exercises!inner(workout_id, workouts!inner(user_id))')
        .eq('workout_exercises.workouts.user_id', data.id).eq('completed', true)
        .then(({ data: sets }) => setVolume((sets ?? []).reduce((s: number, r: any) => s + r.reps * (r.weight_kg ?? 0), 0)))
      supabase.from('workouts').select('*').eq('user_id', data.id).order('started_at', { ascending: false }).limit(5)
        .then(({ data }) => setRecent(data ?? []))
    })
  }, [username])

  if (!profile) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm" style={{ color: 'var(--muted)' }}>Profile not found</p></div>

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-4xl mx-auto relative">
      <div className="card-sheet p-6 mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-black tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)', background: 'var(--primary)', color: 'var(--bg)' }}>
          {profile.username?.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>{profile.username}</h1>
          <p className="text-xs tracking-wider uppercase mt-1" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
            Joined {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'WORKOUTS', value: workoutCount, icon: Dumbbell },
          { label: 'VOLUME', value: `${volume.toLocaleString()} kg`, icon: TrendingUp },
          { label: 'SINCE', value: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: CalendarDays },
        ].map(s => (
          <div key={s.label} className="card-chalk p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1"><s.icon className="h-3 w-3" style={{ color: 'var(--primary)' }} /><span className="label-sm mb-0">{s.label}</span></div>
            <p className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-mono-stack)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card-sheet">
        <h3 className="p-4 border-b text-base font-bold tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)', borderColor: 'var(--border)' }}>RECENT WORKOUTS</h3>
        <div className="p-4">
          {recent.length > 0 ? recent.map(w => (
            <div key={w.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="text-sm font-medium">{w.name}</p>
                <p className="text-[10px] tracking-wider uppercase mt-0.5" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
                  {new Date(w.started_at).toLocaleDateString()}
                </p>
              </div>
              <span className="badge-chalk" style={{ background: w.completed_at ? 'var(--success-dim)' : 'var(--warning)', color: 'var(--bg)' }}>
                {w.completed_at ? 'DONE' : 'ACTIVE'}
              </span>
            </div>
          )) : <p className="text-xs py-8 text-center" style={{ color: 'var(--muted)' }}>No workouts yet</p>}
        </div>
      </div>
    </div>
  )
}
