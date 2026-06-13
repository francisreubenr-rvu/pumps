"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { ArrowLeft, Swords, Play, Square, Timer, UserPlus } from "lucide-react"

export default function CompetitionDetailClient() {
  const { id } = useParams<{ id: string }>()
  const [userId, setUserId] = useState("")
  const [comp, setComp] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [weight, setWeight] = useState(60)
  const [reps, setReps] = useState(10)
  const [isParticipant, setIsParticipant] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [subRetry, setSubRetry] = useState(0)
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const load = useCallback(async () => {
    if (!id) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return; setUserId(user.id)
    const { data: c } = await supabase.from("competitions").select("*, exercises(name)").eq("id", id).single()
    if (!c) return; setComp(c)
    const { data: p } = await supabase.from("competition_participants").select("user_id, profiles!inner(username)").eq("competition_id", id)
    setParticipants((p ?? []).map((pp: any) => ({ user_id: pp.user_id, username: pp.profiles?.username ?? "Unknown" })))
    setIsParticipant(p?.some((pp: any) => pp.user_id === user.id) ?? false)
    const { data: l } = await supabase.from("competition_logs").select("*").eq("competition_id", id).order("logged_at", { ascending: true })
    setLogs(l ?? [])
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    const ch = supabase.channel(`comp:${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "competition_logs", filter: `competition_id=eq.${id}` }, (p: any) => setLogs(prev => [...prev, p.new]))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "competitions", filter: `id=eq.${id}` }, (p: any) => setComp((prev: any) => prev ? { ...prev, status: p.new.status } : prev))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "competition_participants", filter: `competition_id=eq.${id}` }, () => load())
      .subscribe((status) => {
        if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          console.warn("[realtime]", status, "- reconnecting in 3s")
          clearTimeout(reconnectRef.current)
          reconnectRef.current = setTimeout(() => setSubRetry(r => r + 1), 3000)
        }
      })
    return () => {
      clearTimeout(reconnectRef.current)
      supabase.removeChannel(ch).catch(() => {})
    }
  }, [id, load, subRetry])

  useEffect(() => { if (comp?.status !== "active") return; const start = Date.now(); const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000); return () => clearInterval(t) }, [comp?.status])

  async function startComp() { await createClient().from("competitions").update({ status: "active", starts_at: new Date().toISOString() }).eq("id", id) }
  async function endComp() { await createClient().from("competitions").update({ status: "completed", ends_at: new Date().toISOString() }).eq("id", id) }

  async function joinComp() {
    const { error } = await createClient().from("competition_participants").insert({ competition_id: id, user_id: userId })
    if (error) { console.error("joinComp failed:", error); return }
    setIsParticipant(true)
    load()
  }

  async function logSet() {
    if (!isParticipant) return
    const supabase = createClient()
    const { data: existing } = await supabase.from("competition_logs")
      .select("set_number")
      .eq("competition_id", id)
      .eq("user_id", userId)
      .order("set_number", { ascending: false })
      .limit(1)
      .single()
    const nextSet = (existing?.set_number ?? 0) + 1
    const { error } = await supabase.from("competition_logs").insert({ competition_id: id, user_id: userId, set_number: nextSet, reps, weight_kg: weight })
    if (error) console.error("logSet failed:", error)
  }

  function stats(uid: string) { const ul = logs.filter(l => l.user_id === uid); if (!comp) return ""; if (comp.type === "max_weight") return `${Math.max(...ul.map((l: any) => Number(l.weight_kg ?? 0)), 0)} kg`; if (comp.type === "max_reps") return `${Math.max(...ul.map((l: any) => l.reps), 0)} reps`; return `${ul.reduce((s: number, l: any) => s + l.reps * Number(l.weight_kg ?? 0), 0)} kg` }
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
  const isCreator = comp?.created_by === userId
  if (!comp) return <div style={{ backgroundColor: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#8d8d8d" }}>…</span></div>

  return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(5,5,5,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 56, display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
          <Link href="/competitions" style={{ color: "#8d8d8d", display: "flex" }}><ArrowLeft size={18} /></Link>
          <Link href="/dashboard" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 16, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "#ffffff", textDecoration: "none" }}>PUMPS</Link>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, color: "#8d8d8d" }}>/</span>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ccff00" }}>{comp.name}</span>
          <span className="badge" style={{ marginLeft: "auto", background: comp.status === "active" ? "#ccff00" : "#1a1a1a", color: comp.status === "active" ? "#050505" : "#8d8d8d", display: "flex", alignItems: "center", gap: 4 }}>
            {comp.status === "active" ? <><span className="status-dot active" /> LIVE</> : comp.status}
          </span>
        </div>
      </header>
      <main style={{ maxWidth: 1024, margin: "0 auto", padding: "40px 24px" }}>
        {comp.status === "active" && (
          <div className="card-elevated" style={{ padding: 24, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <Timer size={18} style={{ color: "#ccff00" }} />
            <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em", color: "#ffffff" }}>{fmt(elapsed)}</span>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          <div>
            <div className="card-elevated" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ffffff", marginBottom: 16 }}><Swords size={14} style={{ display: "inline", marginRight: 6, color: "#ccff00" }} />PARTICIPANTS</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                {participants.map(p => (
                  <div key={p.user_id} style={{ padding: 16, background: "#111", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "#ccff00", color: "#050505", fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 700 }}>{p.username?.slice(0, 2).toUpperCase()}</div>
                      <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{p.username}</span>
                    </div>
                    <span className="badge">{stats(p.user_id)}</span>
                  </div>
                ))}
              </div>
            </div>
            {isParticipant && comp.status === "active" && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, padding: 24, background: "#111", marginTop: 2, border: "1px solid #ccff00" }}>
                <div style={{ flex: 1 }}><label className="label-sm">WEIGHT (KG)</label><input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="input-field" /></div>
                <div style={{ flex: 1 }}><label className="label-sm">REPS</label><input type="number" value={reps} onChange={e => setReps(Number(e.target.value))} className="input-field" /></div>
                <button onClick={logSet} className="btn-primary">LOG SET</button>
              </div>
            )}
          </div>
          <div>
            {isCreator && comp.status === "waiting" && <button onClick={startComp} disabled={participants.length < 1} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 12, background: "#ccff00" }}><Play size={14} /> START</button>}
            {isCreator && comp.status === "active" && <button onClick={endComp} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 12, background: "#ff0000" }}><Square size={14} /> END</button>}
            {!isParticipant && comp.status !== "completed" && <button onClick={joinComp} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}><UserPlus size={14} /> JOIN</button>}
            <div className="card-elevated" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ffffff", marginBottom: 16 }}>LIVE LOG</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
                {[...logs].reverse().map(l => {
                  const pu = participants.find(pp => pp.user_id === l.user_id)
                  return (
                    <div key={l.id} style={{ padding: 10, background: "#111" }}>
                      <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, color: "#ffffff" }}>{pu?.username ?? "Unknown"}</p>
                      <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "#8d8d8d", marginTop: 2 }}>Set {l.set_number}: {l.weight_kg} kg × {l.reps} = {(Number(l.weight_kg ?? 0) * l.reps).toLocaleString()} kg</p>
                    </div>
                  )
                })}
                {logs.length === 0 && <p style={{ fontSize: 12, color: "#8d8d8d", textAlign: "center" }}>Waiting for first set...</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
