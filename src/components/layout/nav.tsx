"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus } from "lucide-react"
import { useMode } from "@/lib/mode-context"

const NAV_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/journal", label: "Journal" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/workouts", label: "Workouts" },
  { href: "/competitions", label: "Compete" },
  { href: "/leaderboard", label: "Ranks" },
  { href: "/squads", label: "Squads" },
  { href: "/routines", label: "Routines" },
  { href: "/athletes", label: "Athletes" },
  { href: "/modes", label: "Mode" },
  { href: "/progress", label: "Progress" },
]

export function AppNav() {
  const pathname = usePathname()
  const { mode } = useMode()

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "oklch(0.14 0.005 260 / 0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <Link href="/dashboard" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 16, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "var(--fg)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          PUMPS
          {mode !== "default" && (
            <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", padding: "2px 6px", border: "1px solid var(--accent)" }}>
              {mode.toUpperCase()}
            </span>
          )}
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
          {NAV_LINKS.map(l => {
            const isActive = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href + "/"))
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                  textTransform: "uppercase", color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  textDecoration: "none", padding: "8px 12px", transition: "color 100ms", whiteSpace: "nowrap",
                }}
              >
                {l.label}
              </Link>
            )
          })}
          <Link href="/workouts/new" className="btn-primary" style={{ marginLeft: 12, fontSize: 11, padding: "8px 14px" }}>
            <Plus size={12} aria-hidden="true" /> LOG
          </Link>
        </nav>
      </div>
    </header>
  )
}
