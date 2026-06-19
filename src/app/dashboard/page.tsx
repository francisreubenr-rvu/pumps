"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { TrendingUp, Swords, Plus, Flame, Zap, ChevronRight, Clock } from "lucide-react"
import { useUser } from "@/lib/queries/auth"
import { useProfile } from "@/lib/queries/profile"
import { useDashboardData } from "@/lib/queries/dashboard"
import {
  PageShell,
  SectionHeader,
  Card,
  StatCard,
  Badge,
  ListRow,
  EmptyState,
} from "@/components/ui/kinetic"

// recharts is heavy — load it on demand so it stays out of the dashboard's
// initial JS (the chart is one of several sections).
const BarSeriesChart = dynamic(() => import("@/components/charts/bar-series-chart"), {
  ssr: false,
  loading: () => <div style={{ height: 200 }} aria-hidden="true" />,
})

const READINESS_COLOR: Record<string, string> = {
  good: "var(--accent)",
  caution: "var(--warning)",
  warn: "var(--danger)",
  muted: "var(--text-secondary)",
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

export default function DashboardPage() {
  const router = useRouter()

  const { data: user, isLoading: userLoading } = useUser()
  const { data: profile } = useProfile(user?.id)
  const { data, isPending } = useDashboardData(user?.id)

  // Redirect to login only once we know there is no session (avoids bouncing
  // mid-load). TanStack Query owns all fetching, caching, and focus-refetch.
  useEffect(() => {
    if (!userLoading && !user) router.replace("/auth/login")
  }, [userLoading, user, router])

  const loading = userLoading || (!!user && isPending)
  const workoutCount = data?.workoutCount ?? 0
  const volume = data?.volume ?? 0
  const streak = data?.streak ?? 0
  const readiness = data?.readiness
  const recentWorkouts = data?.recentWorkouts ?? []
  const activeComps = data?.activeComps ?? []
  const volumeHistory = data?.volumeHistory ?? []
  const hasVolumeHistory = volumeHistory.length > 0

  const name = user
    ? (profile?.display_name || profile?.username || user.email?.split("@")[0] || "Athlete")
    : ""
  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" })
  const streakLine =
    streak > 0
      ? <>You&apos;re on a <span style={{ color: "var(--fg)", fontWeight: 600 }}>{streak}-day</span> streak. One session keeps it alive.</>
      : <>Log a session today to start a streak.</>

  const quickActions = [
    { href: "/workouts/new", label: "Log Workout", icon: Plus },
    { href: "/journal/new", label: "Write Journal", icon: ChevronRight },
    { href: "/competitions/new", label: "New Competition", icon: Swords },
    { href: "/progress", label: "View Progress", icon: TrendingUp },
  ]

  return (
    <PageShell>
      {/* Hero — gradient streak card (design blueprint; accent follows the active mode) */}
      <div
        className="k-section"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--r-xl)",
          border: "1px solid var(--border)",
          padding: "clamp(22px, 4vw, 28px)",
          background:
            "radial-gradient(120% 140% at 88% -20%, color-mix(in oklch, var(--accent) 14%, transparent), transparent 55%), linear-gradient(180deg, var(--surface-elevated), var(--bg-elevated))",
        }}
      >
        <div className="k-eyebrow" style={{ color: "var(--accent)", marginBottom: 10 }}>Overview · {weekday}</div>
        <div style={{ fontFamily: "var(--font-heading-stack)", fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05, minHeight: 30 }}>
          {name ? `${greeting()}, ${name}` : " "}
        </div>
        <p className="k-row-sub" style={{ marginTop: 8, fontSize: 14 }}>{streakLine}</p>
      </div>

      {/* Stats */}
      <div className="k-stats-grid k-section">
        <StatCard icon={Zap} label="WORKOUTS" value={workoutCount} animate delay={100} />
        <StatCard icon={TrendingUp} label="TOTAL VOLUME" value={volume} unit="KG" animate delay={200} />
        <StatCard icon={Swords} label="LIVE COMPS" value={activeComps.length} animate delay={300} />
        <StatCard icon={Flame} label="STREAK" value={loading ? "…" : streak} unit={streak === 1 ? "DAY" : "DAYS"} animate={!loading} delay={400} />
      </div>

      {/* Training readiness (acute:chronic workload) */}
      {readiness && (
        <Card className="k-section" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="k-eyebrow" style={{ marginBottom: 6 }}>Training readiness</p>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: READINESS_COLOR[readiness.tone] }}>
              {readiness.label}
            </p>
          </div>
          <p className="k-row-sub" style={{ maxWidth: "32ch", textAlign: "right" }}>
            {readiness.ratio == null
              ? "Log a few weeks to assess your load."
              : <>Acute:chronic load <span style={{ color: "var(--fg)", fontWeight: 600 }}>{readiness.ratio.toFixed(2)}</span> — last 7 days vs 28-day average.</>}
          </p>
        </Card>
      )}

      {/* Volume chart */}
      <Card className="k-section">
        <SectionHeader
          title="Volume history"
          action={<span className="k-eyebrow">Last 8 weeks</span>}
        />
        {hasVolumeHistory ? (
          <BarSeriesChart data={volumeHistory} xKey="week" yKey="volume" height={200} highlightLast />
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
