"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function OnboardingPage() {
  const [username, setUsername] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      const { data: p } = await supabase.from("profiles").select("username").eq("id", data.user.id).single()
      if (p?.username) router.replace("/dashboard")
    })
  }, [router])

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!username || username.length < 3) return; setBusy(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBusy(false); return }
    await supabase.from("profiles").update({ username }).eq("id", user.id)
    router.push("/dashboard")
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>Welcome</h1>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 8 }}>Choose Your Name</p>
        </div>
        <div className="card-elevated" style={{ padding: 32 }}>
          <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label htmlFor="onboard-username" className="label-sm">USERNAME</label>
              <input id="onboard-username" name="username" type="text" required minLength={3} maxLength={30} placeholder="your_gym_name" value={username} onChange={e => setUsername(e.target.value)} className="input-field" />
            </div>
            <button type="submit" disabled={busy || username.length < 3} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px 0" }}>
              {busy ? "Saving…" : "Let's Go"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
