"use client"

import { useState } from "react"
import Link from "next/link"
import { Crown, Medal } from "lucide-react"
import { AppNav } from "@/components/layout/nav"
import { Podium } from "@/components/leaderboard/podium"
import { useLeaderboard, useWeeklyLeaderboard, currentWeekStart } from "@/lib/queries/leaderboard"

function LBTable({ data, vk, u, showEx }: { data: any[]; vk: string; u: string; showEx?: boolean }) {
  if (!data || data.length === 0) return (
    <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)", padding: "20px 0", textAlign: "center" }}>No rankings yet — log a completed workout to claim a spot.</p>
  )
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["#", "Athlete", ...(showEx ? ["Exercise"] : []), "Best"].map(h => (
            <th key={h} style={{ textAlign: h === "Best" ? "right" : "left", padding: "8px 0", fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((e: any) => (
          <tr key={e.rank} style={{ borderTop: "1px solid var(--border)" }}>
            <td style={{ padding: "10px 0", width: 32 }}>
              {e.rank === 1 ? <Crown size={14} style={{ color: "var(--accent)" }} aria-label="1st" /> :
               e.rank === 2 ? <Medal size={14} style={{ color: "var(--text-secondary)" }} aria-label="2nd" /> :
               e.rank === 3 ? <Medal size={14} style={{ color: "var(--accent-blue)" }} aria-label="3rd" /> :
               <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)" }}>{e.rank}</span>}
            </td>
            <td style={{ padding: "10px 8px" }}>
              <Link href={`/profile/${e.username}`} style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, color: "var(--fg)", textDecoration: "none", textTransform: "uppercase" }}>
                {e.username}
              </Link>
            </td>
            {showEx && <td style={{ padding: "10px 8px", fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)" }}>{e.exercise}</td>}
            <td style={{ padding: "10px 0", textAlign: "right" }}>
              <span className="badge">{Math.round(e[vk]).toLocaleString()} {u}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
  const loadError = isError ? "Couldn't load rankings. Please try again." : ""

  const cats = [...new Set(exercises.map(e => e.category))]

  const TABS = [
    { k: "this-week", l: "THIS WEEK · resets Mon" },
    { k: "max-weight", l: "MAX WEIGHT" },
    { k: "volume", l: "TOTAL VOLUME" },
    ...cats.map(c => ({ k: `cat-${c}`, l: c.toUpperCase() })),
  ]

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}>
        <p className="k-eyebrow" style={{ color: "var(--accent)", marginBottom: 8 }}>Who dominates the gym</p>
        <h1 style={{ fontFamily: "var(--font-heading-stack)", fontSize: "clamp(30px, 4.5vw, 44px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--fg)", lineHeight: 1.05, marginBottom: 32 }}>
          Leaderboards
        </h1>

        <div style={{ display: "flex", gap: 2, marginBottom: 32, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              style={{
                fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "8px 16px", background: tab === t.k ? "var(--accent)" : "var(--surface)",
                color: tab === t.k ? "var(--bg)" : "var(--text-secondary)", border: "1px solid var(--border)", cursor: "pointer",
              }}
            >
              {t.l}
            </button>
          ))}
        </div>

        {tab === "this-week" && (
          <div className="card-surface" style={{ padding: 24 }}>
            <p className="label-sm" style={{ marginBottom: 16, color: "var(--text-secondary)" }}>Best lifts logged this week · Resets every Monday</p>
            {weeklyLoading ? (
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)" }}>Loading…</p>
            ) : (
              <Board data={weeklyData.map((r, i) => ({ ...r, rank: i + 1, weight: r.max_weight }))} vk="weight" u="kg" showEx />
            )}
          </div>
        )}

        {(tab === "max-weight" || tab === "volume") && (
          <div className="card-surface" style={{ padding: 24 }}>
            {loading ? (
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)", padding: "20px 0", textAlign: "center" }}>Loading…</p>
            ) : loadError ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--accent-red)", marginBottom: 12 }}>{loadError}</p>
                <button onClick={() => refetch()} className="btn-outline" style={{ fontSize: 11, padding: "8px 16px" }}>Retry</button>
              </div>
            ) : tab === "max-weight" ? (
              <Board data={maxWeight} vk="weight" u="kg" showEx />
            ) : (
              <Board data={totalVolume} vk="volume" u="kg" />
            )}
          </div>
        )}

        {cats.map(c => tab === `cat-${c}` && (
          <div key={c}>
            {exercises.filter(e => e.category === c).map(ex => (
              <div key={ex.id} className="card-surface" style={{ padding: 24, marginTop: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg)", textTransform: "uppercase" }}>{ex.name}</h3>
                  <Link href={`/leaderboard/${ex.id}`} style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", textDecoration: "none" }}>
                    Full Board →
                  </Link>
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
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  )
}
