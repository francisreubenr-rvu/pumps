'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Swords, Play, Square, Timer, UserPlus } from 'lucide-react'

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [userId, setUserId] = useState('')
  const [comp, setComp] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [weight, setWeight] = useState(60)
  const [reps, setReps] = useState(10)
  const [isParticipant, setIsParticipant] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const load = useCallback(async () => {
    if (!id) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return; setUserId(user.id)

    const { data: c } = await supabase.from('competitions').select('*, exercises(name)').eq('id', id).single()
    if (!c) return; setComp(c)
    const { data: p } = await supabase.from('competition_participants').select('user_id, profiles!inner(username)').eq('competition_id', id)
    setParticipants((p ?? []).map((pp: any) => ({ user_id: pp.user_id, username: pp.profiles?.username ?? 'Unknown' })))
    setIsParticipant(p?.some((pp: any) => pp.user_id === user.id) ?? false)
    const { data: l } = await supabase.from('competition_logs').select('*').eq('competition_id', id).order('logged_at', { ascending: true })
    setLogs(l ?? [])
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!id) return
    const ch = createClient().channel(`comp:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'competition_logs', filter: `competition_id=eq.${id}` },
        (p: any) => setLogs(prev => [...prev, p.new]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'competitions', filter: `id=eq.${id}` },
        (p: any) => setComp((prev: any) => prev ? { ...prev, status: p.new.status } : prev))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'competition_participants', filter: `competition_id=eq.${id}` },
        () => load())
      .subscribe()
    return () => { ch.unsubscribe() }
  }, [id])

  useEffect(() => {
    if (comp?.status !== 'active') return
    const start = Date.now()
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(t)
  }, [comp?.status])

  async function startComp() { await createClient().from('competitions').update({ status: 'active', starts_at: new Date().toISOString() }).eq('id', id) }
  async function endComp() { await createClient().from('competitions').update({ status: 'completed', ends_at: new Date().toISOString() }).eq('id', id) }
  async function joinComp() {
    await createClient().from('competition_participants').insert({ competition_id: id, user_id: userId })
    setIsParticipant(true); load()
  }
  async function logSet() {
    if (!isParticipant) return
    await createClient().from('competition_logs').insert({
      competition_id: id, user_id: userId,
      set_number: logs.filter(l => l.user_id === userId).length + 1, reps, weight_kg: weight,
    })
  }

  function stats(uid: string) {
    const ul = logs.filter(l => l.user_id === uid)
    if (!comp) return ''
    if (comp.type === 'max_weight') return `${Math.max(...ul.map((l: any) => Number(l.weight_kg ?? 0)), 0)} kg`
    if (comp.type === 'max_reps') return `${Math.max(...ul.map((l: any) => l.reps), 0)} reps`
    return `${ul.reduce((s: number, l: any) => s + l.reps * Number(l.weight_kg ?? 0), 0)} kg`
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const isCreator = comp?.created_by === userId

  if (!comp) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono-stack)' }}>…loading</p></div>

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-4xl mx-auto relative">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/competitions" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--muted)' }}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-4xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>{comp.name}</h1>
          <p className="text-xs tracking-wider uppercase mt-1" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
            {comp.exercises?.name} — {comp.type?.replace('_', ' ')}
          </p>
        </div>
        <span className="ml-auto badge-chalk" style={{ background: comp.status === 'active' ? 'var(--success-dim)' : comp.status === 'completed' ? 'var(--muted)' : 'var(--warning)', color: 'var(--bg)' }}>
          {comp.status === 'active' ? <><span className="status-dot active mr-1" /> LIVE</> : comp.status}
        </span>
      </div>

      {comp.status === 'active' && (
        <div className="card-chalk p-4 mb-6 text-center flex items-center justify-center gap-3">
          <Timer className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <span className="text-3xl tracking-tight" style={{ fontFamily: 'var(--font-mono-stack)' }}>{fmt(elapsed)}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card-sheet">
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base font-bold tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>
                <Swords className="inline h-4 w-4 mr-2" style={{ color: 'var(--primary)' }} />
                PARTICIPANTS
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2 stagger">
              {participants.map(p => (
                <div key={p.user_id} className="flex items-center justify-between p-3 rounded" style={{ background: 'var(--surface1)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] tracking-wider uppercase font-bold" style={{ fontFamily: 'var(--font-mono-stack)', background: 'var(--primary)', color: 'var(--bg)' }}>
                      {p.username?.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{p.username}</span>
                  </div>
                  <span className="badge-chalk" style={{ background: 'var(--primary)', color: 'var(--bg)' }}>{stats(p.user_id)}</span>
                </div>
              ))}
            </div>
          </div>

          {isParticipant && comp.status === 'active' && (
            <div className="card-sheet p-4 flex items-end gap-3" style={{ borderColor: 'var(--primary)', boxShadow: 'var(--shadow-glow-primary)' }}>
              <div className="flex-1">
                <label className="label-sm">WEIGHT (KG)</label>
                <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="input-field" />
              </div>
              <div className="flex-1">
                <label className="label-sm">REPS</label>
                <input type="number" value={reps} onChange={e => setReps(Number(e.target.value))} className="input-field" />
              </div>
              <button onClick={logSet} className="btn-primary py-2">Log Set</button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {isCreator && comp.status === 'waiting' && (
            <button onClick={startComp} disabled={participants.length < 1} className="btn-primary w-full" style={{ background: 'var(--success)' }}>
              <Play className="h-4 w-4" /> Start
            </button>
          )}
          {isCreator && comp.status === 'active' && (
            <button onClick={endComp} className="btn-primary w-full" style={{ background: 'var(--danger)' }}>
              <Square className="h-4 w-4" /> End
            </button>
          )}
          {!isParticipant && comp.status !== 'completed' && (
            <button onClick={joinComp} className="btn-primary w-full">
              <UserPlus className="h-4 w-4" /> Join
            </button>
          )}

          <div className="card-sheet">
            <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>
                <Swords className="inline h-4 w-4 mr-1" style={{ color: 'var(--primary)' }} /> LIVE LOG
              </h3>
            </div>
            <div className="p-3 max-h-80 overflow-y-auto space-y-2">
              {[...logs].reverse().map(l => {
                const pu = participants.find(pp => pp.user_id === l.user_id)
                return (
                  <div key={l.id} className="p-2 rounded text-xs" style={{ background: 'var(--surface1)' }}>
                    <p className="font-bold">{pu?.username ?? 'Unknown'}</p>
                    <p style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
                      Set {l.set_number}: {l.weight_kg} kg × {l.reps} = {(Number(l.weight_kg ?? 0) * l.reps).toLocaleString()} kg
                    </p>
                  </div>
                )
              })}
              {logs.length === 0 && <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>Waiting for first set...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
