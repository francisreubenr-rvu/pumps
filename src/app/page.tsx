import Link from "next/link"
import { Dumbbell, Trophy, TrendingUp, Swords, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        {/* Brand mark — chalk circle */}
        <div className="mx-auto mb-10 relative">
          <div className="w-28 h-28 mx-auto rounded-full border-2 flex items-center justify-center relative"
            style={{ borderColor: 'var(--primary)', boxShadow: 'var(--shadow-glow-primary)' }}>
            <Dumbbell className="h-12 w-12" style={{ color: 'var(--primary)' }} />
          </div>
          {/* Chalk dust ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
        </div>

        <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-4" style={{ fontFamily: 'var(--font-heading-stack)', color: 'var(--fg)' }}>
          PUMPS
        </h1>
        <p className="text-xl md:text-2xl mb-2" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--primary)', fontWeight: 400 }}>
          TRACK. COMPETE. DOMINATE.
        </p>
        <p className="text-base leading-relaxed max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
          The gym journal built for lifters who keep score.
          Log workouts, race friends live, and climb the leaderboard.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/auth/login" className="btn-primary text-lg px-8 py-4">
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Feature pillars */}
      <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl w-full stagger">
        {[
          { icon: Dumbbell, title: "Log Everything", desc: "Sets, reps, weight — tracked with monospaced precision. Every workout, every exercise, every PR.", color: 'var(--primary)' },
          { icon: Swords, title: "Live Competition", desc: "Race friends in real time. Supabase-powered live leaderboards update as sets are logged.", color: 'var(--warning)' },
          { icon: TrendingUp, title: "See Your Growth", desc: "Interactive charts show your strength climbing over weeks, months, years.", color: 'var(--success)' },
        ].map(({ icon: Icon, title, desc, color }, i) => (
          <div key={i} className="card-sheet p-6 flex flex-col gap-3">
            <Icon className="h-8 w-8" style={{ color }} />
            <h3 className="text-lg font-bold tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>
              {title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-20 mb-16 text-center max-w-md">
        <div className="card-chalk p-8 flex flex-col items-center gap-4">
          <Trophy className="h-10 w-10" style={{ color: 'var(--accent-gold)' }} />
          <h2 className="text-2xl font-bold tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>
            READY TO LIFT?
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Join the underground gym. No corporate fitness vibes — just iron and chalk.
          </p>
          <Link href="/auth/login" className="btn-primary mt-2 w-full text-center">
            Start Lifting
          </Link>
        </div>
      </div>
    </div>
  )
}
