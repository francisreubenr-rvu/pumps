import Link from "next/link"
import { Dumbbell, BarChart3, Trophy, Swords, Zap, Users, ChevronDown, ArrowRight } from "lucide-react"
import { HeroVideo } from "@/components/landing/hero-video"
import { existsSync } from "fs"
import { join } from "path"

function heroVideoSrc() {
  const candidates = ["hero-gym-compressed.mp4", "hero-gym.mp4", "gym-rack.mp4", "gym-lift.mp4"]
  for (const f of candidates) {
    if (existsSync(join(process.cwd(), "public", "videos", f))) return `/videos/${f}`
  }
  return null
}

export default function LandingPage() {
  const videoSrc = heroVideoSrc()

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>

      {/* ══════════════════════════════════════════════════
          MINIMAL TOP NAV
      ══════════════════════════════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 90,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px, 5vw, 48px)",
        height: 60,
        paddingTop: "env(safe-area-inset-top)",
        background: "linear-gradient(to bottom, oklch(0.14 0.005 260 / 0.8) 0%, transparent 100%)",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)" }}>
          PUMPS
        </span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/auth/login" className="btn-outline" style={{ fontSize: 12, padding: "8px 20px" }}>
            Sign In
          </Link>
          <Link href="/auth/login" className="btn-primary" style={{ fontSize: 12, padding: "8px 20px" }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════
          HERO — FULL VIEWPORT VIDEO/IMAGE
      ══════════════════════════════════════════════════ */}
      <section id="hero" style={{ position: "relative", height: "100dvh", minHeight: 600, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>

        {/* Background — video preferred, image fallback */}
        {videoSrc ? (
          <HeroVideo
            src={videoSrc}
            poster="/images/hero-deadlift.jpg"
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              position: "absolute", inset: 0,
              backgroundImage: "url(/images/hero-deadlift.jpg)",
              backgroundSize: "cover", backgroundPosition: "center 30%",
              opacity: 0.5,
            }}
          />
        )}

        {/* Gradient overlays */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, oklch(0.14 0.005 260 / 0.1) 0%, oklch(0.14 0.005 260 / 0.3) 35%, oklch(0.14 0.005 260 / 0.75) 65%, var(--bg) 100%)" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, oklch(0.14 0.005 260 / 0.5) 0%, transparent 60%)" }} />

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 10, padding: "0 clamp(20px, 5vw, 80px) clamp(60px, 10vh, 120px)", maxWidth: 1400, width: "100%" }}>
          <div style={{ marginBottom: 12 }}>
            <span className="badge" style={{ fontSize: 10, letterSpacing: "0.12em", padding: "4px 12px" }}>
              KINETIC EDITION
            </span>
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "clamp(80px, 17vw, 180px)",
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "var(--fg)",
            lineHeight: 0.9,
            marginBottom: "clamp(16px, 3vh, 28px)",
          }}>
            PUMPS
          </h1>
          <p style={{
            fontFamily: "var(--font-heading-stack)",
            fontSize: "clamp(14px, 2.5vw, 22px)",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--fg)",
            marginBottom: "clamp(24px, 4vh, 40px)",
            maxWidth: 560,
            lineHeight: 1.5,
          }}>
            Track every rep.{" "}
            <span style={{ color: "var(--accent)" }}>Compete</span>{" "}
            in real time. Own the board.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/auth/login" className="btn-primary" style={{ fontSize: "clamp(12px, 1.5vw, 14px)", padding: "clamp(12px,1.8vh,16px) clamp(24px,4vw,40px)" }}>
              Start Lifting — It&apos;s Free
            </Link>
            <a href="#features" className="btn-outline" style={{ fontSize: "clamp(12px, 1.5vw, 14px)", padding: "clamp(12px,1.8vh,16px) clamp(24px,4vw,40px)" }}>
              See Features
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 10, animation: "floatDown 2s ease-in-out infinite", opacity: 0.4 }}>
          <ChevronDown size={22} color="var(--fg)" aria-hidden="true" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATEMENT BAR
      ══════════════════════════════════════════════════ */}
      <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "clamp(14px, 2vh, 20px) clamp(20px, 5vw, 48px)", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: "clamp(32px, 6vw, 80px)", whiteSpace: "nowrap", animation: "marquee 24s linear infinite" }}>
          {["TRACK EVERY REP", "COMPETE IN REAL TIME", "OWN THE LEADERBOARD", "TRAIN WITH YOUR SQUAD", "LOG EVERY PR", "BREAK YOUR LIMITS", "TRACK EVERY REP", "COMPETE IN REAL TIME", "OWN THE LEADERBOARD", "TRAIN WITH YOUR SQUAD"].map((t, i) => (
            <span key={i} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(16px, 2.5vw, 22px)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: i % 2 === 0 ? "var(--fg)" : "var(--accent)" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════ */}
      <section id="features" style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(60px, 10vh, 120px) clamp(20px, 5vw, 48px)" }}>
        <div style={{ marginBottom: "clamp(40px, 6vh, 64px)" }}>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>
            EVERYTHING YOU NEED
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1, maxWidth: 700 }}>
            BUILT FOR LIFTERS WHO KEEP SCORE
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 2 }}>
          {[
            { icon: Dumbbell, label: "LOG", title: "Track Everything", desc: "Sets, reps, weight — logged with precision. Every workout, every exercise, every PR. Real-time sync across devices." },
            { icon: Swords, label: "COMPETE", title: "Live Competition", desc: "Race friends in real time. Leaderboards update instantly as sets are logged. Head-to-head exercise duels, anytime." },
            { icon: BarChart3, label: "GROW", title: "See Your Progress", desc: "Volume history charts show your strength climbing week over week. Visualize exactly where you peaked." },
            { icon: Zap, label: "MODE", title: "Motivation Modes", desc: "Switch between Monk, Revenge, Winter, and Happy modes. The entire interface adapts to your current mindset." },
            { icon: Users, label: "SQUADS", title: "Train Together", desc: "Form squads, share stats, and push each other to hit new records. Group leaderboards built-in." },
            { icon: Trophy, label: "RANKS", title: "Athlete Benchmarks", desc: "See where your lifts rank against strength standards. Beginner to Elite — know your level." },
          ].map((f, i) => (
            <div key={i} className="card-elevated" style={{ padding: "clamp(20px, 3vw, 32px)", display: "flex", flexDirection: "column", gap: 12 }}>
              <f.icon size={18} style={{ color: "var(--accent)" }} aria-hidden="true" />
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)" }}>{f.label}</p>
              <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: "clamp(14px, 1.5vw, 17px)", fontWeight: 700, letterSpacing: "-0.03em", textTransform: "uppercase", color: "var(--fg)" }}>{f.title}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)", flex: 1 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SPLIT SHOWCASE — LOG
      ══════════════════════════════════════════════════ */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "clamp(400px, 55vh, 600px)" }} className="split-section">
        <div style={{ position: "relative", overflow: "hidden", minHeight: 300 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/bg-plates.jpg)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.7 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, var(--bg) 100%)" }} />
        </div>
        <div style={{ background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(32px, 5vw, 80px)" }}>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 16 }}>01 — LOG</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1.05, marginBottom: 20 }}>
            EVERY REP.<br />EVERY SET.<br />EVERY PR.
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(13px, 1.2vw, 15px)", lineHeight: 1.75, color: "var(--text-secondary)", maxWidth: 400, marginBottom: 28 }}>
            Log workouts with zero friction. Add exercises from a curated library, track sets with weight and reps, and watch your volume history build in real time.
          </p>
          <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", textDecoration: "none" }}>
            Start Logging <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SPLIT SHOWCASE — COMPETE (flipped)
      ══════════════════════════════════════════════════ */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "clamp(400px, 55vh, 600px)" }} className="split-section">
        <div style={{ background: "var(--bg)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(32px, 5vw, 80px)" }}>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 16 }}>02 — COMPETE</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1.05, marginBottom: 20 }}>
            RACE LIVE.<br />WIN NOW.<br />NO EXCUSES.
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(13px, 1.2vw, 15px)", lineHeight: 1.75, color: "var(--text-secondary)", maxWidth: 400, marginBottom: 28 }}>
            Challenge anyone to a live exercise duel. First to hit the target volume wins. Leaderboards update with every set — no refresh, no delay. The pressure is real.
          </p>
          <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", textDecoration: "none" }}>
            Start Competing <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ position: "relative", overflow: "hidden", minHeight: 300 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/gym-dark-2.jpg)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.75 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent 50%, var(--bg) 100%)" }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SPLIT SHOWCASE — PROGRESS
      ══════════════════════════════════════════════════ */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "clamp(400px, 55vh, 600px)" }} className="split-section">
        <div style={{ position: "relative", overflow: "hidden", minHeight: 300 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/gym-chalk.jpg)", backgroundSize: "cover", backgroundPosition: "center 20%", opacity: 0.75 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, var(--surface) 100%)" }} />
        </div>
        <div style={{ background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(32px, 5vw, 80px)" }}>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 16 }}>03 — GROW</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1.05, marginBottom: 20 }}>
            SEE THE<br />GAINS.<br />PROVE IT.
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(13px, 1.2vw, 15px)", lineHeight: 1.75, color: "var(--text-secondary)", maxWidth: 400, marginBottom: 28 }}>
            Volume history charts, PR timelines, athlete benchmarks. Know exactly where your lifts rank — Beginner to Elite — and watch the line go up.
          </p>
          <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", textDecoration: "none" }}>
            Track Progress <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CINEMATIC GALLERY STRIP
      ══════════════════════════════════════════════════ */}
      <div style={{ height: "clamp(180px, 28vw, 340px)", display: "flex", gap: 2, overflow: "hidden" }}>
        {[
          { src: "/images/hero-barbell.jpg", pos: "center 40%", flex: 2 },
          { src: "/images/bg-weights.jpg",  pos: "center", flex: 1 },
          { src: "/images/bg-iron.jpg",     pos: "center", flex: 1 },
          { src: "/images/bg-dumbbell.jpg", pos: "center", flex: 1 },
          { src: "/images/hero-weights.jpg",pos: "center 50%", flex: 2 },
        ].map((img, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              flex: img.flex, minWidth: 0,
              backgroundImage: `url(${img.src})`,
              backgroundSize: "cover",
              backgroundPosition: img.pos,
              opacity: 0.65,
              transition: "opacity 300ms",
            }}
          />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          NUMBERS BANNER
      ══════════════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          {[
            { num: "∞", label: "PRs Possible" },
            { num: "0", label: "Corporate Vibes" },
            { num: "6", label: "Workout Modes" },
            { num: "100%", label: "Underground Iron" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                padding: "clamp(28px, 5vh, 48px) clamp(16px, 3vw, 32px)",
                textAlign: "center",
                borderRight: i < 3 ? "1px solid var(--border)" : undefined,
              }}
            >
              <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(44px, 6vw, 72px)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--accent)", lineHeight: 1 }}>{s.num}</p>
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginTop: 8 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MODES SHOWCASE
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(60px, 10vh, 120px) clamp(20px, 5vw, 48px)" }}>
        <div style={{ marginBottom: "clamp(32px, 5vh, 56px)" }}>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>
            MOTIVATION MODES
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
            MATCH YOUR<br />MINDSET
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
          {[
            { name: "MONK", color: "oklch(0.55 0.12 275)", tagline: "Discipline. Silence. Gains.", desc: "Blue focus mode. Zero distractions." },
            { name: "REVENGE", color: "oklch(0.60 0.25 25)", tagline: "Prove them wrong.", desc: "Red fury mode. Channel the rage." },
            { name: "WINTER", color: "oklch(0.80 0.05 240)", tagline: "Cold. Calculated. Relentless.", desc: "Ice-blue mode. Methodical grind." },
            { name: "HAPPY", color: "oklch(0.85 0.20 80)", tagline: "Good vibes, heavy plates.", desc: "Warm gold mode. Enjoy the pump." },
          ].map((m, i) => (
            <div key={i} className="card-surface" style={{ padding: "clamp(20px, 3vw, 32px)" }}>
              <div style={{ width: 12, height: 12, background: m.color, marginBottom: 20 }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1, marginBottom: 8 }}>{m.name}</h3>
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: m.color, marginBottom: 10 }}>{m.tagline}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, lineHeight: 1.6, color: "var(--text-secondary)" }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FINAL CTA — VIDEO/IMAGE BACKGROUND
      ══════════════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "clamp(400px, 60vh, 600px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/hero-barbell.jpg)", backgroundSize: "cover", backgroundPosition: "center 40%", opacity: 0.3 }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "oklch(0.14 0.005 260 / 0.7)" }} />

        <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "clamp(48px, 10vh, 100px) clamp(20px, 5vw, 48px)", maxWidth: 800 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(52px, 10vw, 96px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 0.95, marginBottom: "clamp(20px, 3vh, 32px)" }}>
            READY TO<br />
            <span style={{ color: "var(--accent)" }}>LIFT</span>?
          </h2>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: "clamp(12px, 1.5vw, 15px)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "clamp(28px, 5vh, 44px)", maxWidth: 500, margin: "0 auto clamp(28px,5vh,44px)" }}>
            Join the underground. No corporate fitness vibes — just iron, data, and competition.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/login" className="btn-primary" style={{ fontSize: "clamp(13px, 1.5vw, 15px)", padding: "clamp(14px, 2vh, 18px) clamp(32px, 5vw, 56px)" }}>
              Start Lifting — Free Forever
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "clamp(24px, 4vh, 40px) clamp(20px, 5vw, 48px)", paddingBottom: "max(clamp(24px, 4vh, 40px), calc(20px + env(safe-area-inset-bottom)))" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(18px, 2.5vw, 24px)", letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)" }}>PUMPS</span>
          <div style={{ display: "flex", gap: "clamp(16px, 3vw, 32px)", flexWrap: "wrap" }}>
            {["Privacy", "Terms", "Contact"].map(t => (
              <span key={t} style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)", cursor: "default" }}>{t}</span>
            ))}
          </div>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>TRACK EVERY REP. OWN THE BOARD.</span>
        </div>
      </footer>

    </div>
  )
}
