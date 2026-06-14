"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/queries/auth"
import { useSquads } from "@/lib/queries/squads"
import { queryKeys } from "@/lib/queries/keys"
import { AppNav } from "@/components/layout/nav"
import { Users, Plus, LogIn, Globe } from "lucide-react"

export default function SquadsPage() {
  const [joinCode, setJoinCode] = useState("")
  const [joinError, setJoinError] = useState("")
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: user, isLoading: userLoading } = useUser()
  const { data, isPending, isError, error, refetch } = useSquads(user?.id)

  useEffect(() => {
    if (!userLoading && !user) router.replace("/auth/login")
  }, [userLoading, user, router])

  const mySquads = data?.mySquads ?? []
  const publicSquads = data?.publicSquads ?? []
  const loading = userLoading || (!!user && isPending)
  const loadError = isError ? ((error as any)?.message || "Couldn't load your squads. Please try again.") : ""

  // Refresh the squad lists after a join/create so they're current on return.
  function invalidateSquads() {
    if (user) queryClient.invalidateQueries({ queryKey: queryKeys.squads.all(user.id) })
  }

  async function joinByCode() {
    if (!joinCode.trim() || !user) return
    setJoinError("")
    const supabase = createClient()
    const { data: squad } = await supabase.from("squads").select("id, name").eq("invite_code", joinCode.trim()).single()
    if (!squad) { setJoinError("Squad not found. Check the code."); return }
    const { error } = await supabase.from("squad_members").insert({ squad_id: squad.id, user_id: user.id })
    if (error?.code === "23505") { setJoinError("You're already in this squad."); return }
    if (error) { setJoinError("Could not join squad."); return }
    invalidateSquads()
    router.push(`/squads/${squad.id}`)
  }

  async function createSquad(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !user) return
    setCreating(true)
    const supabase = createClient()
    const { data, error } = await supabase.from("squads").insert({ name: newName.trim(), description: newDesc.trim() || null, created_by: user.id, is_public: isPublic }).select("id").single()
    setCreating(false)
    if (error || !data) { return }
    invalidateSquads()
    router.push(`/squads/${data.id}`)
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
              Squads
            </h1>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 4 }}>
              Train together. Win together.
            </p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary" style={{ gap: 8 }}>
            <Plus size={14} aria-hidden="true" /> New Squad
          </button>
        </div>

        {/* Create squad form */}
        {showCreate && (
          <div className="card-surface" style={{ padding: 28, marginBottom: 32 }}>
            <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)", marginBottom: 20 }}>Create Squad</h3>
            <form onSubmit={createSquad} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="label-sm">Squad Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Team Name" required className="input-field" style={{ width: "100%" }} />
              </div>
              <div>
                <label className="label-sm">Description (optional)</label>
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What's this squad about?" className="input-field" style={{ width: "100%" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{ accentColor: "var(--accent)", width: 16, height: 16 }} />
                <label htmlFor="isPublic" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", cursor: "pointer" }}>
                  Public squad (visible to everyone)
                </label>
              </div>
              <button type="submit" disabled={creating} className="btn-primary" style={{ justifyContent: "center" }}>
                {creating ? "Creating…" : "Create Squad"}
              </button>
            </form>
          </div>
        )}

        {/* Join by code */}
        <div className="card-surface" style={{ padding: 20, marginBottom: 32, display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label className="label-sm">Join by Invite Code</label>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="8-character code" className="input-field" style={{ width: "100%" }} />
            {joinError && <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, color: "var(--accent-red)", marginTop: 4 }}>{joinError}</p>}
          </div>
          <button onClick={joinByCode} className="btn-outline" style={{ gap: 6, padding: "11px 20px", whiteSpace: "nowrap" }}>
            <LogIn size={13} aria-hidden="true" /> Join
          </button>
        </div>

        {/* My squads */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)", marginBottom: 16 }}>
            My Squads
          </h2>
          {loading ? (
            <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-heading-stack)", fontSize: 12 }}>Loading…</p>
          ) : loadError ? (
            <div className="card-surface" style={{ padding: 20 }}>
              <p style={{ color: "var(--accent-red)", fontFamily: "var(--font-heading-stack)", fontSize: 12, marginBottom: 8 }}>{loadError}</p>
              <button onClick={() => refetch()} className="btn-outline" style={{ fontSize: 11, padding: "8px 16px" }}>Retry</button>
            </div>
          ) : mySquads.length === 0 ? (
            <div className="card-surface" style={{ padding: 28, textAlign: "center" }}>
              <p className="k-row-sub">No squads yet — join one with an invite code above, or create your own.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="btn-primary"
                style={{ gap: 8, marginTop: 16, justifyContent: "center", display: "inline-flex" }}
              >
                <Plus size={14} aria-hidden="true" /> Create a squad
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 2 }}>
              {mySquads.map((s: any) => (
                <Link key={s.id} href={`/squads/${s.id}`} style={{ textDecoration: "none" }}>
                  <div className="card-surface" style={{ padding: 20, transition: "border-color 100ms" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: "var(--fg)" }}>{s.name}</p>
                        {s.description && <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>{s.description}</p>}
                      </div>
                      {s.is_public && <Globe size={12} style={{ color: "var(--text-secondary)", marginTop: 2 }} />}
                    </div>
                    <p className="label-sm" style={{ marginTop: 12, color: "var(--accent)" }}>Code: {s.invite_code}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Public squads discovery */}
        <div>
          <h2 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)", marginBottom: 16 }}>
            <Globe size={13} style={{ display: "inline", marginRight: 6 }} aria-hidden="true" />
            Public Squads
          </h2>
          {!loading && !loadError && publicSquads.length === 0 ? (
            <div className="card-surface" style={{ padding: 24, textAlign: "center" }}>
              <p className="k-row-sub">No public squads yet.</p>
            </div>
          ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 2 }}>
            {publicSquads.map((s: any) => (
              <Link key={s.id} href={`/squads/${s.id}`} style={{ textDecoration: "none" }}>
                <div className="card-surface" style={{ padding: 20 }}>
                  <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--fg)" }}>{s.name}</p>
                  {s.description && <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>{s.description}</p>}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
                    <Users size={11} style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
                    <span className="label-sm">{s.squad_members?.[0]?.count ?? 0} members</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </main>
    </div>
  )
}
