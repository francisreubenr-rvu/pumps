"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Clock } from "lucide-react"
import { PageShell, PageTitle, Card, Badge } from "@/components/ui/kinetic"

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const router = useRouter()

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) { router.replace("/auth/login"); return }
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("started_at", { ascending: false })
    if (error) { console.error("Workouts query failed:", error); return }
    setWorkouts(data ?? [])
  }, [router])

  // Refetch on mount and whenever the window regains focus, so a workout saved
  // on another page appears immediately after navigating back here.
  useEffect(() => {
    load().catch((err) => console.error("Workouts load failed:", err))
    const onFocus = () => { load().catch((err) => console.error("Workouts refetch failed:", err)) }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [load])

  return (
    <PageShell>
      <PageTitle title="Workouts" eyebrow="Your log" />

      {workouts.length > 0 ? (
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 2 }}>
          {workouts.map(w => (
            <Card key={w.id} href={`/workouts/${w.id}`} interactive>
              <p className="k-title">{w.name}</p>
              <p className="k-row-sub" style={{ marginTop: 4 }}>
                <Clock size={11} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />
                {new Date(w.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
              <span style={{ display: "inline-block", marginTop: 12 }}>
                <Badge variant={w.completed_at ? "solid" : "muted"}>{w.completed_at ? "DONE" : "ACTIVE"}</Badge>
              </span>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ padding: 60, textAlign: "center" }}>
          <p className="k-row-sub">No workouts logged yet</p>
          <Link href="/workouts/new" className="btn-primary" style={{ display: "inline-flex", marginTop: 16 }}>LOG YOUR FIRST</Link>
        </Card>
      )}
    </PageShell>
  )
}
