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
  }, [])

  return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(5,5,5,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          <Link href="/dashboard" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 16, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "#ffffff", textDecoration: "none" }}>PUMPS</Link>
        </div>
      </header>
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,48px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "#ffffff", lineHeight: 1.05, marginBottom: 32 }}>SETTINGS</h1>

        <div className="card-elevated" style={{ padding: 24, marginBottom: 2 }}>
          <p className="label-sm">EMAIL</p>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{user?.email}</p>
        </div>
        <div className="card-elevated" style={{ padding: 24, marginBottom: 2 }}>
          <p className="label-sm">USERNAME</p>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{profile?.username ?? "Not set"}</p>
        </div>
        <div className="card-elevated" style={{ padding: 24, marginBottom: 24 }}>
          <p className="label-sm">MEMBER SINCE</p>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</p>
        </div>

        <button onClick={async () => { await createClient().auth.signOut(); router.push("/auth/login") }} className="btn-primary" style={{ background: "#ff0000", width: "100%", justifyContent: "center", padding: "14px 0" }}>
          SIGN OUT
        </button>
      </main>
    </div>
  )
}
