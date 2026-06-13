"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { AppNav } from "@/components/layout/nav"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Camera, Plus, Flame, Beef, Wheat, Droplets } from "lucide-react"

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const

export default function NutritionPage() {
  const [user, setUser] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      setUser(data.user)
    })
  }, [router])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase.from("meal_logs").select("*").eq("user_id", user.id).eq("date", selectedDate).order("created_at", { ascending: true })
      .then(({ data }) => { setLogs(data ?? []); setLoading(false) })
  }, [user, selectedDate])

  const totals = logs.reduce((acc, l) => ({
    calories: acc.calories + (l.calories ?? 0),
    protein: acc.protein + (l.protein_g ?? 0),
    carbs: acc.carbs + (l.carbs_g ?? 0),
    fat: acc.fat + (l.fat_g ?? 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  const macroData = [
    { name: "Protein", value: totals.protein, color: "var(--accent)" },
    { name: "Carbs", value: totals.carbs, color: "var(--accent-blue)" },
    { name: "Fat", value: totals.fat, color: "var(--accent-red)" },
  ].filter(d => d.value > 0)

  const statCards = [
    { label: "Calories", value: Math.round(totals.calories), unit: "kcal", icon: Flame, color: "var(--accent)" },
    { label: "Protein", value: Math.round(totals.protein), unit: "g", icon: Beef, color: "var(--accent)" },
    { label: "Carbs", value: Math.round(totals.carbs), unit: "g", icon: Wheat, color: "var(--accent-blue)" },
    { label: "Fat", value: Math.round(totals.fat), unit: "g", icon: Droplets, color: "var(--accent-red)" },
  ]

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
              Nutrition
            </h1>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 4 }}>
              Calorie Tracker
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="input-field"
              style={{ padding: "8px 12px", fontSize: 12 }}
            />
            <Link href="/nutrition/scan" className="btn-primary" style={{ gap: 8 }}>
              <Camera size={14} aria-hidden="true" /> Scan Food
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, marginBottom: 32 }}>
          {statCards.map(s => (
            <div key={s.label} className="card-surface" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <s.icon size={13} style={{ color: s.color }} aria-hidden="true" />
                <span className="label-sm">{s.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 28, fontWeight: 700, color: "var(--fg)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
                <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase" }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2, marginBottom: 32 }}>
          {/* Meal log */}
          <div className="card-surface" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)", marginBottom: 20 }}>
              Meals
            </h3>
            {loading ? (
              <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-heading-stack)", fontSize: 12 }}>Loading…</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {MEAL_TYPES.map(mt => {
                  const mealLogs = logs.filter(l => l.meal_type === mt)
                  return (
                    <div key={mt}>
                      <p className="label-sm" style={{ marginBottom: 8 }}>{mt}</p>
                      {mealLogs.length === 0 ? (
                        <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--text-secondary)", padding: "8px 0" }}>Nothing logged</p>
                      ) : (
                        mealLogs.map(l => (
                          <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                            <div>
                              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, color: "var(--fg)", textTransform: "uppercase" }}>{l.food_name}</p>
                              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, color: "var(--text-secondary)" }}>
                                P: {l.protein_g}g · C: {l.carbs_g}g · F: {l.fat_g}g
                              </p>
                            </div>
                            <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}>
                              {l.calories} kcal
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Macro donut */}
          <div className="card-surface" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)", marginBottom: 20 }}>
              Macros
            </h3>
            {macroData.length > 0 ? (
              <>
                <div style={{ height: 160 }} aria-hidden="true">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={macroData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                        {macroData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 0, fontSize: 11, fontFamily: "var(--font-heading-stack)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {macroData.map(d => (
                    <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, background: d.color }} />
                        <span className="label-sm">{d.name}</span>
                      </div>
                      <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>{Math.round(d.value)}g</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)", textAlign: "center", padding: "20px 0" }}>Log food to see macros</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
