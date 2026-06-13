"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AppNav } from "@/components/layout/nav"
import { Trophy } from "lucide-react"

export default function AthletesPage() {
  const [user, setUser] = useState<any>(null)
  const [benchmarks, setBenchmarks] = useState<any[]>([])
  const [athletes, setAthletes] = useState<string[]>([])
  const [selectedAthlete, setSelectedAthlete] = useState("")
  const [selectedExercise, setSelectedExercise] = useState("")
  const [userBest, setUserBest] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      setUser(data.user)
    })
  }, [router])

  useEffect(() => {
    const supabase = createClient()
    supabase.from("athlete_benchmarks").select("*").order("athlete_name").then(({ data }) => {
      setBenchmarks(data ?? [])
      const names: string[] = Array.from(new Set((data ?? []).map((b: any) => b.athlete_name as string)))
      setAthletes(names)
      if (names.length > 0) setSelectedAthlete(names[0])
    })
  }, [])

  useEffect(() => {
    if (!selectedAthlete || !benchmarks.length) return
    const exercises = benchmarks.filter(b => b.athlete_name === selectedAthlete).map(b => b.exercise_name)
    if (exercises.length > 0 && !exercises.includes(selectedExercise)) setSelectedExercise(exercises[0])
  }, [selectedAthlete, benchmarks])

  useEffect(() => {
    if (!user || !selectedExercise) return
    setLoading(true)
    const supabase = createClient()
    supabase
      .from("exercise_sets")
      .select("weight_kg, workout_exercises!inner(workouts!inner(user_id), exercises!inner(name))")
      .eq("completed", true)
      .eq("workout_exercises.workouts.user_id", user.id)
      .eq("workout_exercises.exercises.name", selectedExercise)
      .order("weight_kg", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setUserBest(data?.[0]?.weight_kg ?? null)
        setLoading(false)
      })
  }, [user, selectedExercise])

  const athleteBenchmarks = benchmarks.filter(b => b.athlete_name === selectedAthlete)
  const selectedBenchmark = athleteBenchmarks.find(b => b.exercise_name === selectedExercise)
  const athleteBest = selectedBenchmark?.weight_kg ?? 0
  const percentage = athleteBest > 0 && userBest != null ? Math.min(((userBest / athleteBest) * 100), 200) : 0
  const exercises = athleteBenchmarks.map(b => b.exercise_name)

  const ATHLETE_CATEGORIES: Record<string, { label: string; color: string }> = {
    bodybuilder: { label: "Bodybuilder", color: "var(--accent)" },
    powerlifter: { label: "Powerlifter", color: "var(--accent-red)" },
    weightlifter: { label: "Weightlifter", color: "var(--accent-blue)" },
    crossfit: { label: "CrossFit", color: "var(--text-secondary)" },
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
            Benchmark
          </h1>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 4 }}>
            Compare vs Elite Athletes
          </p>
        </div>

        {/* Selectors */}
        <div className="card-surface" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="label-sm" style={{ display: "block", marginBottom: 6 }}>Athlete</label>
              <select value={selectedAthlete} onChange={e => setSelectedAthlete(e.target.value)} className="input-field" style={{ width: "100%", padding: "10px 12px" }}>
                {athletes.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="label-sm" style={{ display: "block", marginBottom: 6 }}>Exercise</label>
              <select value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} className="input-field" style={{ width: "100%", padding: "10px 12px" }}>
                {exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>
          </div>
        </div>

        {selectedBenchmark && (
          <div className="card-surface" style={{ padding: 32 }}>
            {/* Athlete info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
              <div>
                <span className="label-sm" style={{ color: "var(--text-secondary)" }}>Comparing against</span>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, textTransform: "uppercase", color: "var(--fg)", lineHeight: 1.1, marginTop: 4 }}>
                  {selectedAthlete}
                </h2>
                {selectedBenchmark.era && (
                  <p className="label-sm" style={{ marginTop: 6 }}>{selectedBenchmark.era}</p>
                )}
              </div>
              {selectedBenchmark.category && (
                <span className="badge" style={{ background: ATHLETE_CATEGORIES[selectedBenchmark.category]?.color ?? "var(--surface-elevated)", color: "var(--bg)" }}>
                  {ATHLETE_CATEGORIES[selectedBenchmark.category]?.label ?? selectedBenchmark.category}
                </span>
              )}
            </div>

            {/* Comparison numbers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 32 }}>
              <div className="card-elevated" style={{ padding: 20 }}>
                <span className="label-sm" style={{ display: "block", marginBottom: 8 }}>{selectedAthlete}</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 600, color: "var(--fg)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{athleteBest}</span>
                  <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 16, color: "var(--text-secondary)", fontWeight: 500 }}>kg</span>
                </div>
                {selectedBenchmark.body_weight_kg && (
                  <p className="label-sm" style={{ marginTop: 8 }}>BW: {selectedBenchmark.body_weight_kg}kg · {((athleteBest / selectedBenchmark.body_weight_kg) * 100).toFixed(0)}% BW</p>
                )}
              </div>
              <div className="card-elevated" style={{ padding: 20 }}>
                <span className="label-sm" style={{ display: "block", marginBottom: 8 }}>Your Best</span>
                {loading ? (
                  <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, color: "var(--text-secondary)" }}>Loading…</p>
                ) : userBest != null ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 600, color: "var(--accent)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{userBest}</span>
                    <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 16, color: "var(--text-secondary)", fontWeight: 500 }}>kg</span>
                  </div>
                ) : (
                  <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>No data yet — log {selectedExercise.toLowerCase()}</p>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="label-sm">Your Progress</span>
                <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 20, fontWeight: 700, color: percentage >= 100 ? "var(--accent)" : "var(--fg)", letterSpacing: "-0.04em" }}>
                  {userBest != null && athleteBest > 0 ? `${((userBest / athleteBest) * 100).toFixed(1)}%` : "—"}
                </span>
              </div>
              <div style={{ height: 8, background: "var(--surface-elevated)", position: "relative" }}>
                <div style={{ height: "100%", width: `${Math.min(percentage, 100)}%`, background: "var(--accent)", transition: "width 0.6s var(--ease-expo)" }} />
                {percentage > 100 && (
                  <div style={{ position: "absolute", right: 0, top: -4, width: 16, height: 16, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trophy size={10} style={{ color: "var(--bg)" }} />
                  </div>
                )}
              </div>
            </div>

            {/* Motivational message */}
            {userBest != null && athleteBest > 0 && (
              <div style={{ padding: "16px 20px", background: "var(--surface-elevated)", borderLeft: "3px solid var(--accent)" }}>
                <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 600, color: "var(--fg)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {percentage >= 100
                    ? `You've surpassed ${selectedAthlete}. Legend status.`
                    : percentage >= 75
                    ? `${(100 - percentage).toFixed(1)}% away from ${selectedAthlete}'s ${selectedExercise.toLowerCase()}.`
                    : percentage >= 50
                    ? `Halfway to ${selectedAthlete}. Keep grinding.`
                    : `You're at ${percentage.toFixed(1)}% of ${selectedAthlete}'s ${selectedExercise.toLowerCase()}. The gap closes daily.`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* All benchmarks for athlete */}
        {athleteBenchmarks.length > 1 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 }}>
              All {selectedAthlete} Benchmarks
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {athleteBenchmarks.map((b, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedExercise(b.exercise_name)}
                  className={b.exercise_name === selectedExercise ? "card-elevated" : "card-surface"}
                  style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", border: b.exercise_name === selectedExercise ? "1px solid var(--accent)" : "1px solid var(--border)", cursor: "pointer", background: "none", width: "100%", textAlign: "left" }}
                >
                  <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "var(--fg)" }}>{b.exercise_name}</span>
                  <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{b.weight_kg}kg</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
