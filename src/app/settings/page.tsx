"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { exportWorkoutsCsv, exportAllJson } from "@/lib/export"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [exporting, setExporting] = useState<"csv" | "json" | null>(null)
  const [exportError, setExportError] = useState("")
  const router = useRouter()

  async function doExport(kind: "csv" | "json") {
    if (!user) return
    setExporting(kind)
    setExportError("")
    try {
      const supabase = createClient()
      if (kind === "csv") await exportWorkoutsCsv(supabase, user.id)
      else await exportAllJson(supabase, user.id)
    } catch (err) {
      console.error("Export failed:", err)
      setExportError("Export failed. Please try again.")
    } finally {
      setExporting(null)
    }
  }

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

        <div className="card-elevated" style={{ padding: 24, marginBottom: 24 }}>
          <p className="label-sm" style={{ marginBottom: 4 }}>YOUR DATA</p>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)" }}>Export everything you&apos;ve logged — it&apos;s yours to keep.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button onClick={() => doExport("csv")} disabled={exporting !== null} className="btn-outline" style={{ fontSize: 12, padding: "10px 16px" }}>
              {exporting === "csv" ? "Exporting…" : "Workouts (CSV)"}
            </button>
            <button onClick={() => doExport("json")} disabled={exporting !== null} className="btn-outline" style={{ fontSize: 12, padding: "10px 16px" }}>
              {exporting === "json" ? "Exporting…" : "Full export (JSON)"}
            </button>
          </div>
          {exportError && <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--danger)", marginTop: 8 }}>{exportError}</p>}
        </div>

        <button onClick={async () => { try { await createClient().auth.signOut() } catch {}; router.push("/auth/login") }} className="btn-primary" style={{ background: "var(--accent-red)", width: "100%", justifyContent: "center", padding: "14px 0" }}>
          Sign Out
        </button>
      </main>
    </div>
  )
}
