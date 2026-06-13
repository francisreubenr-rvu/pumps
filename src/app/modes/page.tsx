"use client"

import { useRouter } from "next/navigation"
import { AppNav } from "@/components/layout/nav"
import { useMode, type Mode } from "@/lib/mode-context"
import { Check } from "lucide-react"

const MODES: { id: Mode; label: string; tagline: string; description: string; quote: string; color: string }[] = [
  {
    id: "default",
    label: "STANDARD",
    tagline: "BALANCED TRAINING",
    description: "The default mode. Clean, focused, no gimmicks.",
    quote: "Consistency is the foundation of mastery.",
    color: "oklch(0.85 0.22 130)",
  },
  {
    id: "monk",
    label: "MONK MODE",
    tagline: "DISCIPLINE IS FREEDOM",
    description: "Zero distractions. Maximum focus. Everything non-essential is cut.",
    quote: "Suffer the pain of discipline or the pain of regret.",
    color: "oklch(0.55 0.12 275)",
  },
  {
    id: "revenge",
    label: "REVENGE ARC",
    tagline: "THEY DOUBTED YOU. REMEMBER THAT.",
    description: "Train with something to prove. Use the anger as fuel.",
    quote: "The best revenge is massive success.",
    color: "oklch(0.60 0.25 25)",
  },
  {
    id: "winter",
    label: "WINTER ARC",
    tagline: "THE GRIND DOESN'T STOP",
    description: "Off-season. No excuses. When others rest, you build.",
    quote: "Be willing to do what others won't so you can have what others don't.",
    color: "oklch(0.80 0.05 240)",
  },
  {
    id: "happy",
    label: "HAPPY ARC",
    tagline: "ENJOY THE JOURNEY",
    description: "Train for joy. Movement is a gift. Progress is the reward.",
    quote: "The best workout is the one you enjoy doing.",
    color: "oklch(0.85 0.20 80)",
  },
]

export default function ModesPage() {
  const { mode, setMode } = useMode()
  const router = useRouter()

  async function activate(id: Mode) {
    await setMode(id)
    router.push("/dashboard")
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
            Training Mode
          </h1>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 4 }}>
            Choose your mindset. Shape your training.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 2 }}>
          {MODES.map(m => {
            const isActive = mode === m.id
            return (
              <div
                key={m.id}
                className="card-surface"
                style={{
                  padding: 28,
                  border: isActive ? `2px solid ${m.color}` : "1px solid var(--border)",
                  position: "relative",
                  transition: "border-color 150ms",
                }}
              >
                {isActive && (
                  <div style={{ position: "absolute", top: 16, right: 16, width: 20, height: 20, background: m.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={12} style={{ color: "var(--bg)" }} aria-hidden="true" />
                  </div>
                )}

                {/* Color swatch */}
                <div style={{ width: 32, height: 4, background: m.color, marginBottom: 20 }} />

                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: isActive ? m.color : "var(--fg)", lineHeight: 1, marginBottom: 6 }}>
                  {m.label}
                </h2>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: m.color, marginBottom: 12 }}>
                  {m.tagline}
                </p>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                  {m.description}
                </p>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 24, borderLeft: `2px solid ${m.color}`, paddingLeft: 12 }}>
                  "{m.quote}"
                </p>

                <button
                  type="button"
                  onClick={() => activate(m.id)}
                  disabled={isActive}
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    background: isActive ? m.color : "transparent",
                    color: isActive ? "var(--bg)" : m.color,
                    border: `1px solid ${m.color}`,
                    cursor: isActive ? "default" : "pointer",
                    transition: "all 100ms",
                  }}
                >
                  {isActive ? "Active" : "Activate"}
                </button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
