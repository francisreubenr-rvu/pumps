'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/auth/login'); return }
      supabase.from('workouts').select('*').eq('user_id', data.user.id).order('started_at', { ascending: false })
        .then(({ data }) => { setWorkouts(data ?? []); setMounted(true) })
    })
  }, [])

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-5xl mx-auto relative">
      <div className="flex items-center justify-between mb-8" style={{ animation: mounted ? 'chalkReveal 0.4s var(--ease-quart) both' : 'none' }}>
        <div>
          <h1 className="text-4xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>WORKOUTS</h1>
          <p className="label-sm">YOUR LOG</p>
        </div>
        <Link href="/workouts/new" className="btn-primary">
          <Plus className="h-4 w-4" /> New
        </Link>
      </div>

      {workouts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger">
          {workouts.map((w: any) => (
            <Link key={w.id} href={`/workouts/${w.id}`} className="card-glow p-4">
              <p className="text-sm font-medium">{w.name}</p>
              <p className="text-[10px] tracking-wider uppercase mt-1" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
                {new Date(w.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
              <span className="badge-chalk inline-block mt-2" style={{ background: w.completed_at ? 'var(--success-dim)' : 'var(--warning)', color: 'var(--bg)' }}>
                {w.completed_at ? 'DONE' : 'ACTIVE'}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card-sheet p-12 text-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No workouts logged yet</p>
          <Link href="/workouts/new" className="btn-primary inline-block mt-4">Log Your First</Link>
        </div>
      )}
    </div>
  )
}
