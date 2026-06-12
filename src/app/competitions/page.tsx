'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Swords, Play, Square, Timer, UserPlus, ArrowLeft } from 'lucide-react'

export default function CompetitionsPage() {
  const [comps, setComps] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    createClient().from('competitions').select('*, exercises(name), competition_participants(count)')
      .order('created_at', { ascending: false }).then(({ data }) => { setComps(data ?? []); setMounted(true) })
  }, [])

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-5xl mx-auto relative">
      <div className="flex items-center justify-between mb-8" style={{ animation: mounted ? 'chalkReveal 0.4s var(--ease-quart) both' : 'none' }}>
        <div>
          <h1 className="text-4xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>COMPETITIONS</h1>
          <p className="label-sm">LIVE WORKOUT BATTLES</p>
        </div>
        <Link href="/competitions/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Create
        </Link>
      </div>

      {comps.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger">
          {comps.map(c => (
            <Link key={c.id} href={`/competitions/${c.id}`}
              className="card-glow p-4"
              style={{ borderColor: c.status === 'active' ? 'var(--primary)' : 'var(--border)' }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{c.name}</p>
                <span className="badge-chalk" style={{ background: c.status === 'active' ? 'var(--success-dim)' : c.status === 'completed' ? 'var(--muted)' : 'var(--warning)', color: 'var(--bg)' }}>
                  {c.status === 'active' ? <><span className="status-dot active mr-1" /> LIVE</> : c.status}
                </span>
              </div>
              <p className="text-[10px] tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
                {c.exercises?.name} — {c.type?.replace('_', ' ')}
              </p>
              <p className="text-[10px] tracking-wider uppercase mt-2" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
                <Swords className="inline h-3 w-3 mr-1" /> {c.competition_participants?.[0]?.count ?? 0} participants
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card-sheet p-12 text-center">
          <Swords className="mx-auto h-8 w-8 mb-3" style={{ color: 'var(--muted)' }} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No competitions yet</p>
          <Link href="/competitions/new" className="btn-primary inline-block mt-4">Create One</Link>
        </div>
      )}
    </div>
  )
}
