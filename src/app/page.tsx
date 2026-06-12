import Link from "next/link"
import { Dumbbell, BarChart3, Trophy } from "lucide-react"

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <section style={{ position: "relative", height: "100vh", minHeight: 600, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/pumps/images/facility.jpg)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.35 }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, oklch(0.14 0.005 260 / 0.2) 0%, oklch(0.14 0.005 260 / 0.7) 50%, var(--bg) 100%)` }} />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "0 24px 80px", width: "100%" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(48px, 10vw, 96px)", letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1.05, marginBottom: 16 }}>
            Pumps
          </h1>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: "clamp(16px, 3vw, 24px)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 32 }}>
            TRACK. COMPETE. DOMINATE.
          </p>
          <Link href="/auth/login" className="btn-primary" style={{ fontSize: 14, padding: "14px 32px" }}>
            Start Lifting
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2, marginBottom: 80 }}>
          {[
            { icon: Dumbbell, label: "LOG", title: "Track Everything", desc: "Sets, reps, weight — logged with precision. Every workout, every exercise, every PR." },
            { icon: Trophy, label: "COMPETE", title: "Live Competition", desc: "Race friends in real time. Leaderboards update instantly as sets are logged." },
            { icon: BarChart3, label: "GROW", title: "See Your Progress", desc: "Charts show your strength climbing. Week over week, month over month." },
          ].map((f, i) => (
            <div key={i} className="card-elevated" style={{ padding: "32px 24px" }}>
              <f.icon size={20} style={{ color: "var(--accent)", marginBottom: 16 }} />
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>{f.label}</p>
              <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px 120px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6vw, 56px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1.1, marginBottom: 8 }}>
          Ready to Lift?
        </h2>
        <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 32 }}>
          Join the underground. No corporate fitness vibes — just iron.
        </p>
        <Link href="/auth/login" className="btn-primary" style={{ fontSize: 14, padding: "14px 36px" }}>
          Get Started
        </Link>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.04em", textTransform: "uppercase", color: "var(--fg)" }}>PUMPS</span>
          <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>TRACK EVERY REP. OWN THE BOARD.</span>
        </div>
      </footer>
    </div>
  )
}
