"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

/* ════════════════════════════════════════════════════════════════════
   PUMPS — Frontend Rebuild (faithful React port of the design document)
   Refined dark, ~70% minimalist / 30% energetic. Premium dark, surgical
   lime accent, 5 motivation modes re-theming one --accent source.
   ════════════════════════════════════════════════════════════════════ */

const SAIRA = "var(--font-saira), system-ui, sans-serif"
const TEKO = "var(--font-teko), system-ui, sans-serif"

type Mode = {
  key: string
  label: string
  tagline: string
  accent: string
  ink: string
  bg: string
  surf: string
  glow: string
  desc: string
}

const MODES: Mode[] = [
  { key: "default", label: "Standard", tagline: "Overview", accent: "#CCFF00", ink: "#08090B", bg: "#0A0B0D", surf: "rgba(255,255,255,0.04)", glow: "rgba(204,255,0,0.30)", desc: "Default training mode." },
  { key: "monk", label: "Monk Mode", tagline: "Discipline is freedom", accent: "#7C8BFF", ink: "#070912", bg: "#0A0C18", surf: "rgba(124,139,255,0.06)", glow: "rgba(124,139,255,0.30)", desc: "Zero distractions. Pure focus." },
  { key: "revenge", label: "Revenge Arc", tagline: "They doubted you", accent: "#FF4A3D", ink: "#fff", bg: "#150708", surf: "rgba(255,74,61,0.07)", glow: "rgba(255,74,61,0.30)", desc: "Train with something to prove." },
  { key: "winter", label: "Winter Arc", tagline: "The grind doesn't stop", accent: "#AECBE8", ink: "#0A1018", bg: "#0A1018", surf: "rgba(174,203,232,0.06)", glow: "rgba(174,203,232,0.28)", desc: "Off-season. No excuses." },
  { key: "happy", label: "Happy Arc", tagline: "Enjoy the journey", accent: "#FFC24B", ink: "#1a1205", bg: "#140E08", surf: "rgba(255,194,75,0.07)", glow: "rgba(255,194,75,0.30)", desc: "Train for joy. Progress is the reward." },
]

const STYLES = `
  .pr-root::selection { background:#CCFF00; color:#000; }
  @keyframes pumpFloat { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-7px); } }
  .pr-dcp:hover { box-shadow:0 0 26px rgba(204,255,0,0.35); transform:translateY(-1px); }
  .pr-dcs:hover { border-color:rgba(204,255,0,0.5); background:rgba(204,255,0,0.06); }
  .pr-dcg:hover { color:#CCFF00; }
  .pr-dci:focus { border-color:#CCFF00; box-shadow:0 0 0 3px rgba(204,255,0,0.16); }
  .pr-step:hover { border-color:#CCFF00; color:#CCFF00; }
  .pr-log:hover { box-shadow:0 0 28px rgba(204,255,0,0.35); }
  .pr-log:active { transform:scale(0.98); }
  .pr-add:hover { border-color:#CCFF00; color:#CCFF00; }
  .pr-cta:hover { box-shadow:0 0 26px rgba(204,255,0,0.35); }
  @media (max-width: 720px) { .pr-mode-grid { grid-template-columns: 1fr !important; } }
  @media (prefers-reduced-motion: reduce) { .pr-root * { animation:none !important; transition-duration:.01ms !important; } }
`

// shared style fragments ------------------------------------------------
const frame: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, overflow: "hidden",
  background: "#0A0B0D", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)",
}
const phoneFrame: CSSProperties = {
  width: 296, flexShrink: 0, border: "9px solid #16181d", borderRadius: 42, overflow: "hidden",
  background: "#0A0B0D", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)", position: "relative",
}
const notch: CSSProperties = {
  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
  width: 120, height: 26, background: "#16181d", borderRadius: "0 0 16px 16px", zIndex: 5,
}
const tile = (extra?: CSSProperties): CSSProperties => ({
  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16,
  background: "rgba(255,255,255,0.02)", ...extra,
})
const microLabel = (color = "#5C5E66"): CSSProperties => ({
  fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color,
})
const sectionEyebrow: CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#CCFF00" }
const h2: CSSProperties = { margin: "6px 0 8px", fontSize: "clamp(26px,3.6vw,42px)", fontWeight: 600, letterSpacing: "-0.03em" }
const sectionLead: CSSProperties = { margin: 0, maxWidth: "56ch", fontSize: 16, lineHeight: 1.6, color: "#9A9CA3" }
const divider = (
  <div style={{ maxWidth: 1180, margin: "0 auto", padding: "8px clamp(20px,5vw,40px)" }}>
    <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)" }} />
  </div>
)
const screenHeader = (n: string, title: string, sub: string, badge?: string) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
    <span style={{ fontFamily: TEKO, fontSize: 30, fontWeight: 600, color: "#5C5E66", lineHeight: 1 }}>{n}</span>
    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", color: "#F4F5F6" }}>{title}</span>
    <span style={{ fontSize: 12, color: "#5C5E66" }}>{sub}</span>
    {badge && (
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 7, background: "rgba(204,255,0,0.16)", color: "#CCFF00" }}>{badge}</span>
    )}
  </div>
)
const liveBadge = (anim = false) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 7, background: "rgba(255,74,61,0.14)", color: "#FF6A5D" }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF4A3D", ...(anim ? { animation: "pumpFloat 1.6s ease-in-out infinite" } : {}) }} />Live
  </span>
)
const macroBar = (label: string, value: string, pct: string, color: string) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}</span><span style={{ color: "#9A9CA3" }}>{value}</span>
    </div>
    <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
      <div style={{ width: pct, height: "100%", background: color, borderRadius: 999 }} />
    </div>
  </div>
)

export default function RebuildPage() {
  // interactive workout logger -----------------------------------------
  const [logWeight, setLogWeight] = useState(80)
  const [logReps, setLogReps] = useState(8)
  const [sets, setSets] = useState([
    { n: 1, kg: 80, reps: 10 },
    { n: 2, kg: 80, reps: 9 },
  ])
  const nextSet = sets.length + 1
  const adjW = (d: number) => setLogWeight((w) => Math.max(0, w + d))
  const adjR = (d: number) => setLogReps((r) => Math.max(0, r + d))
  const logSet = () => setSets((s) => [...s, { n: s.length + 1, kg: logWeight, reps: logReps }])

  // interactive mode switcher (imperative paint, like the design) -------
  const [mode, setMode] = useState("default")
  const modeRoot = useRef<HTMLDivElement>(null)
  const active = MODES.find((m) => m.key === mode) ?? MODES[0]

  useEffect(() => {
    const el = modeRoot.current
    if (!el) return
    const c = active
    el.querySelectorAll<HTMLElement>("[data-mode]").forEach((btn) => {
      const m2 = MODES.find((m) => m.key === btn.dataset.mode)
      const on = btn.dataset.mode === mode
      btn.style.background = on ? c.accent : "transparent"
      btn.style.color = on ? c.ink : "#9A9CA3"
      btn.style.boxShadow = on ? "0 0 22px " + c.glow : "none"
      const dot = btn.querySelector<HTMLElement>("[data-dot]")
      if (dot) dot.style.background = on ? c.ink : m2 ? m2.accent : "#9A9CA3"
    })
    el.querySelectorAll<HTMLElement>("[data-paint]").forEach((n) => {
      switch (n.dataset.paint) {
        case "bg": n.style.background = c.bg; break
        case "surf": n.style.background = c.surf; break
        case "accent-color": n.style.color = c.accent; break
        case "accent-border": n.style.color = c.accent; n.style.borderColor = c.accent; break
        case "accent-ink-bg": n.style.background = c.accent; n.style.color = c.ink; break
        case "accent-swatch": n.style.background = c.accent; n.style.boxShadow = "0 0 26px " + c.glow; break
        case "accent-bar": n.style.background = c.accent; n.style.boxShadow = "0 0 20px " + c.glow; break
        case "glow-radial": n.style.background = "radial-gradient(110% 90% at 90% -10%, " + c.glow + ", transparent 55%)"; break
      }
    })
  }, [mode, active])

  return (
    <div className="pr-root" style={{ background: "#08090B", color: "#F4F5F6", fontFamily: SAIRA, WebkitFontSmoothing: "antialiased", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "clamp(64px,11vw,150px) clamp(20px,5vw,40px) clamp(56px,8vw,96px)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 82% -10%, rgba(204,255,0,0.10) 0%, transparent 55%), radial-gradient(90% 60% at 10% 110%, rgba(90,80,220,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(120% 90% at 50% 0%,#000 30%,transparent 75%)", WebkitMaskImage: "radial-gradient(120% 90% at 50% 0%,#000 30%,transparent 75%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 12px 6px 8px", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 999, background: "rgba(255,255,255,0.03)", marginBottom: 30 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#CCFF00", boxShadow: "0 0 12px 1px rgba(204,255,0,0.7)" }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9CA3", whiteSpace: "nowrap" }}>PUMPS · Frontend Rebuild · v2</span>
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(40px,7.2vw,92px)", lineHeight: 0.96, fontWeight: 600, letterSpacing: "-0.045em", maxWidth: "14ch" }}>Premium dark.<br /><span style={{ color: "#CCFF00" }}>Surgical</span> energy.</h1>
          <p style={{ margin: "26px 0 0", maxWidth: "56ch", fontSize: "clamp(15px,1.7vw,19px)", lineHeight: 1.6, color: "#9A9CA3", fontWeight: 400 }}>A complete visual rebuild of the PUMPS training app. We keep the dark, kinetic DNA — but trade shouting for confidence: real radii, generous space, sentence-case clarity, and the lime accent used like a scalpel, not a highlighter. Five motivation modes re-theme the whole system live, without a flicker.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 38 }}>
            {[
              { v: <>70<span style={{ color: "#5C5E66", fontSize: 26 }}>/</span>30</>, c: "#F4F5F6", d: "Minimalist structure · energetic accent" },
              { v: "5", c: "#CCFF00", d: "Motivation modes, one cohesive system" },
              { v: "0→16", c: "#F4F5F6", d: "Corner radius, px — softened for premium feel" },
              { v: "AA", c: "#F4F5F6", d: "WCAG 2.1 contrast & focus, mobile-first" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, minWidth: 158, border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "20px 22px", background: "rgba(255,255,255,0.025)" }}>
                <div style={{ fontFamily: TEKO, fontSize: 46, fontWeight: 600, lineHeight: 0.9, letterSpacing: "0.01em", color: s.c }}>{s.v}</div>
                <div style={{ marginTop: 8, fontSize: 12, letterSpacing: "0.04em", color: "#9A9CA3" }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {divider}

      {/* ── 01 FOUNDATIONS ───────────────────────────────────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(48px,7vw,86px) clamp(20px,5vw,40px)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6 }}>
          <span style={sectionEyebrow}>01 — Foundations</span>
        </div>
        <h2 style={{ ...h2, margin: "0 0 8px" }}>The visual language</h2>
        <p style={{ margin: "0 0 44px", maxWidth: "54ch", fontSize: 16, lineHeight: 1.6, color: "#9A9CA3" }}>One token set. Every screen, every mode, draws from it. Consolidates the old patchwork of inline styles into a predictable, themeable scale.</p>

        <div style={{ ...microLabel(), marginBottom: 16 }}>Color · neutrals &amp; accent</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 18 }}>
          {[
            { sw: "#08090B", name: "bg / page", hex: "#08090B" },
            { sw: "#101216", name: "surface", hex: "#101216" },
            { sw: "#171A1F", name: "elevated", hex: "#171A1F" },
            { sw: "#9A9CA3", name: "ink-2", hex: "#9A9CA3" },
            { sw: "#F4F5F6", name: "ink", hex: "#F4F5F6" },
          ].map((c) => (
            <div key={c.name} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ height: 78, background: c.sw }} />
              <div style={{ padding: "11px 13px", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#5C5E66", fontVariantNumeric: "tabular-nums" }}>{c.hex}</div>
              </div>
            </div>
          ))}
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(204,255,0,0.4)", boxShadow: "0 0 28px rgba(204,255,0,0.14)" }}>
            <div style={{ height: 78, background: "#CCFF00" }} />
            <div style={{ padding: "11px 13px", background: "rgba(204,255,0,0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#CCFF00" }}>accent · lime</div>
              <div style={{ fontSize: 11, color: "#869100", fontVariantNumeric: "tabular-nums" }}>#CCFF00</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 54 }}>
          {[
            { c: "#34D17A", t: "success · #34D17A" },
            { c: "#FF4A3D", t: "danger · #FF4A3D" },
            { c: "#FFC24B", t: "warning · #FFC24B" },
            { c: "#5B8DEF", t: "info · #5B8DEF" },
          ].map((s) => (
            <div key={s.t} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 14px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
              <span style={{ width: 13, height: 13, borderRadius: 4, background: s.c }} />
              <span style={{ fontSize: 12, color: "#9A9CA3" }}>{s.t}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 40 }}>
          {/* typography */}
          <div>
            <div style={{ ...microLabel(), marginBottom: 18 }}>Typography</div>
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "26px 28px", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontFamily: TEKO, fontSize: 64, lineHeight: 0.85, fontWeight: 600, letterSpacing: "0.01em" }}>248<span style={{ fontSize: 26, color: "#5C5E66", marginLeft: 6 }}>KG</span></div>
              <div style={{ fontSize: 11, color: "#5C5E66", margin: "4px 0 22px" }}>Teko · numerals &amp; big stats</div>
              <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Train with intent</div>
              <div style={{ fontSize: 11, color: "#5C5E66", margin: "5px 0 20px" }}>Saira 600 · headings, sentence-case</div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: "#C9CACE" }}>Every set logged in under a second. Clear feedback, no clutter — the interface gets out of your way.</div>
              <div style={{ fontSize: 11, color: "#5C5E66", margin: "6px 0 20px" }}>Saira 400 · body</div>
              <div style={microLabel("#9A9CA3")}>Eyebrow · micro-label</div>
              <div style={{ fontSize: 11, color: "#5C5E66", marginTop: 5 }}>Saira 600 · uppercase, the only place we shout</div>
            </div>
          </div>
          {/* radius & spacing */}
          <div>
            <div style={{ ...microLabel(), marginBottom: 18 }}>Radius &amp; spacing</div>
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "26px 28px", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 26 }}>
                {[{ r: 8, l: "8" }, { r: 12, l: "12" }, { r: 16, l: "16" }, { r: 22, l: "22" }, { r: 999, l: "pill" }].map((x) => (
                  <div key={x.l} style={{ textAlign: "center" }}>
                    <div style={{ width: 52, height: 52, background: "rgba(204,255,0,0.14)", border: "1px solid rgba(204,255,0,0.4)", borderRadius: x.r }} />
                    <div style={{ fontSize: 10, color: "#5C5E66", marginTop: 7 }}>{x.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...microLabel(), letterSpacing: "0.14em", marginBottom: 12 }}>4px spacing scale</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                {[14, 20, 28, 38, 52, 66].map((hgt, i) => (
                  <div key={i} style={{ width: [4, 8, 12, 16, 24, 32][i], height: hgt, background: "#CCFF00", borderRadius: 2 }} />
                ))}
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: 11, color: "#5C5E66", alignSelf: "center" }}>4 · 8 · 12 · 16 · 24 · 32</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...microLabel(), margin: "54px 0 18px" }}>Components</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          {/* buttons */}
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 24, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ ...microLabel(), letterSpacing: "0.14em", marginBottom: 18 }}>Buttons</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11, alignItems: "flex-start" }}>
              <button className="pr-dcp" style={{ border: "none", cursor: "pointer", background: "#CCFF00", color: "#08090B", fontFamily: SAIRA, fontSize: 14, fontWeight: 600, padding: "11px 22px", borderRadius: 11, transition: "box-shadow .18s,transform .18s" }}>Log workout</button>
              <button className="pr-dcs" style={{ cursor: "pointer", background: "rgba(255,255,255,0.06)", color: "#F4F5F6", border: "1px solid rgba(255,255,255,0.14)", fontFamily: SAIRA, fontSize: 14, fontWeight: 600, padding: "11px 22px", borderRadius: 11, transition: "border-color .18s,background .18s" }}>Secondary</button>
              <button className="pr-dcg" style={{ cursor: "pointer", background: "transparent", color: "#9A9CA3", border: "none", fontFamily: SAIRA, fontSize: 14, fontWeight: 600, padding: "6px 4px", borderRadius: 8, transition: "color .18s" }}>Ghost action →</button>
            </div>
          </div>
          {/* input */}
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 24, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ ...microLabel(), letterSpacing: "0.14em", marginBottom: 18 }}>Input</div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9CA3", marginBottom: 8 }}>Display name</label>
            <input defaultValue="alex.lifts" className="pr-dci" style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", color: "#F4F5F6", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 11, padding: "12px 14px", fontFamily: SAIRA, fontSize: 14, outline: "none", transition: "border-color .18s,box-shadow .18s" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, padding: "7px 13px", borderRadius: 999, background: "#CCFF00", color: "#08090B", fontWeight: 600 }}>Push</span>
              <span style={{ fontSize: 12, padding: "7px 13px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#9A9CA3", border: "1px solid rgba(255,255,255,0.1)" }}>Pull</span>
              <span style={{ fontSize: 12, padding: "7px 13px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#9A9CA3", border: "1px solid rgba(255,255,255,0.1)" }}>Legs</span>
            </div>
          </div>
          {/* badges */}
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 24, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ ...microLabel(), letterSpacing: "0.14em", marginBottom: 18 }}>Badges &amp; status</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 7, background: "rgba(255,255,255,0.08)", color: "#9A9CA3" }}>Done</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 7, background: "rgba(255,74,61,0.14)", color: "#FF6A5D" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF4A3D", animation: "pumpFloat 1.6s ease-in-out infinite" }} />Live</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 7, background: "#CCFF00", color: "#08090B", whiteSpace: "nowrap" }}>New PR</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 7, background: "rgba(52,209,122,0.14)", color: "#34D17A" }}>+12%</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 18, alignItems: "center" }}>
              <span style={{ position: "relative", display: "inline-flex", width: 42, height: 24, borderRadius: 999, background: "#CCFF00", padding: 3, boxSizing: "border-box" }}><span style={{ width: 18, height: 18, borderRadius: "50%", background: "#08090B", marginLeft: "auto" }} /></span>
              <span style={{ fontSize: 13, color: "#9A9CA3" }}>Toggle · on</span>
            </div>
          </div>
        </div>
      </section>

      {divider}

      {/* ── 02 THE REBUILD — intro ───────────────────────────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(48px,7vw,86px) clamp(20px,5vw,40px) clamp(30px,4vw,48px)" }}>
        <span style={sectionEyebrow}>02 — The rebuild</span>
        <h2 style={h2}>Screens, rebuilt</h2>
        <p style={sectionLead}>Every flagship surface designed against the same tokens. Responsive by construction — the same components reflow from a 1280px desktop to a 390px phone.</p>
      </section>

      {/* ── Screen 01 · Dashboard ────────────────────────────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px,5vw,40px) clamp(40px,6vw,72px)" }}>
        {screenHeader("01", "Dashboard / Home", "— at a glance, then act")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
          {/* desktop */}
          <div style={{ ...frame, flex: 1, minWidth: 340 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 15px", background: "#101216", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
              <span style={{ marginLeft: 12, flex: 1, maxWidth: 260, fontSize: 11, color: "#5C5E66", background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: "5px 12px" }}>pumps.app/dashboard</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, letterSpacing: "-0.03em", fontSize: 16 }}>PUMPS</div>
              <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", color: "#5C5E66", overflow: "hidden" }}>
                <span style={{ color: "#CCFF00", padding: "6px 9px" }}>Home</span>
                {["Journal", "Nutrition", "Workouts", "Compete", "Ranks"].map((x) => <span key={x} style={{ padding: "6px 9px" }}>{x}</span>)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#CCFF00", color: "#08090B", fontSize: 11, fontWeight: 600, padding: "8px 13px", borderRadius: 9, whiteSpace: "nowrap" }}><span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Log</div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", padding: "26px 24px", marginBottom: 14, background: "radial-gradient(120% 140% at 88% -20%,rgba(204,255,0,0.14),transparent 55%),linear-gradient(180deg,#13161b,#0d0f13)" }}>
                <div style={{ ...microLabel("#CCFF00"), marginBottom: 10 }}>Overview · Tuesday</div>
                <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1 }}>Good evening, Alex</div>
                <div style={{ fontSize: 14, color: "#9A9CA3", marginTop: 8 }}>You&apos;re on a <span style={{ color: "#F4F5F6", fontWeight: 600 }}>12-day</span> streak. One session keeps it alive.</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                {[{ l: "Workouts", v: "86", a: false }, { l: "Volume", v: <>412<span style={{ fontSize: 18, color: "#5C5E66" }}>k</span></>, a: false }, { l: "Live comps", v: "3", a: true }, { l: "Streak", v: <>12<span style={{ fontSize: 18, color: "#5C5E66" }}>d</span></>, a: false }].map((s, i) => (
                  <div key={i} style={tile()}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#5C5E66" }}>{s.l}</div>
                    <div style={{ fontFamily: TEKO, fontSize: 38, fontWeight: 600, lineHeight: 0.9, marginTop: 8, ...(s.a ? { color: "#CCFF00" } : {}) }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...tile(), borderRadius: 16, padding: 20, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Volume history</div><div style={{ fontSize: 11, color: "#5C5E66", letterSpacing: "0.04em" }}>Last 8 weeks</div></div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 9, height: 120 }}>
                  {[44, 64, 54, 78, 70, 87, 73].map((hgt, i) => <div key={i} style={{ flex: 1, height: `${hgt}%`, background: "rgba(255,255,255,0.09)", borderRadius: "5px 5px 0 0" }} />)}
                  <div style={{ flex: 1, height: "100%", background: "#CCFF00", borderRadius: "5px 5px 0 0", boxShadow: "0 0 22px rgba(204,255,0,0.3)" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ ...tile(), borderRadius: 16, padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Recent workouts</div><div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#CCFF00" }}>All →</div></div>
                  {[{ t: "Push Day A", s: "Mar 18", b: "Done", bc: "#9A9CA3", bg: "rgba(255,255,255,0.08)" }, { t: "Leg Day", s: "Mar 16", b: "Done", bc: "#9A9CA3", bg: "rgba(255,255,255,0.08)" }, { t: "Pull Day B", s: "In progress", b: "Active", bc: "#CCFF00", bg: "rgba(204,255,0,0.16)" }].map((r, i, arr) => (
                    <div key={r.t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                      <div><div style={{ fontSize: 13, fontWeight: 600 }}>{r.t}</div><div style={{ fontSize: 11, color: "#5C5E66" }}>{r.s}</div></div>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 7, background: r.bg, color: r.bc }}>{r.b}</span>
                    </div>
                  ))}
                </div>
                <div style={{ ...tile(), borderRadius: 16, padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Active competitions</div><div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#CCFF00" }}>All →</div></div>
                  {[{ t: "March Bench Max", s: "Bench Press — 1RM" }, { t: "Squad Volume War", s: "Total volume — team" }, { t: "100 Pullup Club", s: "Reps — streak" }].map((r, i, arr) => (
                    <div key={r.t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                      <div><div style={{ fontSize: 13, fontWeight: 600 }}>{r.t}</div><div style={{ fontSize: 11, color: "#5C5E66" }}>{r.s}</div></div>
                      {liveBadge(false)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* phone */}
          <div style={phoneFrame}>
            <div style={notch} />
            <div style={{ height: 560, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "34px 18px 12px" }}>
                <span style={{ fontWeight: 700, letterSpacing: "-0.03em", fontSize: 16 }}>PUMPS</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, background: "#CCFF00", color: "#08090B", fontSize: 11, fontWeight: 600, padding: "7px 12px", borderRadius: 9 }}><span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Log</span>
              </div>
              <div style={{ padding: "0 14px" }}>
                <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", padding: "20px 18px", marginBottom: 12, background: "radial-gradient(120% 140% at 88% -20%,rgba(204,255,0,0.14),transparent 55%),linear-gradient(180deg,#13161b,#0d0f13)" }}>
                  <div style={{ ...microLabel("#CCFF00"), fontSize: 10, marginBottom: 8 }}>Overview</div>
                  <div style={{ fontSize: 23, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Good evening,<br />Alex</div>
                  <div style={{ fontSize: 12, color: "#9A9CA3", marginTop: 8 }}>12-day streak alive.</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  {[{ l: "Workouts", v: "86", a: false }, { l: "Live comps", v: "3", a: true }].map((s) => (
                    <div key={s.l} style={tile({ padding: 14 })}>
                      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#5C5E66" }}>{s.l}</div>
                      <div style={{ fontFamily: TEKO, fontSize: 34, fontWeight: 600, lineHeight: 0.9, marginTop: 6, ...(s.a ? { color: "#CCFF00" } : {}) }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ ...tile(), borderRadius: 16, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 14 }}>This week</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 80 }}>
                    {[50, 72, 60, 88].map((hgt, i) => <div key={i} style={{ flex: 1, height: `${hgt}%`, background: "rgba(255,255,255,0.09)", borderRadius: "4px 4px 0 0" }} />)}
                    <div style={{ flex: 1, height: "100%", background: "#CCFF00", borderRadius: "4px 4px 0 0", boxShadow: "0 0 18px rgba(204,255,0,0.3)" }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 0 16px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0d0f13" }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: "#CCFF00" }} />
              {[0, 1, 2].map((i) => <span key={i} style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.1)" }} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── Screen 02 · Live workout logger (interactive) ────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px,5vw,40px) clamp(40px,6vw,72px)" }}>
        {screenHeader("02", "Live workout logger", "— try the steppers, then Log set", "Interactive")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
          {/* desktop logger */}
          <div style={{ ...frame, flex: 1, minWidth: 340 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ color: "#9A9CA3", fontSize: 18 }}>←</span><div><div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>Push Day A</div><div style={{ fontSize: 11, color: "#5C5E66" }}>3 of 5 exercises</div></div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ fontFamily: TEKO, fontSize: 26, fontWeight: 500, letterSpacing: "0.02em", color: "#CCFF00" }}>42:15</div><div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "#F4F5F6", fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 10 }}>Finish</div></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 0 }}>
              <div style={{ padding: 22, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ ...microLabel("#CCFF00"), letterSpacing: "0.14em", marginBottom: 6 }}>Current · 3 / 5</div>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 18 }}>Barbell Bench Press</div>
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}>
                  <thead><tr>
                    {["Set", "Kg", "Reps"].map((th) => <th key={th} style={{ textAlign: "left", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C5E66", paddingBottom: 9 }}>{th}</th>)}
                    <th style={{ textAlign: "right", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C5E66", paddingBottom: 9 }}>✓</th>
                  </tr></thead>
                  <tbody>
                    {sets.map((row) => (
                      <tr key={row.n}>
                        <td style={{ padding: "9px 0", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{row.n}</td>
                        <td style={{ padding: "9px 0", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{row.kg}</td>
                        <td style={{ padding: "9px 0", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{row.reps}</td>
                        <td style={{ padding: "9px 0", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "right" }}><span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 6, background: "rgba(204,255,0,0.16)", color: "#CCFF00", fontSize: 12 }}>✓</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C5E66", marginBottom: 8 }}>Weight · kg</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button className="pr-step" onClick={() => adjW(-2.5)} style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", color: "#F4F5F6", fontSize: 20, cursor: "pointer", transition: "all .15s" }}>−</button>
                      <div style={{ flex: 1, textAlign: "center", fontFamily: TEKO, fontSize: 34, fontWeight: 600, lineHeight: "40px" }}>{logWeight}</div>
                      <button className="pr-step" onClick={() => adjW(2.5)} style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", color: "#F4F5F6", fontSize: 20, cursor: "pointer", transition: "all .15s" }}>+</button>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C5E66", marginBottom: 8 }}>Reps</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button className="pr-step" onClick={() => adjR(-1)} style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", color: "#F4F5F6", fontSize: 20, cursor: "pointer", transition: "all .15s" }}>−</button>
                      <div style={{ flex: 1, textAlign: "center", fontFamily: TEKO, fontSize: 34, fontWeight: 600, lineHeight: "40px" }}>{logReps}</div>
                      <button className="pr-step" onClick={() => adjR(1)} style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", color: "#F4F5F6", fontSize: 20, cursor: "pointer", transition: "all .15s" }}>+</button>
                    </div>
                  </div>
                </div>
                <button className="pr-log" onClick={logSet} style={{ width: "100%", border: "none", cursor: "pointer", background: "#CCFF00", color: "#08090B", fontFamily: SAIRA, fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 12, transition: "box-shadow .18s,transform .12s" }}>Log set {nextSet} →</button>
              </div>
              <div style={{ padding: 22, background: "rgba(255,255,255,0.015)" }}>
                <div style={{ ...microLabel(), letterSpacing: "0.14em", marginBottom: 14 }}>Today&apos;s queue</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { t: "Incline DB Press", s: "3 sets · done", dot: "#34D17A", muted: false, active: false },
                    { t: "Cable Fly", s: "3 sets · done", dot: "#34D17A", muted: false, active: false },
                    { t: "Barbell Bench Press", s: "Logging now", dot: "#CCFF00", muted: false, active: true },
                    { t: "Tricep Pushdown", s: "4 sets", dot: "rgba(255,255,255,0.2)", muted: true, active: false },
                    { t: "Overhead Press", s: "3 sets", dot: "rgba(255,255,255,0.2)", muted: true, active: false },
                  ].map((q) => (
                    <div key={q.t} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", borderRadius: 11, background: q.active ? "rgba(204,255,0,0.08)" : "rgba(255,255,255,0.03)", border: q.active ? "1px solid rgba(204,255,0,0.3)" : "none" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: q.dot, ...(q.active ? { boxShadow: "0 0 8px #CCFF00" } : {}) }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, ...(q.active ? { color: "#CCFF00" } : q.muted ? { color: "#9A9CA3" } : {}) }}>{q.t}</div>
                        <div style={{ fontSize: 11, color: q.active ? "#869100" : "#5C5E66" }}>{q.s}</div>
                      </div>
                    </div>
                  ))}
                  <button className="pr-add" style={{ marginTop: 4, width: "100%", border: "1px dashed rgba(255,255,255,0.16)", background: "transparent", color: "#9A9CA3", fontFamily: SAIRA, fontSize: 13, fontWeight: 600, padding: 11, borderRadius: 11, cursor: "pointer", transition: "all .15s" }}>+ Add exercise</button>
                </div>
              </div>
            </div>
          </div>
          {/* phone logger */}
          <div style={phoneFrame}>
            <div style={notch} />
            <div style={{ padding: "36px 16px 18px", display: "flex", flexDirection: "column", height: 524, boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div><div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>Bench Press</div><div style={{ fontSize: 11, color: "#5C5E66" }}>Set {nextSet} · Push Day A</div></div>
                <div style={{ fontFamily: TEKO, fontSize: 22, fontWeight: 500, color: "#CCFF00" }}>42:15</div>
              </div>
              <div style={{ ...tile(), borderRadius: 14, padding: "12px 14px", marginBottom: 16 }}>
                {sets.map((row) => (
                  <div key={row.n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0" }}>
                    <span style={{ fontSize: 12, color: "#5C5E66" }}>Set {row.n}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{row.kg} kg × {row.reps}</span>
                    <span style={{ color: "#CCFF00", fontSize: 12 }}>✓</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, textAlign: "center", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 6px", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C5E66", marginBottom: 6 }}>Kg</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <button className="pr-step" onClick={() => adjW(-2.5)} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", color: "#F4F5F6", fontSize: 18, cursor: "pointer" }}>−</button>
                    <span style={{ fontFamily: TEKO, fontSize: 30, fontWeight: 600, width: 50 }}>{logWeight}</span>
                    <button className="pr-step" onClick={() => adjW(2.5)} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", color: "#F4F5F6", fontSize: 18, cursor: "pointer" }}>+</button>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                <div style={{ flex: 1, textAlign: "center", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 6px", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C5E66", marginBottom: 6 }}>Reps</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <button className="pr-step" onClick={() => adjR(-1)} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", color: "#F4F5F6", fontSize: 18, cursor: "pointer" }}>−</button>
                    <span style={{ fontFamily: TEKO, fontSize: 30, fontWeight: 600, width: 50 }}>{logReps}</span>
                    <button className="pr-step" onClick={() => adjR(1)} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", color: "#F4F5F6", fontSize: 18, cursor: "pointer" }}>+</button>
                  </div>
                </div>
              </div>
              <button className="pr-log" onClick={logSet} style={{ marginTop: "auto", width: "100%", border: "none", cursor: "pointer", background: "#CCFF00", color: "#08090B", fontFamily: SAIRA, fontSize: 16, fontWeight: 600, padding: 16, borderRadius: 14, transition: "transform .12s" }}>Log set {nextSet} →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Screen 03 · Progress & analytics ─────────────────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px,5vw,40px) clamp(40px,6vw,72px)" }}>
        {screenHeader("03", "Progress & analytics", "— clarity over decoration")}
        <div style={frame}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>Progress</div>
            <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {[{ t: "4W", on: false }, { t: "3M", on: true }, { t: "1Y", on: false }, { t: "All", on: false }].map((p) => (
                <span key={p.t} style={{ fontSize: 12, fontWeight: 600, padding: "6px 13px", borderRadius: 8, ...(p.on ? { background: "#CCFF00", color: "#08090B" } : { color: "#9A9CA3" }) }}>{p.t}</span>
              ))}
            </div>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ ...tile(), borderRadius: 16, padding: 22, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
                <div><div style={{ ...microLabel(), letterSpacing: "0.14em" }}>Total volume</div><div style={{ fontFamily: TEKO, fontSize: 44, fontWeight: 600, lineHeight: 0.9, marginTop: 6 }}>412,800 <span style={{ fontSize: 20, color: "#5C5E66" }}>kg</span></div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#34D17A", background: "rgba(52,209,122,0.12)", padding: "5px 11px", borderRadius: 8 }}>↑ 18% vs last period</div>
              </div>
              <svg viewBox="0 0 600 200" preserveAspectRatio="none" style={{ width: "100%", height: 180, display: "block" }}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <path d="M0,128 L66,105 L133,117 L200,90 L266,98 L333,72 L400,83 L466,60 L533,69 L600,38 L600,200 L0,200 Z" fill="url(#areaFill)" />
                <path d="M0,128 L66,105 L133,117 L200,90 L266,98 L333,72 L400,83 L466,60 L533,69 L600,38" fill="none" stroke="#CCFF00" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <circle cx="600" cy="38" r="5" fill="#CCFF00" />
                <circle cx="600" cy="38" r="9" fill="none" stroke="#CCFF00" strokeOpacity="0.4" strokeWidth="2" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 11, color: "#5C5E66" }}>
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => <span key={m}>{m}</span>)}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
              {[
                { l: "Bench · 1RM", v: "102", d: "+5 kg", dc: "#34D17A" },
                { l: "Squat · 1RM", v: "160", d: "+10 kg", dc: "#34D17A" },
                { l: "Deadlift · 1RM", v: "200", d: "— hold", dc: "#5C5E66" },
                { l: "OHP · 1RM", v: "62", d: "+2.5 kg", dc: "#34D17A" },
              ].map((c) => (
                <div key={c.l} style={tile()}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C5E66" }}>{c.l}</div>
                  <div style={{ fontFamily: TEKO, fontSize: 36, fontWeight: 600, lineHeight: 0.9, margin: "8px 0 4px" }}>{c.v}<span style={{ fontSize: 16, color: "#5C5E66", marginLeft: 3 }}>kg</span></div>
                  <div style={{ fontSize: 12, color: c.dc, fontWeight: 600 }}>{c.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Screen 04 · Leaderboard & competitions ───────────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px,5vw,40px) clamp(40px,6vw,72px)" }}>
        {screenHeader("04", "Leaderboard & competitions", "— social, with celebratory feedback")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
          <div style={{ ...frame, flex: 1, minWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>Bench Press · 1RM</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 600, color: "#9A9CA3", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 11px", borderRadius: 9 }}>Global ▾</span>
            </div>
            {/* podium */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, padding: "24px 20px 18px", justifyContent: "center", background: "radial-gradient(80% 100% at 50% 0%,rgba(204,255,0,0.06),transparent 70%)" }}>
              {/* 2nd */}
              <div style={{ textAlign: "center", flex: 1, maxWidth: 96 }}>
                <div style={{ width: 48, height: 48, margin: "0 auto 8px", borderRadius: "50%", background: "linear-gradient(135deg,#3a3d44,#23262b)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, border: "2px solid #C0C0C8" }}>RM</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Rai M.</div>
                <div style={{ fontFamily: TEKO, fontSize: 22, fontWeight: 600, color: "#9A9CA3" }}>138</div>
                <div style={{ height: 54, borderRadius: "10px 10px 0 0", background: "linear-gradient(180deg,rgba(192,192,200,0.22),rgba(192,192,200,0.04))", border: "1px solid rgba(192,192,200,0.2)", borderBottom: "none", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 7, fontFamily: TEKO, fontSize: 20, color: "#C0C0C8" }}>2</div>
              </div>
              {/* 1st */}
              <div style={{ textAlign: "center", flex: 1, maxWidth: 104 }}>
                <div style={{ width: 58, height: 58, margin: "0 auto 8px", borderRadius: "50%", background: "linear-gradient(135deg,#2a2f1a,#1a1d12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, border: "2px solid #CCFF00", boxShadow: "0 0 22px rgba(204,255,0,0.4)" }}>JT</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#CCFF00" }}>Jord T.</div>
                <div style={{ fontFamily: TEKO, fontSize: 26, fontWeight: 600 }}>145</div>
                <div style={{ height: 72, borderRadius: "10px 10px 0 0", background: "linear-gradient(180deg,rgba(204,255,0,0.26),rgba(204,255,0,0.05))", border: "1px solid rgba(204,255,0,0.35)", borderBottom: "none", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 7, fontFamily: TEKO, fontSize: 24, color: "#CCFF00" }}>1</div>
              </div>
              {/* 3rd */}
              <div style={{ textAlign: "center", flex: 1, maxWidth: 96 }}>
                <div style={{ width: 48, height: 48, margin: "0 auto 8px", borderRadius: "50%", background: "linear-gradient(135deg,#3a2a1f,#241a12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, border: "2px solid #CD7F4A" }}>SK</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Sam K.</div>
                <div style={{ fontFamily: TEKO, fontSize: 22, fontWeight: 600, color: "#9A9CA3" }}>132</div>
                <div style={{ height: 42, borderRadius: "10px 10px 0 0", background: "linear-gradient(180deg,rgba(205,127,74,0.22),rgba(205,127,74,0.04))", border: "1px solid rgba(205,127,74,0.2)", borderBottom: "none", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 7, fontFamily: TEKO, fontSize: 20, color: "#CD7F4A" }}>3</div>
              </div>
            </div>
            {/* list */}
            <div style={{ padding: "6px 14px 16px" }}>
              {[{ r: "4", in: "DL", n: "Devon L.", v: "128" }, { r: "5", in: "MO", n: "Maya O.", v: "120" }, { r: "6", in: "TF", n: "Theo F.", v: "110" }].map((row) => (
                <div key={row.r} style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ width: 22, fontFamily: TEKO, fontSize: 18, color: "#5C5E66", textAlign: "center" }}>{row.r}</span>
                  <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#23262b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{row.in}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{row.n}</span>
                  <span style={{ fontFamily: TEKO, fontSize: 18, fontWeight: 600 }}>{row.v} <span style={{ fontSize: 11, color: "#5C5E66" }}>kg</span></span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 12px", marginTop: 6, borderRadius: 12, background: "rgba(204,255,0,0.08)", border: "1px solid rgba(204,255,0,0.3)" }}>
                <span style={{ width: 22, fontFamily: TEKO, fontSize: 18, color: "#CCFF00", textAlign: "center" }}>7</span>
                <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#2a2f1a", border: "1px solid #CCFF00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#CCFF00" }}>AL</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#CCFF00" }}>You · Alex L.</span>
                <span style={{ fontFamily: TEKO, fontSize: 18, fontWeight: 600, color: "#CCFF00" }}>102 <span style={{ fontSize: 11, color: "#869100" }}>kg</span></span>
              </div>
              <div style={{ textAlign: "center", fontSize: 12, color: "#5C5E66", marginTop: 12 }}>8 kg from rank 6 · keep pushing</div>
            </div>
          </div>
          {/* competition card */}
          <div style={{ ...frame, width: 300, flexShrink: 0 }}>
            <div style={{ position: "relative", padding: 20, background: "radial-gradient(120% 120% at 100% 0%,rgba(255,74,61,0.16),transparent 60%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 7, background: "rgba(255,74,61,0.14)", color: "#FF6A5D", marginBottom: 14 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF4A3D", animation: "pumpFloat 1.6s ease-in-out infinite" }} />Live · 2d left</span>
              <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em" }}>March Bench Max</div>
              <div style={{ fontSize: 12, color: "#9A9CA3", marginTop: 4 }}>14 athletes · 1RM challenge</div>
            </div>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#5C5E66", marginBottom: 8 }}><span>Your standing</span><span>Top 50%</span></div>
              <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: 20 }}><div style={{ width: "62%", height: "100%", background: "linear-gradient(90deg,#CCFF00,#a8d600)", borderRadius: 999 }} /></div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 13, textAlign: "center" }}><div style={{ fontFamily: TEKO, fontSize: 30, fontWeight: 600, lineHeight: 0.9 }}>7</div><div style={{ fontSize: 10, color: "#5C5E66", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Rank</div></div>
                <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 13, textAlign: "center" }}><div style={{ fontFamily: TEKO, fontSize: 30, fontWeight: 600, lineHeight: 0.9, color: "#CCFF00" }}>102</div><div style={{ fontSize: 10, color: "#5C5E66", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Your kg</div></div>
              </div>
              <button className="pr-cta" style={{ marginTop: 16, width: "100%", border: "none", cursor: "pointer", background: "#CCFF00", color: "#08090B", fontFamily: SAIRA, fontSize: 14, fontWeight: 600, padding: 13, borderRadius: 12, transition: "box-shadow .18s" }}>Submit new attempt</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Screen 05 · Nutrition & macros ───────────────────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px,5vw,40px) clamp(40px,6vw,72px)" }}>
        {screenHeader("05", "Nutrition & macros", "— same care as workout tracking")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
          <div style={{ ...frame, flex: 1, minWidth: 340 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>Nutrition · Today</div>
              <span style={{ display: "flex", alignItems: "center", gap: 5, background: "#CCFF00", color: "#08090B", fontSize: 11, fontWeight: 600, padding: "8px 13px", borderRadius: 9 }}><span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Log meal</span>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 22, background: "rgba(255,255,255,0.02)", marginBottom: 16 }}>
                <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
                  <svg viewBox="0 0 160 160" style={{ width: 140, height: 140, transform: "rotate(-90deg)" }}>
                    <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" />
                    <circle cx="80" cy="80" r="68" fill="none" stroke="#CCFF00" strokeWidth="14" strokeLinecap="round" strokeDasharray="427" strokeDashoffset="77" style={{ filter: "drop-shadow(0 0 8px rgba(204,255,0,0.4))" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><div style={{ fontFamily: TEKO, fontSize: 40, fontWeight: 600, lineHeight: 0.85 }}>2140</div><div style={{ fontSize: 11, color: "#5C5E66" }}>/ 2600 kcal</div></div>
                </div>
                <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 16 }}>
                  {macroBar("Protein", "145 / 180g", "80%", "#CCFF00")}
                  {macroBar("Carbs", "210 / 260g", "81%", "#5B8DEF")}
                  {macroBar("Fat", "58 / 70g", "83%", "#FFC24B")}
                </div>
              </div>
              <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
                {[
                  { ic: "☀", icbg: "rgba(255,194,75,0.14)", t: "Breakfast", s: "Oats, eggs, berries", k: "520" },
                  { ic: "🥗", icbg: "rgba(204,255,0,0.12)", t: "Lunch", s: "Chicken, rice, greens", k: "740" },
                  { ic: "🍽", icbg: "rgba(91,141,239,0.14)", t: "Dinner", s: "Salmon, potato, salad", k: "680" },
                ].map((m) => (
                  <div key={m.t} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ width: 38, height: 38, borderRadius: 11, background: m.icbg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{m.ic}</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{m.t}</div><div style={{ fontSize: 11, color: "#5C5E66" }}>{m.s}</div></div>
                    <div style={{ fontFamily: TEKO, fontSize: 22, fontWeight: 600 }}>{m.k}</div>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
                  <span style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#5C5E66" }}>＋</span>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#9A9CA3" }}>Add snack / 460 kcal left</div>
                </div>
              </div>
            </div>
          </div>
          {/* nutrition phone */}
          <div style={phoneFrame}>
            <div style={notch} />
            <div style={{ padding: "36px 16px 18px", height: 524, boxSizing: "border-box" }}>
              <div style={{ ...microLabel("#CCFF00"), letterSpacing: "0.14em", marginBottom: 4 }}>Today</div>
              <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 16 }}>Nutrition</div>
              <div style={{ position: "relative", width: 150, height: 150, margin: "0 auto 18px" }}>
                <svg viewBox="0 0 160 160" style={{ width: 150, height: 150, transform: "rotate(-90deg)" }}>
                  <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="13" />
                  <circle cx="80" cy="80" r="68" fill="none" stroke="#CCFF00" strokeWidth="13" strokeLinecap="round" strokeDasharray="427" strokeDashoffset="77" style={{ filter: "drop-shadow(0 0 8px rgba(204,255,0,0.4))" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><div style={{ fontFamily: TEKO, fontSize: 42, fontWeight: 600, lineHeight: 0.85 }}>2140</div><div style={{ fontSize: 11, color: "#5C5E66" }}>of 2600 kcal</div></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ pct: "80%", c: "#CCFF00", v: "145g", l: "Protein" }, { pct: "81%", c: "#5B8DEF", v: "210g", l: "Carbs" }, { pct: "83%", c: "#FFC24B", v: "58g", l: "Fat" }].map((m) => (
                  <div key={m.l} style={{ flex: 1, textAlign: "center", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "11px 4px" }}>
                    <div style={{ width: "100%", height: 5, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: 8 }}><div style={{ width: m.pct, height: "100%", background: m.c }} /></div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.v}</div>
                    <div style={{ fontSize: 9, color: "#5C5E66", textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.l}</div>
                  </div>
                ))}
              </div>
              <button style={{ marginTop: 16, width: "100%", border: "none", cursor: "pointer", background: "#CCFF00", color: "#08090B", fontFamily: SAIRA, fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 13 }}>+ Log meal</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Screen 06 · 3D exercise visualization ────────────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px,5vw,40px) clamp(40px,6vw,72px)" }}>
        {screenHeader("06", "3D exercise visualization", "— form & anatomy (three.js view)")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "stretch" }}>
          <div style={{ ...frame, flex: 1.4, minWidth: 320, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 70% at 50% 30%,rgba(204,255,0,0.08),transparent 60%)" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(70% 70% at 50% 50%,#000,transparent)", WebkitMaskImage: "radial-gradient(70% 70% at 50% 50%,#000,transparent)" }} />
            <div style={{ position: "relative", height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="200" height="360" viewBox="0 0 200 360" style={{ animation: "pumpFloat 5s ease-in-out infinite" }}>
                <ellipse cx="100" cy="340" rx="56" ry="11" fill="rgba(0,0,0,0.5)" />
                <circle cx="100" cy="40" r="26" fill="#23262b" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                <path d="M64 84 Q100 70 136 84 L150 150 Q100 168 50 150 Z" fill="#1c1f24" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                <path d="M70 96 Q100 86 130 96 Q124 124 100 128 Q76 124 70 96 Z" fill="rgba(204,255,0,0.55)" stroke="#CCFF00" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 10px rgba(204,255,0,0.6))" }} />
                <rect x="40" y="92" width="20" height="92" rx="10" fill="#1c1f24" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" transform="rotate(8 50 130)" />
                <rect x="140" y="92" width="20" height="92" rx="10" fill="#1c1f24" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" transform="rotate(-8 150 130)" />
                <path d="M58 150 Q100 162 142 150 L150 188 Q100 200 50 188 Z" fill="#1c1f24" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                <rect x="62" y="196" width="30" height="128" rx="15" fill="#1c1f24" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                <rect x="108" y="196" width="30" height="128" rx="15" fill="#1c1f24" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
              </svg>
              <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 10, background: "rgba(8,9,11,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "7px 9px" }}>
                {["↺", "↻"].map((g) => <span key={g} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A9CA3", fontSize: 15, cursor: "pointer" }}>{g}</span>)}
                <span style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)" }} />
                {["＋", "－"].map((g) => <span key={g} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A9CA3", fontSize: 15, cursor: "pointer" }}>{g}</span>)}
              </div>
              <span style={{ position: "absolute", top: 16, left: 16, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C5E66", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "5px 9px" }}>Drag to rotate</span>
            </div>
          </div>
          <div style={{ ...frame, flex: 1, minWidth: 280, padding: 22 }}>
            <div style={{ ...microLabel("#CCFF00"), letterSpacing: "0.14em", marginBottom: 6 }}>Targeted muscle</div>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 4 }}>Pectoralis Major</div>
            <div style={{ fontSize: 13, color: "#9A9CA3", lineHeight: 1.5, marginBottom: 20 }}>The primary mover in pressing. Tap a muscle group to isolate it and surface the exercises that train it best.</div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C5E66", marginBottom: 10 }}>Muscle group</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              <span style={{ fontSize: 12, padding: "8px 14px", borderRadius: 999, background: "#CCFF00", color: "#08090B", fontWeight: 600 }}>Chest</span>
              {["Back", "Shoulders", "Legs", "Arms", "Core"].map((g) => <span key={g} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#9A9CA3", border: "1px solid rgba(255,255,255,0.1)" }}>{g}</span>)}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C5E66", marginBottom: 10 }}>Best exercises</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {["Barbell Bench Press", "Incline DB Press", "Cable Fly"].map((e) => (
                <div key={e} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 13px", borderRadius: 11, background: "rgba(255,255,255,0.03)" }}><span style={{ fontSize: 13, fontWeight: 600 }}>{e}</span><span style={{ color: "#9A9CA3", fontSize: 15 }}>›</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Screen 07 · Profile & settings ───────────────────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px,5vw,40px) clamp(40px,6vw,72px)" }}>
        {screenHeader("07", "Profile & settings", "— identity & control, calm by default")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
          {/* profile */}
          <div style={{ ...frame, flex: 1, minWidth: 300 }}>
            <div style={{ position: "relative", height: 96, background: "radial-gradient(120% 160% at 80% -40%,rgba(204,255,0,0.22),transparent 55%),linear-gradient(180deg,#15181d,#0d0f13)" }} />
            <div style={{ padding: "0 22px 22px", marginTop: -38, position: "relative" }}>
              <div style={{ width: 76, height: 76, borderRadius: 22, background: "linear-gradient(135deg,#2a2f1a,#1a1d12)", border: "2px solid #CCFF00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#CCFF00", boxShadow: "0 0 30px rgba(204,255,0,0.25)" }}>AL</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>Alex Lifeson</div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 7, background: "#CCFF00", color: "#08090B" }}>Pro</span>
              </div>
              <div style={{ fontSize: 13, color: "#5C5E66", marginTop: 2 }}>@alex.lifts · Intermediate · 2y training</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 20 }}>
                {[{ v: "86", l: "Workouts" }, { v: "12", l: "PRs" }, { v: "240", l: "Followers" }, { v: "180", l: "Following" }].map((s) => (
                  <div key={s.l} style={{ textAlign: "center", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "13px 6px" }}><div style={{ fontFamily: TEKO, fontSize: 26, fontWeight: 600, lineHeight: 0.9 }}>{s.v}</div><div style={{ fontSize: 9, color: "#5C5E66", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{s.l}</div></div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button style={{ flex: 1, border: "none", cursor: "pointer", background: "#CCFF00", color: "#08090B", fontFamily: SAIRA, fontSize: 13, fontWeight: 600, padding: 11, borderRadius: 11 }}>Edit profile</button>
                <button style={{ flex: 1, cursor: "pointer", background: "rgba(255,255,255,0.06)", color: "#F4F5F6", border: "1px solid rgba(255,255,255,0.14)", fontFamily: SAIRA, fontSize: 13, fontWeight: 600, padding: 11, borderRadius: 11 }}>Share</button>
              </div>
            </div>
          </div>
          {/* settings */}
          <div style={{ ...frame, flex: 1.1, minWidth: 320 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>Settings</div>
            <div style={{ padding: "8px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>Units</div><div style={{ fontSize: 12, color: "#5C5E66" }}>Weight &amp; distance</div></div>
                <div style={{ display: "inline-flex", gap: 3, padding: 3, borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}><span style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 6, background: "#CCFF00", color: "#08090B" }}>kg</span><span style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 6, color: "#9A9CA3" }}>lb</span></div>
              </div>
              {[{ t: "Rest timer alerts", s: "Buzz when rest ends", on: true }, { t: "Public profile", s: "Show on leaderboards", on: true }, { t: "Reduced motion", s: "Calmer transitions", on: false }].map((r) => (
                <div key={r.t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div><div style={{ fontSize: 14, fontWeight: 600 }}>{r.t}</div><div style={{ fontSize: 12, color: "#5C5E66" }}>{r.s}</div></div>
                  <span style={{ position: "relative", display: "inline-flex", width: 42, height: 24, borderRadius: 999, background: r.on ? "#CCFF00" : "rgba(255,255,255,0.12)", padding: 3, boxSizing: "border-box" }}><span style={{ width: 18, height: 18, borderRadius: "50%", background: r.on ? "#08090B" : "#9A9CA3", marginLeft: r.on ? "auto" : 0 }} /></span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 0" }}>
                <div><div style={{ fontSize: 14, fontWeight: 600, color: "#FF6A5D" }}>Sign out</div><div style={{ fontSize: 12, color: "#5C5E66" }}>End your session</div></div>
                <span style={{ color: "#FF6A5D", fontSize: 16 }}>›</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {divider}

      {/* ── 03 MOTIVATION MODES (interactive centerpiece) ────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(48px,7vw,86px) clamp(20px,5vw,40px) clamp(40px,6vw,72px)" }}>
        <span style={sectionEyebrow}>03 — Motivation modes</span>
        <h2 style={h2}>Five arcs, one system</h2>
        <p style={{ margin: "0 0 28px", maxWidth: "58ch", fontSize: 16, lineHeight: 1.6, color: "#9A9CA3" }}>Every mode re-colors a single <span style={{ color: "#F4F5F6" }}>--accent</span> token and its derivatives. The whole interface re-themes through the CSS cascade — one source of truth, no per-page overrides, no flash. <span style={{ color: "#F4F5F6" }}>Tap a mode</span> to re-theme the live preview.</p>

        <div ref={modeRoot} style={{ "--m-accent": "#CCFF00" } as CSSProperties}>
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, padding: 6, borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {MODES.map((m) => (
                <button key={m.key} data-mode={m.key} onClick={() => setMode(m.key)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", border: "none", borderRadius: 11, padding: "9px 15px", fontFamily: SAIRA, fontSize: 13, fontWeight: 600, letterSpacing: "0.01em", background: "transparent", color: "#9A9CA3", transition: "all .35s cubic-bezier(0.16,1,0.3,1)" }}>
                  <span data-dot="" style={{ width: 8, height: 8, borderRadius: "50%", background: "#CCFF00", transition: "background .35s" }} />{m.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 22, alignItems: "stretch" }} className="pr-mode-grid">
            {/* meta */}
            <div data-paint="bg" style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, padding: 26, background: "#0A0B0D", transition: "background .55s cubic-bezier(0.16,1,0.3,1)", position: "relative", overflow: "hidden" }}>
              <div data-paint="glow-radial" style={{ position: "absolute", inset: 0, background: "radial-gradient(110% 90% at 90% -10%,rgba(204,255,0,0.30),transparent 55%)", opacity: 0.5, transition: "background .55s", pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "auto" }}>
                  <span data-paint="accent-swatch" style={{ width: 44, height: 44, borderRadius: 13, background: "#CCFF00", boxShadow: "0 0 26px rgba(204,255,0,0.30)", transition: "background .55s,box-shadow .55s" }} />
                  <div data-paint="accent-color" style={{ ...microLabel("#CCFF00"), letterSpacing: "0.14em", transition: "color .55s" }}>{active.label}</div>
                </div>
                <div style={{ fontSize: "clamp(26px,3.2vw,38px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.04, margin: "50px 0 14px" }}>{active.tagline}</div>
                <div style={{ fontSize: 15, lineHeight: 1.6, color: "#9A9CA3", maxWidth: "34ch" }}>{active.desc}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 26 }}>
                  {["--accent", "--bg", "--glow"].map((t) => <span key={t} style={{ fontSize: 11, color: "#9A9CA3", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 11px" }}>{t}</span>)}
                </div>
              </div>
            </div>
            {/* live preview */}
            <div data-paint="bg" style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, overflow: "hidden", background: "#0A0B0D", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)", transition: "background .55s cubic-bezier(0.16,1,0.3,1)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, letterSpacing: "-0.03em", fontSize: 15 }}>PUMPS <span data-paint="accent-border" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#CCFF00", border: "1px solid #CCFF00", padding: "2px 6px", borderRadius: 5, whiteSpace: "nowrap", transition: "color .55s,border-color .55s" }}>{active.label}</span></div>
                <span data-paint="accent-ink-bg" style={{ display: "flex", alignItems: "center", gap: 5, background: "#CCFF00", color: "#08090B", fontSize: 11, fontWeight: 600, padding: "7px 12px", borderRadius: 9, transition: "background .55s,color .55s" }}><span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Log</span>
              </div>
              <div style={{ padding: 18 }}>
                <div data-paint="surf" style={{ position: "relative", overflow: "hidden", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", padding: 20, marginBottom: 12, background: "rgba(255,255,255,0.04)", transition: "background .55s" }}>
                  <div data-paint="accent-color" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#CCFF00", marginBottom: 8, transition: "color .55s" }}>{active.tagline}</div>
                  <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em" }}>Good evening, Alex</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9, marginBottom: 12 }}>
                  {[{ l: "Workouts", v: "86", a: false }, { l: "Volume", v: "412k", a: false }, { l: "Streak", v: "12", a: true }].map((s) => (
                    <div key={s.l} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 13 }}>
                      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7d7f86" }}>{s.l}</div>
                      <div {...(s.a ? { "data-paint": "accent-color" } : {})} style={{ fontFamily: TEKO, fontSize: 30, fontWeight: 600, lineHeight: 0.9, marginTop: 5, ...(s.a ? { color: "#CCFF00", transition: "color .55s" } : {}) }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><span style={{ fontSize: 12, fontWeight: 600 }}>Volume history</span><span style={{ fontSize: 10, color: "#7d7f86" }}>8 weeks</span></div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 84 }}>
                    {[44, 64, 54, 78, 70, 87].map((hgt, i) => <div key={i} style={{ flex: 1, height: `${hgt}%`, background: "rgba(255,255,255,0.09)", borderRadius: "4px 4px 0 0" }} />)}
                    <div data-paint="accent-bar" style={{ flex: 1, height: "100%", background: "#CCFF00", borderRadius: "4px 4px 0 0", boxShadow: "0 0 20px rgba(204,255,0,0.30)", transition: "background .55s,box-shadow .55s" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {divider}

      {/* ── 04 EXPLORATIONS ──────────────────────────────────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(48px,7vw,86px) clamp(20px,5vw,40px) clamp(40px,6vw,72px)" }}>
        <span style={sectionEyebrow}>04 — Explorations</span>
        <h2 style={h2}>Three takes on the dashboard</h2>
        <p style={{ ...sectionLead, margin: "0 0 36px" }}>Same tokens, same components — three rhythms. Mix and match: a calm editorial home, a dense command deck, or a single-focus hero. All shown in default mode.</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
          {/* A: Editorial calm */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}><span style={{ fontSize: 13, fontWeight: 600 }}>A · Editorial calm</span><span style={{ fontSize: 12, color: "#5C5E66" }}>whitespace-led</span></div>
            <div style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, background: "#0A0B0D", padding: 22, boxShadow: "0 24px 60px -30px rgba(0,0,0,0.8)" }}>
              <div style={{ ...microLabel("#CCFF00"), letterSpacing: "0.14em", marginBottom: 8 }}>Tuesday evening</div>
              <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24 }}>Good evening,<br />Alex</div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 18, marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontSize: 13, color: "#9A9CA3" }}>This week</span><span style={{ fontFamily: TEKO, fontSize: 34, fontWeight: 600, lineHeight: 0.9 }}>28,400 <span style={{ fontSize: 15, color: "#5C5E66" }}>kg</span></span></div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 48, margin: "14px 0 18px" }}>
                {[50, 70, 58, 88].map((hgt, i) => <div key={i} style={{ flex: 1, height: `${hgt}%`, background: "rgba(255,255,255,0.08)", borderRadius: "3px 3px 0 0" }} />)}
                <div style={{ flex: 1, height: "100%", background: "#CCFF00", borderRadius: "3px 3px 0 0" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}><div style={{ fontSize: 13, fontWeight: 600 }}>Continue Pull Day B</div><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 7, background: "rgba(204,255,0,0.16)", color: "#CCFF00" }}>Resume</span></div>
            </div>
          </div>
          {/* B: Command deck */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}><span style={{ fontSize: 13, fontWeight: 600 }}>B · Command deck</span><span style={{ fontSize: 12, color: "#5C5E66" }}>data-dense</span></div>
            <div style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, background: "#0A0B0D", padding: 18, boxShadow: "0 24px 60px -30px rgba(0,0,0,0.8)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><span style={{ fontSize: 13, fontWeight: 600 }}>Today</span><span style={{ fontSize: 10, color: "#5C5E66", fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em" }}>19:42 · Push A</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                {[{ l: "Vol", v: "28k", a: false }, { l: "Sets", v: "24", a: false }, { l: "PRs", v: "2", a: true }].map((s) => (
                  <div key={s.l} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 10 }}><div style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C5E66" }}>{s.l}</div><div style={{ fontFamily: TEKO, fontSize: 24, fontWeight: 600, lineHeight: 0.9, marginTop: 3, ...(s.a ? { color: "#CCFF00" } : {}) }}>{s.v}</div></div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[{ l: "Streak", v: "12d" }, { l: "Rank", v: "#7" }].map((s) => (
                  <div key={s.l} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 10 }}><div style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5C5E66" }}>{s.l}</div><div style={{ fontFamily: TEKO, fontSize: 24, fontWeight: 600, lineHeight: 0.9, marginTop: 3 }}>{s.v}</div></div>
                ))}
              </div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                {[{ n: "Bench", w: "84%", v: "102" }, { n: "Squat", w: "96%", v: "160" }, { n: "Dead", w: "100%", v: "200" }].map((b) => (
                  <div key={b.n} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}><span style={{ width: 42, color: "#5C5E66", fontVariantNumeric: "tabular-nums" }}>{b.n}</span><div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ width: b.w, height: "100%", background: "#CCFF00" }} /></div><span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{b.v}</span></div>
                ))}
              </div>
            </div>
          </div>
          {/* C: Single focus */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}><span style={{ fontSize: 13, fontWeight: 600 }}>C · Single focus</span><span style={{ fontSize: 12, color: "#5C5E66" }}>one hero metric</span></div>
            <div style={{ position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, background: "radial-gradient(120% 90% at 50% -10%,rgba(204,255,0,0.12),transparent 55%),#0A0B0D", padding: "28px 22px", boxShadow: "0 24px 60px -30px rgba(0,0,0,0.8)", textAlign: "center" }}>
              <div style={{ ...microLabel("#CCFF00"), letterSpacing: "0.14em", marginBottom: 18 }}>Day 12 · streak alive</div>
              <div style={{ fontFamily: TEKO, fontSize: 96, fontWeight: 600, lineHeight: 0.8, letterSpacing: "0.01em" }}>12</div>
              <div style={{ fontSize: 13, color: "#9A9CA3", margin: "8px 0 22px" }}>days in a row · one session to keep it</div>
              <button className="pr-cta" style={{ width: "100%", border: "none", cursor: "pointer", background: "#CCFF00", color: "#08090B", fontFamily: SAIRA, fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 12, transition: "box-shadow .18s" }}>Start today&apos;s workout</button>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
                {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: "#CCFF00" }} />)}
                {[5, 6].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {divider}

      {/* ── 05 THE SHIFT ─────────────────────────────────────────── */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(48px,7vw,86px) clamp(20px,5vw,40px) clamp(64px,9vw,110px)" }}>
        <span style={sectionEyebrow}>05 — The shift</span>
        <h2 style={{ ...h2, margin: "6px 0 36px" }}>What changed, and why</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 14 }}>
          {[
            { k: "Type", before: <>Wall-to-wall <span style={{ textDecoration: "line-through", color: "#5C5E66" }}>UPPERCASE</span></>, after: "→ Sentence-case clarity", why: "Uppercase reserved for micro-labels only. Reads premium, not shouty." },
            { k: "Shape", before: "Zero-radius, hard edges", after: "→ 8–16px soft radii", why: "The single biggest premium signal. Consistent radius scale across every surface." },
            { k: "Accent", before: "Lime everywhere", after: "→ Lime as a scalpel", why: "Reserved for live, active, and key data. Calm neutrals carry the rest." },
            { k: "Theming", before: "Per-page overrides, flashes", after: "→ One token, 5 modes", why: "A single accent source cascades everywhere. Smooth, flicker-free switching." },
          ].map((c) => (
            <div key={c.k} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 22, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ ...microLabel(), letterSpacing: "0.1em", marginBottom: 14 }}>{c.k}</div>
              <div style={{ fontSize: 14, color: "#9A9CA3", lineHeight: 1.5 }}>{c.before}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4, color: "#F4F5F6" }}>{c.after}</div>
              <div style={{ fontSize: 13, color: "#5C5E66", marginTop: 10, lineHeight: 1.5 }}>{c.why}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
