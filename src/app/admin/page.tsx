"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { useUser } from "@/lib/queries/auth"
import { useIsAdmin, useAuditEvents } from "@/lib/queries/admin"
import { PageShell, PageTitle, Card, EmptyState } from "@/components/ui/kinetic"

export default function AdminPage() {
  const router = useRouter()
  const { data: user, isLoading: userLoading } = useUser()
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin(user?.id)
  const { data: events = [], isPending: eventsPending } = useAuditEvents(isAdmin === true)

  useEffect(() => {
    if (!userLoading && !user) router.replace("/auth/login")
  }, [userLoading, user, router])

  const checking = userLoading || (!!user && adminLoading)

  if (checking) {
    return (
      <PageShell>
        <PageTitle title="Admin" eyebrow="Operations" />
        <EmptyState message="Checking access…" />
      </PageShell>
    )
  }

  if (!isAdmin) {
    return (
      <PageShell>
        <PageTitle title="Admin" eyebrow="Operations" />
        <Card style={{ padding: 48, textAlign: "center" }}>
          <ShieldCheck size={24} style={{ color: "var(--text-secondary)", marginBottom: 12 }} aria-hidden="true" />
          <p className="k-row-sub">You don’t have access to this area.</p>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageTitle title="Admin" eyebrow="Operations · audit trail" />
      <Card>
        {eventsPending ? (
          <EmptyState message="Loading audit trail…" />
        ) : events.length === 0 ? (
          <EmptyState message="No audit events yet." />
        ) : (
          <table className="k-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id}>
                  <td className="num" style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {new Date(e.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </td>
                  <td style={{ textTransform: "uppercase" }}>{e.actor?.username ?? "—"}</td>
                  <td style={{ color: "var(--accent)" }}>{e.action}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{e.entity_type}</td>
                  <td style={{ color: "var(--text-secondary)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {Object.keys(e.metadata ?? {}).length ? JSON.stringify(e.metadata) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </PageShell>
  )
}
