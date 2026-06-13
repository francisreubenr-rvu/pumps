"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { Dumbbell, BarChart3, Trophy, Swords, Zap, Users, ArrowRight, ChevronDown } from "lucide-react"

const DumbbellCanvas = dynamic(
  () => import("@/components/landing/dumbbell-canvas").then((m) => m.DumbbellCanvas),
  { ssr: false, loading: () => null }
)

/* ─── Scroll progress hook ─── */
function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      const scrolled = -rect.top
      setProgress(Math.max(0, Math.min(1, scrolled / total)))
    }
    window.addEventListener("scroll", update, { passive: true })
    update()
    return () => window.removeEventListener("scroll", update)
  }, [ref])
  return progress
}

/* ─── Mobile breakpoint hook (mount-safe — no SSR hydration mismatch) ─── */
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const update = () => setMobile(window.innerWidth < bp)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [bp])
  return mobile
}

/* ─── Fade-in-on-scroll utility ─── */
function FadeSection({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null)
  const progress = useScrollProgress(heroRef as React.RefObject<HTMLElement>)
  const isMobile = useIsMobile()

  return (
    <div style={{ backgroundColor: "transparent", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════
          TOP NAV — frosted glass
      ══════════════════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 90,
        height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px, 5vw, 48px)",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "env(safe-area-inset-top)",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)" }}>
          PUMPS
        </span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/auth/login" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)", textDecoration: "none", padding: "8px 16px" }}>
            Sign In
          </Link>
          <Link href="/auth/login" className="btn-primary" style={{ fontSize: 12, padding: "8px 20px" }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO — 3D DUMBBELL SCROLL SECTION
      ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{ height: isMobile ? "170vh" : "200vh", position: "relative" }}
        aria-label="Hero"
      >
        {/* Sticky canvas container */}
        <div style={{
          position: "sticky", top: 0,
          height: "100dvh", width: "100%",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}>
          {/* Ambient gradient behind the scene — theme-neutral so it reads across all modes,
              with the active accent providing a faint tint */}
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0,
            background: `
              radial-gradient(ellipse 70% 60% at 50% 28%, color-mix(in oklab, var(--accent) 8%, transparent) 0%, transparent 62%),
              radial-gradient(ellipse 55% 50% at 18% 82%, rgba(255,255,255,0.04) 0%, transparent 60%)
            `,
          }} />

          {/* Big static PUMPS title */}
          <div style={{
            position: "absolute",
            top: "clamp(70px, 12vh, 110px)",
            left: 0, right: 0,
            textAlign: "center",
            zIndex: 10,
            opacity: progress < 0.05 ? 1 : Math.max(0, 1 - (progress - 0.05) / 0.08),
            transition: "opacity 100ms",
            pointerEvents: "none",
          }}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(72px, 15vw, 160px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              lineHeight: 1,
              background: "linear-gradient(180deg, #f5f5f7 0%, rgba(245,245,247,0.6) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              PUMPS
            </h1>
            <p style={{
              fontFamily: "var(--font-heading-stack)",
              fontSize: "clamp(11px, 1.4vw, 14px)",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              marginTop: 8,
            }}>
              GYM JOURNALING — KINETIC EDITION
            </p>
          </div>

          {/* 3D Canvas */}
          <div style={{ flex: 1, position: "relative" }}>
            <DumbbellCanvas progress={progress} />
          </div>

          {/* Bottom scroll cue */}
          <div style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: progress < 0.05 ? 1 : 0,
            transition: "opacity 300ms",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            pointerEvents: "none",
          }}>
            <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-secondary)" }}>SCROLL</span>
            <div style={{ animation: "floatDown 1.6s ease-in-out infinite" }}>
              <ChevronDown size={16} color="var(--text-secondary)" />
            </div>
          </div>

          {/* Bottom gradient fade to next section — trimmed so the marquee sits tight under DOMINATE */}
          <div aria-hidden="true" style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 90,
            background: "linear-gradient(to bottom, transparent, var(--bg))",
            pointerEvents: "none",
          }} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          MARQUEE STRIP
      ══════════════════════════════════════ */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "clamp(14px, 2vh, 18px) 0",
        overflow: "hidden",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div style={{ display: "flex", gap: "clamp(40px, 6vw, 80px)", whiteSpace: "nowrap", animation: "marquee 28s linear infinite" }}>
          {["TRACK EVERY REP", "COMPETE IN REAL TIME", "OWN THE LEADERBOARD", "TRAIN WITH YOUR SQUAD", "LOG EVERY PR", "BREAK YOUR LIMITS",
            "TRACK EVERY REP", "COMPETE IN REAL TIME", "OWN THE LEADERBOARD", "TRAIN WITH YOUR SQUAD"].map((t, i) => (
            <span key={i} style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(15px, 2.2vw, 20px)",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: i % 2 === 0 ? "rgba(245,245,247,0.8)" : "var(--accent)",
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          FEATURES GRID — glassmorphism cards
      ══════════════════════════════════════ */}
      <section style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "clamp(80px, 14vh, 140px) clamp(20px, 5vw, 48px)",
      }}>
        <FadeSection>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 14, textAlign: "center" }}>
            EVERYTHING YOU NEED
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(44px, 7vw, 80px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "var(--fg)",
            lineHeight: 1,
            textAlign: "center",
            maxWidth: 700,
            margin: "0 auto clamp(48px, 8vh, 80px)",
          }}>
            BUILT FOR LIFTERS WHO KEEP SCORE
          </h2>
        </FadeSection>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1 }}>
          {[
            { icon: Dumbbell, label: "LOG", title: "Track Everything", desc: "Sets, reps, weight — logged with precision. Every workout, every exercise, every PR.", delay: 0 },
            { icon: Swords,   label: "COMPETE", title: "Live Competition", desc: "Race friends in real time. Leaderboards update instantly as sets are logged.", delay: 60 },
            { icon: BarChart3,label: "GROW", title: "See Your Progress", desc: "Volume history charts show your strength climbing week over week.", delay: 120 },
            { icon: Zap,      label: "MODE", title: "Motivation Modes", desc: "Switch between Monk, Revenge, Winter, Happy. The interface adapts to your mindset.", delay: 180 },
            { icon: Users,    label: "SQUADS", title: "Train Together", desc: "Form squads, share stats, and push each other to hit new records.", delay: 240 },
            { icon: Trophy,   label: "RANKS", title: "Athlete Benchmarks", desc: "See where your lifts rank — Beginner to Elite. Know your level.", delay: 300 },
          ].map((f, i) => (
            <FadeSection key={i} delay={f.delay}>
              <div style={{
                padding: "clamp(24px, 3.5vw, 36px)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                height: "100%",
                display: "flex", flexDirection: "column", gap: 12,
                transition: "background 300ms, border-color 300ms",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(204,255,0,0.25)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)" }}
              >
                <f.icon size={18} style={{ color: "var(--accent)" }} aria-hidden="true" />
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-secondary)" }}>{f.label}</p>
                <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: "clamp(14px, 1.5vw, 17px)", fontWeight: 700, letterSpacing: "-0.03em", textTransform: "uppercase", color: "var(--fg)" }}>{f.title}</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.75, color: "var(--text-secondary)", flex: 1 }}>{f.desc}</p>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          SPLIT SHOWCASES
      ══════════════════════════════════════ */}
      {[
        {
          num: "01", tag: "LOG",
          title: "EVERY REP.\nEVERY SET.\nEVERY PR.",
          body: "Log workouts with zero friction. Curated exercise library, set tracking with weight and reps, and real-time volume charts that show you where you stand.",
          img: "/images/bg-plates.jpg", imgPos: "center",
          imgSide: "left" as const,
          bg: "var(--bg)",
        },
        {
          num: "02", tag: "COMPETE",
          title: "RACE LIVE.\nWIN NOW.\nNO EXCUSES.",
          body: "Challenge anyone to a live exercise duel. First to hit the target volume wins. Leaderboards update with every set — no refresh, no delay.",
          img: "/images/gym-dark-2.jpg", imgPos: "center 30%",
          imgSide: "right" as const,
          bg: "rgba(255,255,255,0.015)",
        },
        {
          num: "03", tag: "GROW",
          title: "SEE THE\nGAINS.\nPROVE IT.",
          body: "Volume history charts, PR timelines, athlete benchmarks. Know exactly where your lifts rank — Beginner to Elite — and watch the line go up.",
          img: "/images/gym-chalk.jpg", imgPos: "center 20%",
          imgSide: "left" as const,
          bg: "var(--bg)",
        },
      ].map((s, i) => (
        <section
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: "clamp(420px, 60vh, 640px)",
            background: s.bg,
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
          className="split-section"
        >
          {/* Image */}
          <div style={{ order: s.imgSide === "left" ? 0 : 1, position: "relative", overflow: "hidden", minHeight: 260 }}>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${s.img})`,
              backgroundSize: "cover",
              backgroundPosition: s.imgPos,
              opacity: 0.75,
              transition: "transform 600ms ease, opacity 600ms",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: s.imgSide === "left"
                ? "linear-gradient(to right, rgba(0,0,0,0.3), transparent 50%, rgba(0,0,5,0.85))"
                : "linear-gradient(to left, rgba(0,0,0,0.3), transparent 50%, rgba(0,0,5,0.85))",
            }} />
          </div>

          {/* Text */}
          <div style={{
            order: s.imgSide === "left" ? 1 : 0,
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "clamp(36px, 6vw, 88px)",
          }}>
            <FadeSection>
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 18 }}>
                {s.num} — {s.tag}
              </p>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(38px, 5.5vw, 66px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                color: "var(--fg)",
                lineHeight: 1.05,
                marginBottom: 20,
                whiteSpace: "pre-line",
              }}>
                {s.title}
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(13px, 1.2vw, 15px)", lineHeight: 1.8, color: "var(--text-secondary)", maxWidth: 420, marginBottom: 28 }}>
                {s.body}
              </p>
              <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", textDecoration: "none" }}>
                Get Started <ArrowRight size={14} />
              </Link>
            </FadeSection>
          </div>
        </section>
      ))}

      {/* ══════════════════════════════════════
          CINEMATIC GALLERY
      ══════════════════════════════════════ */}
      <div style={{ height: "clamp(200px, 30vw, 380px)", display: "flex", gap: 1, overflow: "hidden" }}>
        {[
          { src: "/images/hero-barbell.jpg", pos: "center 40%", flex: 2 },
          { src: "/images/bg-iron.jpg",      pos: "center",      flex: 1 },
          { src: "/images/bg-weights.jpg",   pos: "center",      flex: 1 },
          { src: "/images/bg-dumbbell.jpg",  pos: "center",      flex: 1 },
          { src: "/images/hero-weights.jpg", pos: "center 50%",  flex: 2 },
        ].map((img, i) => (
          <div key={i} aria-hidden="true" style={{
            flex: img.flex, minWidth: 0,
            backgroundImage: `url(${img.src})`,
            backgroundSize: "cover",
            backgroundPosition: img.pos,
            opacity: 0.6,
          }} />
        ))}
      </div>

      {/* ══════════════════════════════════════
          NUMBERS BANNER
      ══════════════════════════════════════ */}
      <FadeSection>
        <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
            {[
              { num: "∞",    label: "PRs Possible" },
              { num: "0",    label: "Corporate Vibes" },
              { num: "6",    label: "Workout Modes" },
              { num: "100%", label: "Underground Iron" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "clamp(32px, 5vh, 52px) clamp(16px, 3vw, 32px)",
                textAlign: "center",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : undefined,
              }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px, 6.5vw, 76px)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--accent)", lineHeight: 1 }}>{s.num}</p>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginTop: 8 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* ══════════════════════════════════════
          MODES SHOWCASE
      ══════════════════════════════════════ */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(80px, 12vh, 130px) clamp(20px, 5vw, 48px)" }}>
        <FadeSection>
          <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vh, 64px)" }}>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>
              MOTIVATION MODES
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
              MATCH YOUR<br />MINDSET
            </h2>
          </div>
        </FadeSection>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 1 }}>
          {[
            { name: "MONK",    hex: "oklch(0.55 0.12 275)", tagline: "Discipline. Silence. Gains.", desc: "Blue focus mode. Zero distractions.", gradient: "135deg, rgba(40,40,100,0.4) 0%, rgba(0,0,5,0) 100%" },
            { name: "REVENGE", hex: "oklch(0.60 0.25 25)",  tagline: "Prove them wrong.",           desc: "Red fury mode. Channel the rage.",   gradient: "135deg, rgba(100,20,20,0.4) 0%, rgba(0,0,5,0) 100%" },
            { name: "WINTER",  hex: "oklch(0.80 0.05 240)", tagline: "Cold. Calculated. Relentless.",desc: "Ice-blue mode. Methodical grind.",  gradient: "135deg, rgba(30,60,90,0.4) 0%, rgba(0,0,5,0) 100%" },
            { name: "HAPPY",   hex: "oklch(0.85 0.20 80)",  tagline: "Good vibes, heavy plates.",   desc: "Warm gold mode. Enjoy the pump.",   gradient: "135deg, rgba(80,60,0,0.4) 0%, rgba(0,0,5,0) 100%" },
          ].map((m, i) => (
            <FadeSection key={i} delay={i * 80}>
              <div style={{
                padding: "clamp(24px, 3.5vw, 36px)",
                background: `linear-gradient(${m.gradient})`,
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                height: "100%",
              }}>
                <div style={{ width: 14, height: 14, background: m.hex, marginBottom: 24 }} />
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1, marginBottom: 8 }}>{m.name}</h3>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: m.hex, marginBottom: 10 }}>{m.tagline}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, lineHeight: 1.65, color: "var(--text-secondary)" }}>{m.desc}</p>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "clamp(440px, 65vh, 680px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/hero-barbell.jpg)", backgroundSize: "cover", backgroundPosition: "center 40%", opacity: 0.22 }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(204,255,0,0.06) 0%, rgba(0,0,5,0.85) 70%)" }} />

        <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "clamp(60px, 12vh, 110px) clamp(20px, 5vw, 48px)", maxWidth: 860 }}>
          <FadeSection>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(60px, 12vw, 110px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: "var(--fg)",
              lineHeight: 0.95,
              marginBottom: "clamp(24px, 4vh, 36px)",
            }}>
              READY TO<br />
              <span style={{
                background: "linear-gradient(90deg, #ccff00 0%, #88ff00 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>LIFT</span>?
            </h2>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: "clamp(12px, 1.4vw, 15px)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "clamp(32px, 5vh, 48px)", maxWidth: 500, margin: "0 auto clamp(32px,5vh,48px)" }}>
              Join the underground. No corporate fitness vibes — just iron, data, and competition.
            </p>
            <Link href="/auth/login" className="btn-primary" style={{ fontSize: "clamp(13px, 1.5vw, 15px)", padding: "clamp(14px, 2vh, 18px) clamp(36px, 5vw, 60px)" }}>
              Start Lifting — Free Forever
            </Link>
          </FadeSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "clamp(24px, 4vh, 40px) clamp(20px, 5vw, 48px)", paddingBottom: "max(clamp(24px,4vh,40px), calc(20px + env(safe-area-inset-bottom)))" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(18px, 2.5vw, 24px)", letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)" }}>PUMPS</span>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            TRACK EVERY REP. OWN THE BOARD.
          </span>
        </div>
      </footer>

    </div>
  )
}
