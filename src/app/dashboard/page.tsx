"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, Swords, Plus, Activity, Zap, ChevronRight, Clock } from "lucide-react"
import { useMode } from "@/lib/mode-context"
import { useUser } from "@/lib/queries/auth"
import { useDashboardData } from "@/lib/queries/dashboard"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import {
  PageShell,
  PageHero,
  SectionHeader,
  Card,
  StatCard,
  Badge,
  ListRow,
  EmptyState,
} from "@/components/ui/kinetic"

export default function DashboardPage() {
  const router = useRouter()
  const { mode, meta } = useMode()

  const { data: user, isLoading: userLoading } = useUser()
  const { data, isPending } = useDashboardData(user?.id)

  // Redirect to login only once we know there is no session (avoids bouncing
  // mid-load). TanStack Query owns all fetching, caching, and focus-refetch.
  useEffect(() => {
    if (!userLoading && !user) router.replace("/auth/login")
  }, [userLoading, user, router])

  const loading = userLoading || (!!user && isPending)
  const workoutCount = data?.workoutCount ?? 0
  const volume = data?.volume ?? 0
  const recentWorkouts = data?.recentWorkouts ?? []
  const activeComps = data?.activeComps ?? []
  const volumeHistory = data?.volumeHistory ?? []
  const hasVolumeHistory = volumeHistory.length > 0

  const quickActions = [
    { href: "/workouts/new", label: "Log Workout", icon: Plus },
    { href: "/journal/new", label: "Write Journal", icon: ChevronRight },
    { href: "/competitions/new", label: "New Competition", icon: Swords },
    { href: "/progress", label: "View Progress", icon: TrendingUp },
  ]

  return (
    <PageShell>
      <PageHero
        title={user ? (user.user_metadata?.display_name || user.email?.split("@")[0] || "Athlete") : " "}
        tagline={meta[mode].tagline}
        bgImage="/images/hero-weights.jpg"
      />

      {/* Stats */}
      <div className="k-stats-grid k-section">
        <StatCard icon={Zap} label="WORKOUTS" value={workoutCount} animate delay={100} />
        <StatCard icon={TrendingUp} label="TOTAL VOLUME" value={volume} unit="KG" animate delay={200} />
        <StatCard icon={Swords} label="LIVE COMPS" value={activeComps.length} animate delay={300} />
        <StatCard
          icon={Activity}
          label="STATUS"
          value={loading ? "…" : "Ready"}
        />
      </div>

      {/* Volume chart */}
      <Card className="k-section">
        <SectionHeader
          title="Volume history"
          action={<span className="k-eyebrow">Last 8 weeks</span>}
        />
        {hasVolumeHistory ? (
          <div style={{ height: 200 }} aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeHistory}>
                <XAxis dataKey="week" stroke="var(--text-secondary)" fontSize={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 0, fontSize: 12, fontFamily: "var(--font-heading-stack)" }} />
                <Bar dataKey="volume" radius={[0, 0, 0, 0]}>
                  {volumeHistory.map((_, i) => (
                    <Cell key={i} fill={i === volumeHistory.length - 1 ? "var(--accent)" : "var(--surface-elevated)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            message={loading ? "Loading…" : "Log a workout to see your volume history"}
            actionHref={loading ? undefined : "/workouts/new"}
            actionLabel={loading ? undefined : "Log workout"}
          />
        )}
      </Card>

      {/* Recent + competitions */}
      <div className="grid-2col k-section">
        <Card>
          <SectionHeader title="Recent workouts" viewAllHref="/workouts" />
          {recentWorkouts.length > 0 ? (
            <div className="stagger">
              {recentWorkouts.map(w => (
                <ListRow
                  key={w.id}
                  href={`/workouts/${w.id}`}
                  title={w.name}
                  subtitle={
                    <>
                      <Clock size={11} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />
                      {new Date(w.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </>
                  }
                  trailing={
                    <Badge variant={w.completed_at ? "solid" : "muted"}>
                      {w.completed_at ? "DONE" : "ACTIVE"}
                    </Badge>
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No workouts yet" />
          )}
        </Card>

        <Card>
          <SectionHeader title="Active competitions" viewAllHref="/competitions" />
          {activeComps.length > 0 ? (
            <div className="stagger">
              {activeComps.map((c: any) => (
                <ListRow
                  key={c.id}
                  href={`/competitions/${c.id}`}
                  title={c.name}
                  subtitle={`${c.exercises?.name ?? ""}${c.type ? ` — ${c.type.replace("_", " ")}` : ""}`}
                  trailing={<Badge variant="live">LIVE</Badge>}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No active competitions" actionHref="/competitions/new" actionLabel="Create one" />
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div className="k-quick-grid">
        {quickActions.map(a => (
          <Card key={a.href} href={a.href} interactive padded={false} style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <a.icon size={14} style={{ color: "var(--accent)", flexShrink: 0 }} aria-hidden="true" />
            <span className="k-title" style={{ fontSize: 12, letterSpacing: "0.04em" }}>{a.label}</span>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
