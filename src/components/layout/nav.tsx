"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, Menu, X } from "lucide-react"
import { useMode } from "@/lib/mode-context"
import { useState, useEffect } from "react"

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
  { href: "/playlists", label: "Playlists" },
  { href: "/progress", label: "Progress" },
]

export function AppNav() {
  const pathname = usePathname()
  const { mode } = useMode()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  return (
    <>
      <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "oklch(0.14 0.005 260 / 0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--border)", paddingTop: "env(safe-area-inset-top)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
          <Link href="/dashboard" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 16, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "var(--fg)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            PUMPS
            {mode !== "default" && (
              <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", padding: "2px 6px", border: "1px solid var(--accent)" }}>
                {mode.toUpperCase()}
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="nav-desktop">
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

          {/* Mobile controls */}
          <div className="nav-mobile" style={{ alignItems: "center", gap: 12 }}>
            <Link href="/workouts/new" className="btn-primary" style={{ fontSize: 11, padding: "8px 12px" }}>
              <Plus size={12} aria-hidden="true" /> LOG
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              style={{ background: "none", border: "none", color: "var(--fg)", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            backgroundColor: "var(--bg)",
            display: "flex", flexDirection: "column",
            padding: "20px 24px",
            paddingTop: "max(20px, env(safe-area-inset-top))",
            paddingBottom: "max(24px, env(safe-area-inset-bottom))",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)" }}>
              PUMPS
              {mode !== "default" && (
                <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", padding: "2px 8px", border: "1px solid var(--accent)", marginLeft: 10, verticalAlign: "middle" }}>
                  {mode.toUpperCase()}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              style={{ background: "none", border: "none", color: "var(--fg)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
            >
              <X size={24} />
            </button>
          </div>

          <nav style={{ flex: 1 }}>
            {NAV_LINKS.map(l => {
              const isActive = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href + "/"))
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    display: "block",
                    fontFamily: "var(--font-display)", fontSize: "clamp(32px, 9vw, 48px)", fontWeight: 600, letterSpacing: "-0.02em",
                    textTransform: "uppercase",
                    color: isActive ? "var(--accent)" : "var(--fg)",
                    textDecoration: "none",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border)",
                    lineHeight: 1.1,
                    transition: "color 100ms",
                  }}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>

          <Link
            href="/workouts/new"
            className="btn-primary"
            style={{ fontSize: 14, padding: "16px 0", width: "100%", justifyContent: "center", marginTop: 24, gap: 8 }}
          >
            <Plus size={16} aria-hidden="true" /> LOG WORKOUT
          </Link>
        </div>
      )}
    </>
  )
}
