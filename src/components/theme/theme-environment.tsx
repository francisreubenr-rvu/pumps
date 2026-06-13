"use client"

import { useEffect, useRef } from "react"
import { useMode, type Mode } from "@/lib/mode-context"

/* ════════════════════════════════════════════════════════════════════════
   THEME ENVIRONMENT
   A global, fixed background system that gives every motivation mode its own
   distinct living atmosphere. Two layers per mode:
     1. <Scenery>       — fixed z-0 backdrop (gradients + SVG scenery). Sits
                          behind all page content (content is z-1).
     2. <ParticleField> — fixed z-55 canvas overlay (snow / embers / confetti /
                          motes) that glides ACROSS the screen, above content
                          but below the nav (z-90). pointer-events: none.
   Mounted once in the root layout, inside <ModeProvider>.
   ════════════════════════════════════════════════════════════════════════ */

export function ThemeEnvironment() {
  const { mode } = useMode()
  return (
    <>
      <Scenery mode={mode} />
      <ParticleField mode={mode} />
    </>
  )
}

/* ─── Layer 1: scenery backdrop ─────────────────────────────────────────── */
function Scenery({ mode }: { mode: Mode }) {
  const base: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    overflow: "hidden",
  }

  if (mode === "monk") {
    return (
      <div aria-hidden style={base}>
        {/* Deep indigo void with a slow breathing focus glow — silence + discipline */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(40,38,90,0.5) 0%, rgba(8,8,20,0) 65%)" }} />
        <div className="monk-breathe" style={{
          position: "absolute", left: "50%", top: "42%", transform: "translate(-50%,-50%)",
          width: "min(70vw, 720px)", height: "min(70vw, 720px)", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(120,110,255,0.16) 0%, rgba(80,70,200,0.05) 40%, transparent 70%)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% 120%, rgba(0,0,8,0.6) 0%, transparent 55%)" }} />
      </div>
    )
  }

  if (mode === "revenge") {
    return (
      <div aria-hidden style={base}>
        {/* Smouldering crimson glow rising from below — controlled rage */}
        <div className="revenge-pulse" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 70% at 50% 118%, rgba(200,28,20,0.30) 0%, rgba(120,10,8,0.10) 35%, transparent 62%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 80% 12%, rgba(160,20,16,0.12) 0%, transparent 55%)" }} />
        {/* Heat vignette */}
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 220px 60px rgba(80,0,0,0.55)" }} />
      </div>
    )
  }

  if (mode === "happy") {
    return (
      <div aria-hidden style={base}>
        {/* Warm sunrise — joy, light, good vibes */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(40,20,55,0) 0%, rgba(80,40,70,0.18) 55%, rgba(255,150,70,0.22) 100%)" }} />
        <div className="happy-sun" style={{
          position: "absolute", left: "50%", bottom: "-22vh", transform: "translateX(-50%)",
          width: "min(120vw, 1100px)", height: "min(120vw, 1100px)", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,210,120,0.40) 0%, rgba(255,140,90,0.18) 30%, transparent 60%)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 22% 14%, rgba(255,120,180,0.14) 0%, transparent 55%)" }} />
      </div>
    )
  }

  if (mode === "winter") {
    return (
      <div aria-hidden style={base}>
        {/* Cold high-altitude sky */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,16,32,1) 0%, rgba(20,40,70,0.65) 45%, rgba(120,160,200,0.30) 100%)" }} />
        {/* Faint aurora drifting over the peaks */}
        <div className="winter-aurora" style={{
          position: "absolute", top: "6%", left: "-20%", right: "-20%", height: "38vh",
          background: "linear-gradient(90deg, transparent, rgba(120,220,210,0.16), rgba(150,180,255,0.20), rgba(120,220,210,0.14), transparent)",
          filter: "blur(28px)",
        }} />
        {/* The Himalayas — layered ridgelines with snow caps */}
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* Far range */}
          <path d="M0 600 L0 360 L150 300 L320 380 L480 250 L640 360 L820 230 L1010 350 L1200 270 L1340 360 L1440 320 L1440 600 Z" fill="#2a3c58" opacity="0.55" />
          {/* Mid range */}
          <path d="M0 600 L0 430 L180 340 L360 440 L520 320 L700 440 L900 300 L1080 430 L1260 350 L1440 440 L1440 600 Z" fill="#1b2940" opacity="0.85" />
          {/* Near range with snow caps */}
          <path d="M0 600 L0 500 L260 380 L470 510 L680 360 L900 520 L1140 400 L1340 520 L1440 470 L1440 600 Z" fill="#0e1626" />
          {/* Snow on the near peaks */}
          <path d="M260 380 L300 410 L240 412 Z M680 360 L728 396 L632 398 Z M1140 400 L1182 430 L1098 432 Z" fill="#e8f1ff" opacity="0.9" />
        </svg>
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 200px 40px rgba(10,30,60,0.5)" }} />
      </div>
    )
  }

  // default — let the global body::before mesh show; add a faint depth vignette only
  return (
    <div aria-hidden style={base}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 70% at 50% 0%, color-mix(in oklab, var(--accent) 5%, transparent) 0%, transparent 55%)" }} />
    </div>
  )
}

/* ─── Layer 2: particle overlay ─────────────────────────────────────────── */

type P = {
  x: number; y: number; vy: number; vx: number;
  size: number; phase: number; spin: number; rot: number; color: string; alpha: number;
}

function ParticleField({ mode }: { mode: Mode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (mode === "default") return // keep the standard mode clean & fast
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + "px"
      canvas.style.height = h + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const mobile = w < 640
    const rnd = (a: number, b: number) => a + Math.random() * (b - a)

    const HAPPY_COLORS = ["#ffd166", "#ff6b9d", "#7bdff2", "#b8f28b", "#c8a2ff", "#ff8c42"]

    // ── Build the particle pool for the active mode ──────────────────────
    let particles: P[] = []
    const init = () => {
      const n =
        mode === "winter" ? (mobile ? 70 : 150) :
        mode === "revenge" ? (mobile ? 50 : 95) :
        mode === "happy" ? (mobile ? 55 : 110) :
        /* monk */ (mobile ? 32 : 60)

      particles = Array.from({ length: n }, () => {
        if (mode === "winter") {
          return { x: rnd(0, w), y: rnd(-h, h), vy: rnd(0.4, 1.5), vx: 0, size: rnd(1, 3.2), phase: rnd(0, Math.PI * 2), spin: rnd(0.006, 0.018), rot: 0, color: "#ffffff", alpha: rnd(0.35, 0.95) }
        }
        if (mode === "revenge") {
          return { x: rnd(0, w), y: rnd(0, h), vy: rnd(0.5, 1.7), vx: 0, size: rnd(1, 2.6), phase: rnd(0, Math.PI * 2), spin: rnd(0.02, 0.05), rot: 0, color: "ember", alpha: rnd(0.4, 1) }
        }
        if (mode === "happy") {
          return { x: rnd(0, w), y: rnd(-h, h), vy: rnd(1.0, 2.6), vx: 0, size: rnd(4, 9), phase: rnd(0, Math.PI * 2), spin: rnd(-0.08, 0.08), rot: rnd(0, Math.PI * 2), color: HAPPY_COLORS[Math.floor(rnd(0, HAPPY_COLORS.length))], alpha: rnd(0.7, 1) }
        }
        // monk — slow drifting motes
        return { x: rnd(0, w), y: rnd(0, h), vy: rnd(0.1, 0.4), vx: 0, size: rnd(0.8, 2.2), phase: rnd(0, Math.PI * 2), spin: rnd(0.003, 0.008), rot: 0, color: "#aab4ff", alpha: rnd(0.05, 0.22) }
      })
    }
    init()

    let raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.phase += p.spin

        if (mode === "winter") {
          // Snow falling with a steady left→right breeze + gentle sway
          p.x += Math.sin(p.phase) * 0.6 + 0.5
          p.y += p.vy
          if (p.y > h + 6) { p.y = -6; p.x = rnd(0, w) }
          if (p.x > w + 6) p.x = -6
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${p.alpha})`
          ctx.fill()
        } else if (mode === "revenge") {
          // Embers rising from the floor, flickering, fading as they climb
          p.y -= p.vy
          p.x += Math.sin(p.phase) * 0.5
          const flick = 0.55 + 0.45 * Math.sin(p.phase * 3)
          const lifeAlpha = Math.max(0, Math.min(1, p.y / h))
          if (p.y < -8) { p.y = h + rnd(0, 40); p.x = rnd(0, w) }
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,${Math.floor(90 + 70 * flick)},30,${p.alpha * flick * lifeAlpha})`
          ctx.shadowBlur = 8
          ctx.shadowColor = "rgba(255,80,20,0.8)"
          ctx.fill()
          ctx.shadowBlur = 0
        } else if (mode === "happy") {
          // Confetti fluttering down + swaying side to side
          p.y += p.vy
          p.x += Math.sin((p.y + p.phase * 40) * 0.02) * 1.3
          p.rot += p.spin
          if (p.y > h + 12) { p.y = -12; p.x = rnd(0, w) }
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5)
          ctx.restore()
          ctx.globalAlpha = 1
        } else {
          // monk — motes drifting slowly upward, meditative
          p.y -= p.vy
          p.x += Math.sin(p.phase) * 0.2
          if (p.y < -6) { p.y = h + 6; p.x = rnd(0, w) }
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(170,185,255,${p.alpha})`
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      ctx.clearRect(0, 0, w, h)
    }
  }, [mode])

  if (mode === "default") return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0, // sized to the layout viewport via resize() — avoids 100vw scrollbar overflow
        zIndex: 55,
        pointerEvents: "none",
      }}
    />
  )
}
