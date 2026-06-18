"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppNav } from "@/components/layout/nav"
import { OrbitNav } from "@/components/modes/orbit"
import { Reveal } from "@/components/ui/motion"
import { Hl } from "@/components/ui/statement"
import { useMode, type Mode } from "@/lib/mode-context"

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
  // Which mode the orbit is previewing (defaults to the live one).
  const [preview, setPreview] = useState<Mode>(mode)

  const current = MODES.find(m => m.id === preview) ?? MODES[0]
  const isLive = preview === mode

  async function activate(id: Mode) {
    await setMode(id)
    router.push("/dashboard")
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main className="k-enter" style={{ position: "relative", maxWidth: 960, margin: "0 auto", padding: "clamp(32px, 6vh, 56px) clamp(16px, 4vw, 24px)" }}>
        <span className="k-rail left" aria-hidden="true">CHOOSE YOUR ARC</span>

        <Reveal variant="fade" duration={800}>
          <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vh, 44px)" }}>
            <h1 className="k-glow-text" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 7vw, 64px)", fontWeight: 600, letterSpacing: "-0.01em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
              Training <Hl serif>mode</Hl>
            </h1>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 8 }}>
              Choose your mindset. Shape your training.
            </p>
          </div>
        </Reveal>

        {/* Orbit picker */}
        <Reveal variant="scale" delay={120} duration={800}>
          <OrbitNav
            items={MODES.map(m => ({ id: m.id, label: m.label.replace(" MODE", "").replace(" ARC", ""), color: m.color }))}
            activeId={preview}
            onSelect={(id) => setPreview(id as Mode)}
            size={460}
          />
        </Reveal>

        {/* Detail panel for the previewed mode */}
        <Reveal variant="up" delay={200} duration={700}>
          <div
            className="card-elevated card-pad"
            style={{ maxWidth: 560, margin: "clamp(28px, 5vh, 44px) auto 0", textAlign: "center", borderTop: `2px solid ${current.color}` }}
          >
            <div aria-hidden="true" style={{ width: 36, height: 4, background: current.color, margin: "0 auto 18px", borderRadius: "var(--r-pill)", boxShadow: `0 0 18px ${current.color}` }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: current.color, lineHeight: 1 }}>
              {current.label}
            </h2>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: current.color, marginTop: 8 }}>
              {current.tagline}
            </p>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, marginTop: 16, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
              {current.description}
            </p>
            <p style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", fontSize: "clamp(15px, 2.4vw, 19px)", color: "var(--fg)", lineHeight: 1.5, margin: "20px auto 24px", maxWidth: 440 }}>
              &ldquo;{current.quote}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => activate(current.id)}
              disabled={isLive}
              style={{
                padding: "13px 36px",
                fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                background: isLive ? current.color : "transparent",
                color: isLive ? "var(--bg)" : current.color,
                border: `1px solid ${current.color}`,
                borderRadius: "var(--r-pill)",
                cursor: isLive ? "default" : "pointer",
                boxShadow: isLive ? `0 0 24px color-mix(in oklch, ${current.color} 40%, transparent)` : "none",
                transition: "all var(--duration-normal) var(--ease-expo)",
              }}
            >
              {isLive ? "Active mode" : "Activate"}
            </button>
          </div>
        </Reveal>
      </main>
    </div>
  )
}
