'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Dumbbell, TrendingUp, Swords, Plus, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [workoutCount, setWorkoutCount] = useState(0)
  const [volume, setVolume] = useState(0)
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [activeComps, setActiveComps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/auth/login'); return }
      setUser(data.user)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
    supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).then(({ count }) => setWorkoutCount(count ?? 0))
    supabase.from('exercise_sets')
      .select('reps, weight_kg, workout_exercises!inner(workout_id, workouts!inner(user_id))')
      .eq('workout_exercises.workouts.user_id', user.id).eq('completed', true)
      .then(({ data }) => setVolume(data?.reduce((s: number, r: any) => s + (r.reps * (r.weight_kg ?? 0)), 0) ?? 0))
    supabase.from('workouts').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(5)
      .then(({ data }) => { setRecentWorkouts(data ?? []); setLoading(false) })
    supabase.from('competitions').select('*, exercises(name)').eq('status', 'active').limit(5)
      .then(({ data }) => setActiveComps(data ?? []))
  }, [user])

  useEffect(() => { setMounted(true) }, [])

  const username = profile?.username || user?.email?.split('@')[0] || 'Athlete'

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10" style={{ animation: mounted ? 'chalkReveal 0.4s var(--ease-quart) both' : 'none' }}>
        <div>
          <p className="label-sm">WELCOME BACK</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>
            {username}
          </h1>
        </div>
        <Link href="/workouts/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Start Workout
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 stagger">
        {[
          { label: 'WORKOUTS', value: workoutCount, unit: '', icon: Dumbbell, color: 'var(--primary)' },
          { label: 'TOTAL VOLUME', value: volume.toLocaleString(), unit: 'kg', icon: TrendingUp, color: 'var(--success)' },
          { label: 'LIVE COMPS', value: activeComps.length, unit: '', icon: Swords, color: 'var(--warning)' },
        ].map(({ label, value, unit, icon: Icon, color }) => (
          <div key={label} className="card-chalk p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" style={{ color }} />
              <span className="label-sm mb-0">{label}</span>
            </div>
            <p className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-mono-stack)' }}>
              {value}
              {unit && <span className="text-lg ml-1" style={{ color: 'var(--muted)' }}>{unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Recent + Active */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <div className="card-sheet">
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>Recent Workouts</h2>
            <Link href="/workouts" className="text-xs flex items-center gap-1 hover:underline" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--primary)' }}>
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-5">
            {loading ? (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--muted)' }}>…</p>
            ) : recentWorkouts.length > 0 ? (
              <div className="stagger">
                {recentWorkouts.map((w: any) => (
                  <Link key={w.id} href={`/workouts/${w.id}`}
                    className="flex items-center justify-between py-3 border-b last:border-0 hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <p className="text-sm font-medium">{w.name}</p>
                      <p className="text-[10px] tracking-wider uppercase mt-0.5" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
                        {new Date(w.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="badge-chalk" style={{ background: w.completed_at ? 'var(--success-dim)' : 'var(--warning)', color: 'var(--bg)' }}>
                      {w.completed_at ? 'DONE' : 'ACTIVE'}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--muted)' }}>No workouts yet</p>
                <Link href="/workouts/new" className="inline-block mt-3 btn-primary text-sm">Start Your First</Link>
              </div>
            )}
          </div>
        </div>

        {/* Active Competitions */}
        <div className="card-sheet">
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>Active Competitions</h2>
            <Link href="/competitions" className="text-xs flex items-center gap-1 hover:underline" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--primary)' }}>
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-5">
            {activeComps.length > 0 ? (
              <div className="stagger">
                {activeComps.map((c: any) => (
                  <Link key={c.id} href={`/competitions/${c.id}`}
                    className="flex items-center justify-between py-3 border-b last:border-0 hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-[10px] tracking-wider uppercase mt-0.5" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
                        {c.exercises?.name} — {c.type.replace('_', ' ')}
                      </p>
                    </div>
                    <span className="badge-chalk flex items-center gap-1.5" style={{ background: 'var(--success-dim)', color: 'var(--bg)' }}>
                      <span className="status-dot active" /> LIVE
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--muted)' }}>No active competitions</p>
                <Link href="/competitions/new" className="inline-block mt-3 btn-ghost text-sm">Create One</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
