"use client"

/**
 * Macro-distribution ring (design blueprint, Screen 05). A 3-segment SVG donut
 * showing the share of calories from protein / carbs / fat, with total calories
 * in the center. Pure SVG — no chart library — and the protein segment uses the
 * active-mode accent. Honest by construction: segments are proportional to
 * macro calories (P·4, C·4, F·9), so an empty day reads as an empty ring.
 */
const R = 64
const STROKE = 14
const SIZE = 160
const C = 2 * Math.PI * R

export function MacroRing({
  protein,
  carbs,
  fat,
  calories,
}: {
  protein: number
  carbs: number
  fat: number
  calories: number
}) {
  const segments = [
    { cal: protein * 4, color: "var(--accent)" },
    { cal: carbs * 4, color: "var(--accent-blue)" },
    { cal: fat * 9, color: "var(--warning)" },
  ]
  const totalCal = segments.reduce((s, x) => s + x.cal, 0)

  let offset = 0
  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--surface-elevated)" strokeWidth={STROKE} />
          {totalCal > 0 &&
            segments.map((s, i) => {
              const dash = (s.cal / totalCal) * C
              const el = (
                <circle
                  key={i}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={-offset}
                />
              )
              offset += dash
              return el
            })}
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, lineHeight: 0.85, color: "var(--fg)" }}>
          {Math.round(calories)}
        </span>
        <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.04em" }}>kcal</span>
      </div>
    </div>
  )
}
