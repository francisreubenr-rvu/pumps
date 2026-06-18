"use client"

import { useState } from "react"
import Link from "next/link"
import { Crown, Medal, Trophy } from "lucide-react"
import { Podium } from "@/components/leaderboard/podium"
import { PageShell, PageTitle, Card, EmptyState, ErrorState, SkeletonRows } from "@/components/ui/kinetic"
import { useLeaderboard, useWeeklyLeaderboard, currentWeekStart } from "@/lib/queries/leaderboard"

function LBTable({ data, vk, u, showEx }: { data: any[]; vk: string; u: string; showEx?: boolean }) {
  if (!data || data.length === 0)
    return <EmptyState icon={Trophy} message="No rankings yet — log a completed workout to claim a spot." />
  return (
    <div className="k-table-wrap">
      <table className="k-table">
        <thead>
          <tr>
            {["#", "Athlete", ...(showEx ? ["Exercise"] : []), "Best"].map(h => (
              <th key={h} style={{ textAlign: h === "Best" ? "right" : "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((e: any) => (
            <tr key={e.rank}>
              <td style={{ width: 32 }}>
                {e.rank === 1 ? <Crown size={14} style={{ color: "var(--accent)" }} aria-label="1st" /> :
                 e.rank === 2 ? <Medal size={14} style={{ color: "var(--text-secondary)" }} aria-label="2nd" /> :
                 e.rank === 3 ? <Medal size={14} style={{ color: "var(--accent-blue)" }} aria-label="3rd" /> :
                 <span className="num" style={{ color: "var(--text-secondary)" }}>{e.rank}</span>}
              </td>
              <td style={{ padding: "8px 8px" }}>
                <Link href={`/profile/${e.username}`} style={{ color: "var(--fg)", textDecoration: "none", textTransform: "uppercase" }}>
                  {e.username}
                </Link>
              </td>
              {showEx && <td style={{ padding: "8px 8px", color: "var(--text-secondary)", fontWeight: 500 }}>{e.exercise}</td>}
              <td style={{ textAlign: "right" }}>
                <span className="badge num">{Math.round(e[vk]).toLocaleString()} {u}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// A full board: top-3 podium + the rest as a ranked list.
function Board({ data, vk, u, showEx }: { data: any[]; vk: string; u: string; showEx?: boolean }) {
  if (!data || data.length === 0) return <LBTable data={[]} vk={vk} u={u} showEx={showEx} />
  const top3 = data.filter(d => d.rank <= 3)
  const rest = data.filter(d => d.rank > 3)
  return (
    <>
      <Podium data={top3} vk={vk} u={u} />
      {rest.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <LBTable data={rest} vk={vk} u={u} showEx={showEx} />
        </div>
      )}
    </>
  )
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState("max-weight")

  const { data: lb, isLoading: loading, isError, refetch } = useLeaderboard()
  const weekStart = currentWeekStart()
  const { data: weeklyData = [], isLoading: weeklyLoading } = useWeeklyLeaderboard(weekStart, tab === "this-week")

  const maxWeight = lb?.maxWeight ?? []
  const totalVolume = lb?.totalVolume ?? []
  const exercises = lb?.exercises ?? []

  const cats = [...new Set(exercises.map(e => e.category))]

  const TABS = [
    { k: "this-week", l: "THIS WEEK · resets Mon" },
    { k: "max-weight", l: "MAX WEIGHT" },
    { k: "volume", l: "TOTAL VOLUME" },
    ...cats.map(c => ({ k: `cat-${c}`, l: c.toUpperCase() })),
  ]

  return (
    <PageShell>
      <PageTitle title="Leaderboards" eyebrow="Who dominates the gym" />

      <div style={{ display: "flex", gap: 6, marginBottom: 32, flexWrap: "wrap" }}>
        {TABS.map(t => {
          const active = tab === t.k
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              aria-pressed={active}
              style={{
                fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "8px 16px", borderRadius: "var(--r-pill)",
                background: active ? "var(--accent)" : "var(--surface)",
                color: active ? "var(--bg)" : "var(--text-secondary)",
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`, cursor: "pointer",
                transition: "background var(--duration-fast) var(--ease-expo), color var(--duration-fast) var(--ease-expo)",
              }}
            >
              {t.l}
            </button>
          )
        })}
      </div>

      {tab === "this-week" && (
        <Card>
          <p className="label-sm" style={{ marginBottom: 16, color: "var(--text-secondary)" }}>Best lifts logged this week · Resets every Monday</p>
          {weeklyLoading ? (
            <SkeletonRows rows={6} />
          ) : (
            <Board data={weeklyData.map((r, i) => ({ ...r, rank: i + 1, weight: r.max_weight }))} vk="weight" u="kg" showEx />
          )}
        </Card>
      )}

      {(tab === "max-weight" || tab === "volume") && (
        <Card>
          {loading ? (
            <SkeletonRows rows={6} />
          ) : isError ? (
            <ErrorState message="Couldn't load rankings." onRetry={() => refetch()} />
          ) : tab === "max-weight" ? (
            <Board data={maxWeight} vk="weight" u="kg" showEx />
          ) : (
            <Board data={totalVolume} vk="volume" u="kg" />
          )}
        </Card>
      )}

      {cats.map(c => tab === `cat-${c}` && (
        <div key={c}>
          {exercises.filter(e => e.category === c).map(ex => (
            <Card key={ex.id} style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg)", textTransform: "uppercase" }}>{ex.name}</h3>
                <Link href={`/leaderboard/${ex.id}`} className="k-link">Full Board →</Link>
              </div>
              <LBTable
                data={(() => {
                  const best: Record<string, any> = {}
                  maxWeight.filter(e => e.exercise === ex.name).forEach(e => {
                    if (e.weight > (best[e.username]?.weight ?? 0)) best[e.username] = e
                  })
                  return Object.values(best).sort((a: any, b: any) => b.weight - a.weight).map((e: any, i) => ({ rank: i + 1, ...e })).slice(0, 10)
                })()}
                vk="weight"
                u="kg"
              />
            </Card>
          ))}
        </div>
      ))}
    </PageShell>
  )
}
