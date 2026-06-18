"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Dumbbell, BarChart3, Trophy, Swords, Zap, Users, ArrowRight, ChevronDown } from "lucide-react"
import { Reveal } from "@/components/ui/motion"
import { GlowRing } from "@/components/landing/glow-ring"
import { StatBar } from "@/components/ui/stat-bar"
import { Statement, Hl } from "@/components/ui/statement"
import { GlassFeatureCard } from "@/components/landing/glass-feature-card"
import { NodeDiagram, GlowChart, Radar } from "@/components/landing/feature-visuals"
import { Testimonial } from "@/components/landing/testimonial"

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

/* ─── Scrolled-past-threshold flag — drives the nav pill shrink (Verdant) ─── */
function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [threshold])
  return scrolled
}

export default function LandingPage() {
  /* Thin-phone flag (~360px) — reuses the existing mount-safe hook, no duplication */
  const isThin = useIsMobile(480)
  const scrolled = useScrolled()

  return (
    <div style={{ backgroundColor: "transparent", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════
          TOP NAV — floating glass pill, shrinks on scroll (Verdant)
      ══════════════════════════════════════ */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 90,
        display: "flex", justifyContent: "center",
        padding: scrolled ? "10px clamp(12px, 4vw, 24px)" : "clamp(14px, 2.4vh, 22px) clamp(12px, 4vw, 24px)",
        paddingTop: scrolled ? "max(10px, env(safe-area-inset-top))" : "max(clamp(14px, 2.4vh, 22px), env(safe-area-inset-top))",
        transition: "padding var(--duration-normal) var(--ease-expo)",
        pointerEvents: "none",
      }}>
        <nav style={{
          pointerEvents: "auto",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          width: "100%",
          maxWidth: scrolled ? 720 : 1100,
          height: scrolled ? 52 : 60,
          padding: "0 8px 0 clamp(16px, 2vw, 22px)",
          borderRadius: "var(--r-pill)",
          background: scrolled ? "color-mix(in oklch, var(--bg) 72%, transparent)" : "rgba(0,0,0,0.45)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid color-mix(in oklch, var(--accent) 12%, rgba(255,255,255,0.08))",
          boxShadow: scrolled ? "var(--glow-soft)" : "none",
          transition: "max-width var(--duration-normal) var(--ease-expo), height var(--duration-normal) var(--ease-expo), background var(--duration-normal) var(--ease-expo), box-shadow var(--duration-normal) var(--ease-expo)",
        }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: scrolled ? 19 : 22, fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", transition: "font-size var(--duration-normal) var(--ease-expo)" }}>
            PUMPS
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/auth/login" style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)", textDecoration: "none", padding: "8px 14px" }}>
              Sign In
            </Link>
            <Link href="/auth/login" className="btn-primary btn-shine" style={{ fontSize: 12, padding: "8px 18px", borderRadius: "var(--r-pill)" }}>
              Start Free
            </Link>
          </div>
        </nav>
      </div>

      {/* ══════════════════════════════════════
          HERO — clean animated title (no WebGL)
      ══════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          overflow: "hidden",
          padding: "clamp(96px, 14vh, 140px) clamp(20px, 5vw, 48px) clamp(48px, 9vh, 90px)",
        }}
        aria-label="Hero"
      >
        {/* Drifting aurora behind the title */}
        <div aria-hidden="true" className="hero-aurora" />
        {/* Glow ring framing the wordmark (NUORBIT portal) */}
        <GlowRing
          size={isThin ? 320 : 600}
          style={{ top: "calc(50% - clamp(20px, 8vh, 80px))", left: "50%", transform: "translate(-50%, -50%)" }}
        />

        {/* Rotated edge rails (Stoicism / S'Watch) */}
        <span className="k-rail left" aria-hidden="true">EST. UNDERGROUND</span>
        <span className="k-rail right" aria-hidden="true">TRACK · COMPETE · DOMINATE</span>

        <div style={{ position: "relative", maxWidth: 940 }}>
          <Reveal variant="fade" duration={800}>
            <p style={{
              fontFamily: "var(--font-heading-stack)",
              fontSize: "clamp(11px, 1.4vw, 14px)",
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "clamp(16px, 3vh, 24px)",
            }}>
              GYM JOURNALING — KINETIC EDITION
            </p>
          </Reveal>

          <Reveal variant="scale" delay={200} duration={900}>
            <h1 className="k-wordmark k-glow-text" style={{
              fontSize: "clamp(80px, 19vw, 220px)",
              letterSpacing: "clamp(0.1em, 2vw, 0.22em)",
              background: "linear-gradient(180deg, #f5f5f7 0%, rgba(245,245,247,0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              PUMPS
            </h1>
          </Reveal>

          <Reveal variant="up" delay={300} duration={900}>
            <p style={{
              fontFamily: "var(--font-heading-stack)",
              fontSize: "clamp(16px, 2.4vw, 24px)",
              fontWeight: 500,
              letterSpacing: "0.01em",
              color: "var(--text-secondary)",
              lineHeight: 1.45,
              maxWidth: 580,
              margin: "clamp(18px, 3vh, 28px) auto 0",
            }}>
              Track every rep. Compete live. Get <Hl serif>relentless</Hl>.
            </p>
          </Reveal>

          <Reveal variant="up" delay={420} duration={900}>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: "clamp(28px, 5vh, 44px)" }}>
              <Link href="/auth/login" className="btn-primary btn-shine" style={{ fontSize: "clamp(13px, 1.5vw, 15px)", padding: "clamp(14px, 2vh, 17px) clamp(28px, 4vw, 44px)" }}>
                Start Lifting — Free
              </Link>
              <Link href="/auth/login" className="btn-outline" style={{ fontSize: "clamp(13px, 1.5vw, 15px)", padding: "clamp(14px, 2vh, 17px) clamp(24px, 3.5vw, 36px)" }}>
                Sign In
              </Link>
            </div>
          </Reveal>

          <Reveal variant="up" delay={540} duration={900}>
            <StatBar
              stats={[
                { value: 100, suffix: "%", label: "Underground Iron" },
                { value: 6, label: "Motivation Modes" },
                { value: 0, label: "Corporate Vibes" },
              ]}
              style={{ justifyContent: "center", marginTop: "clamp(36px, 6vh, 56px)" }}
            />
          </Reveal>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: "absolute",
          bottom: "clamp(20px, 4vh, 36px)",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          pointerEvents: "none",
        }}>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-secondary)" }}>SCROLL</span>
          <div style={{ animation: "floatDown 1.6s ease-in-out infinite" }}>
            <ChevronDown size={16} color="var(--text-secondary)" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          THREE PILLARS — scroll-reveal word band
      ══════════════════════════════════════ */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(64px, 11vh, 120px) clamp(20px, 5vw, 48px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: isThin ? "1fr" : "repeat(3, 1fr)", gap: isThin ? 28 : "clamp(20px, 4vw, 56px)" }}>
          {[
            { word: "TRACK.", sub: "Every rep. Every set. Every PR.", variant: "left" as const },
            { word: "COMPETE.", sub: "Live duels. Real-time boards.", variant: "up" as const },
            { word: "DOMINATE.", sub: "Own the leaderboard.", variant: "right" as const },
          ].map((p, i) => (
            <Reveal key={i} variant={p.variant} delay={i * 120} duration={800}>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 6vw, 76px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                lineHeight: 1,
                background: "linear-gradient(135deg, #f5f5f7 30%, var(--accent) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {p.word}
              </h2>
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: "clamp(12px, 1.4vw, 15px)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)", marginTop: 12 }}>
                {p.sub}
              </p>
            </Reveal>
          ))}
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
          STATEMENT BAND — accent-keyword sentence (AgentAI)
      ══════════════════════════════════════ */}
      <section style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "clamp(70px, 12vh, 130px) clamp(20px, 5vw, 48px)" }}>
        <span className="k-rail left" aria-hidden="true">PHILOSOPHY</span>
        <Reveal variant="up" duration={900}>
          <Statement>
            We build for lifters who <Hl>keep score</Hl>. Every rep, every PR, every{" "}
            <Hl serif>live duel</Hl> — logged with intent, ranked without mercy.
          </Statement>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════
          FEATURES GRID — glassmorphism cards
      ══════════════════════════════════════ */}
      <section style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "clamp(80px, 14vh, 140px) clamp(20px, 5vw, 48px)",
      }}>
        <Reveal>
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
        </Reveal>

        {/* Hero trio — Verdant-style glass cards with glowing inner visuals */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: isThin ? 12 : 16, marginBottom: isThin ? 12 : 16 }}>
          {[
            { icon: Dumbbell,  title: "Unify every lift", body: "Sets, reps, weight — logged with precision and pulled into one source of truth.", viz: <NodeDiagram />, delay: 0 },
            { icon: BarChart3, title: "See what matters", body: "Volume history and PR timelines surface the trend so you watch the line climb.", viz: <GlowChart delta="+32%" />, delay: 120 },
            { icon: Trophy,    title: "Know your rank", body: "Athlete benchmarks place every lift — Beginner to Elite. No guessing.", viz: <Radar />, delay: 240 },
          ].map((f, i) => (
            <Reveal key={i} variant="up" delay={f.delay}>
              <GlassFeatureCard icon={f.icon} title={f.title} body={f.body}>{f.viz}</GlassFeatureCard>
            </Reveal>
          ))}
        </div>

        {/* Supporting trio */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: isThin ? 12 : 16 }}>
          {[
            { icon: Swords, title: "Live competition", body: "Race friends in real time — leaderboards update instantly as sets land.", delay: 0 },
            { icon: Zap,    title: "Motivation modes", body: "Monk, Revenge, Winter, Happy — the whole interface adapts to your mindset.", delay: 120 },
            { icon: Users,  title: "Train together", body: "Form squads, share stats, push each other toward new records.", delay: 240 },
          ].map((f, i) => (
            <Reveal key={i} variant="up" delay={f.delay}>
              <GlassFeatureCard icon={f.icon} title={f.title} body={f.body} />
            </Reveal>
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
            padding: isThin ? "28px 18px" : "clamp(36px, 6vw, 88px)",
          }}>
            <Reveal variant={s.imgSide === "left" ? "left" : "right"}>
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
            </Reveal>
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
      <Reveal>
        <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: isThin ? "1fr 1fr" : "repeat(auto-fit, minmax(160px, 1fr))" }}>
            {[
              { num: "∞",    label: "PRs Possible" },
              { num: "0",    label: "Corporate Vibes" },
              { num: "6",    label: "Workout Modes" },
              { num: "100%", label: "Underground Iron" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: isThin ? "clamp(26px, 4vh, 40px) 14px" : "clamp(32px, 5vh, 52px) clamp(16px, 3vw, 32px)",
                textAlign: "center",
                /* 2-up grid on thin phones: only odd cells get a right divider */
                borderRight: isThin ? (i % 2 === 0 ? "1px solid rgba(255,255,255,0.06)" : undefined) : (i < 3 ? "1px solid rgba(255,255,255,0.06)" : undefined),
                borderTop: isThin && i >= 2 ? "1px solid rgba(255,255,255,0.06)" : undefined,
              }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px, 6.5vw, 76px)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--accent)", lineHeight: 1 }}>{s.num}</p>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginTop: 8 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ══════════════════════════════════════
          MODES SHOWCASE
      ══════════════════════════════════════ */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(80px, 12vh, 130px) clamp(20px, 5vw, 48px)" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vh, 64px)" }}>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>
              MOTIVATION MODES
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
              MATCH YOUR<br />MINDSET
            </h2>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: isThin ? 10 : 1 }}>
          {[
            { name: "MONK",    hex: "oklch(0.55 0.12 275)", tagline: "Discipline. Silence. Gains.", desc: "Blue focus mode. Zero distractions.", gradient: "135deg, rgba(40,40,100,0.4) 0%, rgba(0,0,5,0) 100%" },
            { name: "REVENGE", hex: "oklch(0.60 0.25 25)",  tagline: "Prove them wrong.",           desc: "Red fury mode. Channel the rage.",   gradient: "135deg, rgba(100,20,20,0.4) 0%, rgba(0,0,5,0) 100%" },
            { name: "WINTER",  hex: "oklch(0.80 0.05 240)", tagline: "Cold. Calculated. Relentless.",desc: "Ice-blue mode. Methodical grind.",  gradient: "135deg, rgba(30,60,90,0.4) 0%, rgba(0,0,5,0) 100%" },
            { name: "HAPPY",   hex: "oklch(0.85 0.20 80)",  tagline: "Good vibes, heavy plates.",   desc: "Warm gold mode. Enjoy the pump.",   gradient: "135deg, rgba(80,60,0,0.4) 0%, rgba(0,0,5,0) 100%" },
          ].map((m, i) => (
            <Reveal key={i} variant="scale" delay={i * 80}>
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          SOCIAL PROOF — testimonial
      ══════════════════════════════════════ */}
      <section style={{ maxWidth: 880, margin: "0 auto", padding: "clamp(60px, 10vh, 110px) clamp(20px, 5vw, 48px)" }}>
        <Reveal variant="scale" duration={800}>
          <Testimonial
            quote="I stopped guessing. PUMPS shows me the line going up — and the leaderboard keeps me honest every single week."
            author="Marcus R."
            role="Powerlifter · 3-year streak"
          />
        </Reveal>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "clamp(440px, 65vh, 680px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/hero-barbell.jpg)", backgroundSize: "cover", backgroundPosition: "center 40%", opacity: 0.22 }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(204,255,0,0.06) 0%, rgba(0,0,5,0.85) 70%)" }} />

        <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "clamp(60px, 12vh, 110px) clamp(20px, 5vw, 48px)", maxWidth: 860 }}>
          <Reveal>
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
          </Reveal>
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
