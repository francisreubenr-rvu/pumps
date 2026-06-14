"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Clock } from "lucide-react"
import { PageShell, PageTitle, Card, Badge } from "@/components/ui/kinetic"

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      supabase.from("workouts").select("*").eq("user_id", data.user.id).order("started_at", { ascending: false })
        .then(({ data }) => { setWorkouts(data ?? []) })
        .catch(() => { setWorkouts([]) })
    })
  }, [router])

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
