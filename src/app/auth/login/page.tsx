"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from("profiles").select("username").eq("id", data.user.id).single().then(({ data: p }) => {
          router.replace(p?.username ? "/dashboard" : "/onboarding")
        })
      }
    })
  }, [])

  async function signIn(e: React.FormEvent) {
    e.preventDefault(); setError(""); setBusy(true)
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setBusy(false) }
  }

  return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "#ffffff", lineHeight: 1 }}>PUMPS</h1>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ccff00", marginTop: 8 }}>SIGN IN</p>
        </div>

        <div className="card-surface" style={{ padding: 32 }}>
          <form onSubmit={signIn} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label className="label-sm">EMAIL</label>
              <input type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-sm">PASSWORD</label>
              <input type="password" autoComplete="current-password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
            </div>
            {error && <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, padding: "8px 12px", background: "#1a1a1a", color: "#ff0000" }}>{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px 0" }}>
              {busy ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>
        </div>

        <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, color: "#8d8d8d", textAlign: "center", marginTop: 16 }}>
          No account? <a href="https://jchfbpzucylthmgthktj.supabase.co/auth/v1/signup" style={{ color: "#ccff00", textDecoration: "none" }}>Create one on Flip</a>
        </p>
      </div>
    </div>
  )
}
