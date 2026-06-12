'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Dumbbell } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from("profiles").select("username").eq("id", data.user.id).single().then(({ data: profile }) => {
          router.replace(profile?.username ? "/dashboard" : "/onboarding")
        })
      }
    })
  }, [])

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setBusy(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: 'var(--primary)', boxShadow: 'var(--shadow-glow-primary)' }}>
            <Dumbbell className="h-8 w-8" style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="text-5xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>
            PUMPS
          </h1>
          <p className="mt-2 text-sm tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--primary)' }}>
            Sign In
          </p>
        </div>

        {/* Form */}
        <div className="card-sheet p-6">
          <form onSubmit={signIn} className="flex flex-col gap-5">
            <div>
              <label className="label-sm">Email</label>
              <input
                type="email" autoComplete="email" required
                placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-sm">Password</label>
              <input
                type="password" autoComplete="current-password" required
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                className="input-field"
              />
            </div>

            {error && (
              <div className="px-3 py-2 rounded text-xs font-medium" style={{ fontFamily: 'var(--font-mono-stack)', background: 'var(--danger-dim)', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
          No account?{' '}
          <a href="https://jchfbpzucylthmgthktj.supabase.co/auth/v1/signup" className="hover:underline" style={{ color: 'var(--primary)' }}>
            Create one on Flip →
          </a>
        </p>
      </div>
    </div>
  )
}
