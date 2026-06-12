"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      setUser(data.user)
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
      setProfile(p)
    })
  }, [router])

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,48px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1.05, marginBottom: 32 }}>Settings</h1>

        <div className="card-elevated" style={{ padding: 24, marginBottom: 2 }}>
          <p className="label-sm">EMAIL</p>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>{user?.email}</p>
        </div>
        <div className="card-elevated" style={{ padding: 24, marginBottom: 2 }}>
          <p className="label-sm">USERNAME</p>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>{profile?.username ?? "Not set"}</p>
        </div>
        <div className="card-elevated" style={{ padding: 24, marginBottom: 24 }}>
          <p className="label-sm">MEMBER SINCE</p>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</p>
        </div>

        <button onClick={async () => { await createClient().auth.signOut(); router.push("/auth/login") }} className="btn-primary" style={{ background: "var(--accent-red)", width: "100%", justifyContent: "center", padding: "14px 0" }}>
          Sign Out
        </button>
      </main>
    </div>
  )
}
