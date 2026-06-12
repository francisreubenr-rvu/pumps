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
  }, [router])

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setBusy(false); return }
    router.push("/dashboard")
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            PUMPS
          </h1>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 8 }}>SIGN IN</p>
        </div>

        <div className="card-surface" style={{ padding: 32 }}>
          <form onSubmit={signIn} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label htmlFor="login-email" className="label-sm">EMAIL</label>
              <input id="login-email" name="email" type="email" autoComplete="email" required spellCheck={false} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
            </div>
            <div>
              <label htmlFor="login-password" className="label-sm">PASSWORD</label>
              <input id="login-password" name="password" type="password" autoComplete="current-password" required placeholder="Password…" value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
            </div>
            {error && (
              <p role="alert" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, padding: "8px 12px", background: "var(--surface-elevated)", color: "var(--accent-red)" }}>
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px 0" }}>
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", textAlign: "center", marginTop: 16 }}>
          No account? <Link href="https://jchfbpzucylthmgthktj.supabase.co/auth/v1/signup" style={{ color: "var(--accent)", textDecoration: "none" }}>Create one on Flip</Link>
        </p>
      </div>
    </div>
  )
}
