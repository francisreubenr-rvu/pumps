"use client"

import Link from "next/link"

type Entry = { rank: number; username: string; [k: string]: any }

function initials(name: string): string {
  return (name || "?").replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?"
}

// 2nd (silver) · 1st (accent, tallest) · 3rd (bronze) — rendered in that visual order.
const SLOTS = [
  { rank: 2, height: 54, ring: "#C0C0C8", avatar: 48, name: 12, accent: false },
  { rank: 1, height: 74, ring: "var(--accent)", avatar: 58, name: 13, accent: true },
  { rank: 3, height: 42, ring: "#CD7F4A", avatar: 48, name: 12, accent: false },
]

/**
 * Top-3 podium (design blueprint, Screen 04). Accent (gold) follows the active
 * mode. Slots with no entry are skipped, so it degrades for boards with <3
 * athletes. `vk` is the value field on each entry; `u` its unit.
 */
export function Podium({ data, vk, u }: { data: Entry[]; vk: string; u: string }) {
  const byRank = (r: number) => data.find((d) => d.rank === r)

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 10,
        padding: "24px 12px 8px",
        background: "radial-gradient(80% 100% at 50% 0%, color-mix(in oklch, var(--accent) 7%, transparent), transparent 70%)",
      }}
    >
      {SLOTS.map((slot) => {
        const e = byRank(slot.rank)
        if (!e) return null
        const ringColor = slot.accent ? "var(--accent)" : slot.ring
        return (
          <div key={slot.rank} style={{ textAlign: "center", flex: 1, maxWidth: slot.accent ? 112 : 100 }}>
            <Link href={`/profile/${e.username}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  width: slot.avatar,
                  height: slot.avatar,
                  margin: "0 auto 8px",
                  borderRadius: "50%",
                  background: "var(--surface-elevated)",
                  border: `2px solid ${ringColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-heading-stack)",
                  fontWeight: 700,
                  fontSize: slot.accent ? 18 : 16,
                  color: slot.accent ? "var(--accent)" : "var(--fg)",
                  boxShadow: slot.accent ? "0 0 22px color-mix(in oklch, var(--accent) 40%, transparent)" : "none",
                }}
              >
                {initials(e.username)}
              </div>
              <div style={{ fontFamily: "var(--font-heading-stack)", fontSize: slot.name, fontWeight: 600, color: slot.accent ? "var(--accent)" : "var(--fg)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                {e.username}
              </div>
            </Link>
            <div style={{ fontFamily: "var(--font-display)", fontSize: slot.accent ? 26 : 22, fontWeight: 600, color: slot.accent ? "var(--fg)" : "var(--text-secondary)", lineHeight: 1.1 }}>
              {Math.round(e[vk]).toLocaleString()}
              <span style={{ fontSize: 12, color: "var(--text-secondary)", marginLeft: 2 }}>{u}</span>
            </div>
            <div
              style={{
                marginTop: 6,
                height: slot.height,
                borderRadius: "10px 10px 0 0",
                border: `1px solid color-mix(in oklch, ${ringColor} 35%, transparent)`,
                borderBottom: "none",
                background: `linear-gradient(180deg, color-mix(in oklch, ${ringColor} 22%, transparent), transparent)`,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: 7,
                fontFamily: "var(--font-display)",
                fontSize: slot.accent ? 24 : 20,
                color: ringColor,
              }}
            >
              {slot.rank}
            </div>
          </div>
        )
      })}
    </div>
  )
}
