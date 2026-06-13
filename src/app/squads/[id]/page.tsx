"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AppNav } from "@/components/layout/nav"
import { Copy, Check, Users, Trophy } from "lucide-react"

export default function SquadDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [squad, setSquad] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [joining, setJoining] = useState(false)
  const router = useRouter()
  const params = useParams()
  const squadId = params?.id as string

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      setUser(data.user)
    })
  }, [router])

  useEffect(() => {
    if (!user || !squadId) return
    loadSquad()
  }, [user, squadId])

  async function loadSquad() {
    const supabase = createClient()

    const [squadData, membersData] = await Promise.all([
      supabase.from("squads").select("*").eq("id", squadId).single(),
      supabase.from("squad_members").select("*, profiles(username, id)").eq("squad_id", squadId),
    ])

    if (!squadData.data) { router.push("/squads"); return }
    setSquad(squadData.data)
    const memberList = membersData.data ?? []
    setMembers(memberList)
    setIsMember(memberList.some((m: any) => m.user_id === user.id))

    // Load squad leaderboard
    const memberIds = memberList.map((m: any) => m.user_id)
    if (memberIds.length > 0) {
      const { data: sets } = await supabase
        .from("exercise_sets")
        .select("reps, weight_kg, workout_exercises!inner(workouts!inner(user_id, started_at), exercises!inner(name))")
        .in("workout_exercises.workouts.user_id", memberIds)
        .eq("completed", true)

      const agg: Record<string, { user_id: string; username: string; max_weight: number; exercise: string }> = {}
      for (const s of sets ?? []) {
        const we = (s as any).workout_exercises
        const userId: string = we?.workouts?.user_id
        const exName: string = we?.exercises?.name
        if (!userId || !exName) continue
        const key = `${userId}::${exName}`
        const member = memberList.find((m: any) => m.user_id === userId)
        const username = member?.profiles?.username ?? "unknown"
        if (!agg[key]) agg[key] = { user_id: userId, username, max_weight: 0, exercise: exName }
        if ((s.weight_kg ?? 0) > agg[key].max_weight) agg[key].max_weight = s.weight_kg ?? 0
      }
      const lb = Object.values(agg).sort((a, b) => b.max_weight - a.max_weight).slice(0, 10)
      setLeaderboard(lb)
    }

    // Recent workouts by members
    if (memberIds.length > 0) {
      const { data: wks } = await supabase
        .from("workouts")
        .select("*, profiles!user_id(username)")
        .in("user_id", memberIds)
        .order("started_at", { ascending: false })
        .limit(8)
      setRecentWorkouts(wks ?? [])
    }

    setLoading(false)
  }

  async function joinSquad() {
    setJoining(true)
    const supabase = createClient()
    await supabase.from("squad_members").insert({ squad_id: squadId, user_id: user.id })
    setJoining(false)
    loadSquad()
  }

  function copyCode() {
    navigator.clipboard.writeText(squad?.invite_code ?? "")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <div style={{ textAlign: "center", padding: 80, color: "var(--text-secondary)", fontFamily: "var(--font-heading-stack)" }}>Loading…</div>
    </div>
  )

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
              {squad.name}
            </h1>
            {squad.description && (
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{squad.description}</p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {isMember ? (
              <button onClick={copyCode} className="btn-outline" style={{ gap: 8, fontSize: 12, padding: "8px 16px" }}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied!" : squad.invite_code}
              </button>
            ) : (
              <button onClick={joinSquad} disabled={joining} className="btn-primary">
                {joining ? "Joining…" : "Join Squad"}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 2 }}>
          {/* Members */}
          <div className="card-surface" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Users size={13} style={{ color: "var(--accent)" }} aria-hidden="true" />
              <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)" }}>
                Members · {members.length}
              </h3>
            </div>
            <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {members.map((m: any) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 32, height: 32, background: "var(--surface-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 700, color: "var(--fg)", textTransform: "uppercase", flexShrink: 0 }}>
                    {(m.profiles?.username ?? "?").slice(0, 2)}
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "var(--fg)" }}>{m.profiles?.username ?? "unknown"}</p>
                    {m.role === "owner" && <span className="badge" style={{ background: "var(--accent)", color: "var(--bg)" }}>Owner</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Squad leaderboard */}
          <div className="card-surface" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Trophy size={13} style={{ color: "var(--accent)" }} aria-hidden="true" />
              <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)" }}>
                Leaderboard
              </h3>
            </div>
            {leaderboard.length === 0 ? (
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)" }}>No workout data yet.</p>
            ) : (
              <div className="stagger">
                {leaderboard.map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 700, color: i < 3 ? "var(--accent)" : "var(--text-secondary)", width: 20, textAlign: "center" }}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                      </span>
                      <div>
                        <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "var(--fg)" }}>{row.username}</p>
                        <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, color: "var(--text-secondary)" }}>{row.exercise}</p>
                      </div>
                    </div>
                    <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}>{row.max_weight}kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card-surface" style={{ padding: 24, marginTop: 2 }}>
          <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)", marginBottom: 20 }}>
            Recent Activity
          </h3>
          {recentWorkouts.length === 0 ? (
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)" }}>No workouts logged yet.</p>
          ) : (
            <div className="stagger">
              {recentWorkouts.map((w: any) => (
                <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "var(--fg)" }}>{w.name}</p>
                    <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, color: "var(--text-secondary)" }}>
                      {w.profiles?.username} · {new Date(w.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  {w.completed_at && <span className="badge" style={{ background: "var(--accent)", color: "var(--bg)" }}>Done</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
