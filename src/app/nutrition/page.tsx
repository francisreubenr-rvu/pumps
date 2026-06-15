"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Camera } from "lucide-react"
import { useUser } from "@/lib/queries/auth"
import { useMealLogs } from "@/lib/queries/nutrition"
import { mealTotals } from "@/lib/metrics"
import { MacroRing } from "@/components/nutrition/macro-ring"
import { PageShell, PageTitle, Card, EmptyState } from "@/components/ui/kinetic"

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const

export default function NutritionPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const router = useRouter()

  const { data: user, isLoading: userLoading } = useUser()
  const { data: logs = [], isPending } = useMealLogs(user?.id, selectedDate)

  useEffect(() => {
    if (!userLoading && !user) router.replace("/auth/login")
  }, [userLoading, user, router])

  const loading = userLoading || (!!user && isPending)
  const totals = mealTotals(logs)

  // Macro bars are by share of macro calories (P·4, C·4, F·9) — honest split.
  const macroCals = { protein: totals.protein * 4, carbs: totals.carbs * 4, fat: totals.fat * 9 }
  const macroTotal = macroCals.protein + macroCals.carbs + macroCals.fat
  const macros = [
    { name: "Protein", grams: totals.protein, color: "var(--accent)", pct: macroTotal ? Math.round((macroCals.protein / macroTotal) * 100) : 0 },
    { name: "Carbs", grams: totals.carbs, color: "var(--accent-blue)", pct: macroTotal ? Math.round((macroCals.carbs / macroTotal) * 100) : 0 },
    { name: "Fat", grams: totals.fat, color: "var(--warning)", pct: macroTotal ? Math.round((macroCals.fat / macroTotal) * 100) : 0 },
  ]

  return (
    <PageShell>
      <div className="k-section" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <PageTitle title="Nutrition" eyebrow="Calorie tracker" />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="input-field"
            style={{ padding: "9px 12px", fontSize: 12, width: "auto" }}
          />
          <Link href="/nutrition/scan" className="btn-primary" style={{ gap: 8, fontSize: 12, padding: "9px 16px" }}>
            <Camera size={14} aria-hidden="true" /> Scan food
          </Link>
        </div>
      </div>

      {/* Calories + macros */}
      <Card className="k-section" style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
        <MacroRing protein={totals.protein} carbs={totals.carbs} fat={totals.fat} calories={totals.calories} />
        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 16 }}>
          {macros.map(m => (
            <div key={m.name}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span className="k-row-title">{m.name}</span>
                <span className="k-row-sub">{Math.round(m.grams)}g · {m.pct}%</span>
              </div>
              <div style={{ height: 7, borderRadius: "var(--r-pill)", background: "var(--surface-elevated)", overflow: "hidden" }}>
                <div style={{ width: `${m.pct}%`, height: "100%", background: m.color, borderRadius: "var(--r-pill)" }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Meals */}
      <Card>
        <h3 className="k-title" style={{ marginBottom: 20 }}>Meals</h3>
        {loading ? (
          <EmptyState message="Loading…" />
        ) : logs.length === 0 ? (
          <EmptyState message="Nothing logged today — scan a meal to get started." actionHref="/nutrition/scan" actionLabel="Scan food" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {MEAL_TYPES.map(mt => {
              const mealLogs = logs.filter(l => l.meal_type === mt)
              if (mealLogs.length === 0) return null
              return (
                <div key={mt}>
                  <p className="k-eyebrow" style={{ marginBottom: 8, textTransform: "capitalize" }}>{mt}</p>
                  {mealLogs.map(l => (
                    <div key={l.id} className="k-list-row">
                      <div>
                        <p className="k-row-title">{l.food_name}</p>
                        <p className="k-row-sub" style={{ marginTop: 2 }}>P {l.protein_g}g · C {l.carbs_g}g · F {l.fat_g}g</p>
                      </div>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--fg)" }}>
                        {l.calories}<span style={{ fontSize: 11, color: "var(--text-secondary)", marginLeft: 3 }}>kcal</span>
                      </span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </PageShell>
  )
}
