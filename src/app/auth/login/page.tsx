"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) { setCheckingSession(false); return }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from("profiles").select("username").eq("id", data.user.id).single().then(({ data: p }) => {
          router.replace(p?.username ? "/dashboard" : "/onboarding")
        })
      } else {
        setCheckingSession(false)
      }
    }).catch(() => setCheckingSession(false))
  }, [router])

  async function signInWithGoogle() {
    setBusy(true)
    setError("")
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) { setError(error.message); setBusy(false) }
    } catch {
      setError("Could not connect. Please try again.")
      setBusy(false)
    }
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setBusy(false); return }
      router.push("/dashboard")
    } catch {
      setError("Network error. Please try again.")
      setBusy(false)
    }
  }

  async function handleSignUp() {
    setError("")
    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setBusy(false); return }
      setError("Check your email for a confirmation link.")
      setBusy(false)
    } catch {
      setError("Network error. Please try again.")
      setBusy(false)
    }
  }

  if (checkingSession) {
    return (
      <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: 24, height: 24, border: "3px solid var(--surface-elevated)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
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
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={busy}
            className="btn-outline"
            style={{ width: "100%", justifyContent: "center", padding: "12px 0", marginBottom: 24, gap: 10 }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

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
          No account?{" "}
          <button type="button" onClick={handleSignUp} disabled={busy} style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "var(--accent)", cursor: "pointer" }}>
            Create one here
          </button>
        </p>
      </div>
    </div>
  )
}
