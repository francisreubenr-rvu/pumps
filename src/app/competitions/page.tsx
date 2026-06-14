"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Plus, Swords } from "lucide-react"
import { PageShell, PageTitle, Card, Badge, EmptyState } from "@/components/ui/kinetic"

export default function CompetitionsPage() {
  const [comps, setComps] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
    supabase.from("competitions").select("*, exercises(name), competition_participants(count)").order("created_at", { ascending: false }).then(({ data }) => setComps(data ?? []))
  }, [])

  return (
    <PageShell>
      <div className="k-section" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <PageTitle title="Competitions" eyebrow="Live workout battles" />
        {userId && (
          <Link href="/competitions/new" className="btn-primary" style={{ fontSize: 12, padding: "8px 16px", flexShrink: 0 }}>
            <Plus size={14} /> Create
          </Link>
        )}
      </div>

      {comps.length > 0 ? (
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 2 }}>
          {comps.map(c => (
            <Card key={c.id} href={`/competitions/${c.id}`} interactive>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p className="k-title">{c.name}</p>
                {c.status === "active" && <Badge variant="live">LIVE</Badge>}
                {c.status === "waiting" && <Badge variant="muted">UPCOMING</Badge>}
                {c.status === "completed" && <Badge variant="muted">DONE</Badge>}
              </div>
              <p className="k-row-sub">{c.exercises?.name} — {c.type?.replace("_", " ")}</p>
              <p className="k-row-sub" style={{ marginTop: 8 }}>
                <Swords size={12} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />
                {c.competition_participants?.[0]?.count ?? 0} participants
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ padding: 60, textAlign: "center" }}>
          <Swords size={24} style={{ color: "var(--text-secondary)", marginBottom: 12 }} aria-hidden="true" />
          <EmptyState message="No competitions yet" actionHref="/competitions/new" actionLabel="Create one" />
        </Card>
      )}
    </PageShell>
  )
}
