"use client"

import type { CSSProperties } from "react"
import { AnimatedNumber } from "@/components/ui/kinetic"

/**
 * StatBar — a horizontal strip of count-up stats (NUORBIT / AgentAI). Each
 * number reuses `AnimatedNumber` so it counts up the first time it scrolls into
 * view (reduced-motion safe). Suffix (e.g. "K+", "%") sits in accent.
 */
export type Stat = { value: number; suffix?: string; label: string }

export function StatBar({
  stats,
  className,
  style,
}: {
  stats: Stat[]
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={className}
      style={{ display: "flex", flexWrap: "wrap", gap: "clamp(22px, 5vw, 56px)", alignItems: "baseline", ...style }}
    >
      {stats.map((s, i) => (
        <div key={i}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <AnimatedNumber value={s.value} delay={i * 120} className="k-stat" />
            {s.suffix && <span className="k-stat" style={{ color: "var(--accent)" }}>{s.suffix}</span>}
          </div>
          <p className="k-eyebrow" style={{ marginTop: 6 }}>{s.label}</p>
        </div>
      ))}
    </div>
  )
}
