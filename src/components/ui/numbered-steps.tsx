"use client"

import type { CSSProperties } from "react"

/**
 * NumberedSteps — the S'Watch "01 02 03 04" index. Active step gets the accent +
 * a struck rule; done steps dim, upcoming dim more. Pass `onSelect` to make it
 * interactive, omit it for a read-only progress rail.
 */
export type Step = { n: string; label: string }

export function NumberedSteps({
  steps,
  active,
  onSelect,
  className,
  style,
}: {
  steps: Step[]
  active: number
  onSelect?: (index: number) => void
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 16, ...style }}>
      {steps.map((s, i) => {
        const isActive = i === active
        const done = i < active
        return (
          <button
            key={i}
            type="button"
            onClick={onSelect ? () => onSelect(i) : undefined}
            disabled={!onSelect}
            aria-current={isActive ? "step" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "none",
              border: "none",
              padding: 0,
              textAlign: "left",
              cursor: onSelect ? "pointer" : "default",
              opacity: isActive ? 1 : done ? 0.7 : 0.4,
              transition: "opacity 250ms var(--ease-expo)",
            }}
          >
            <span
              style={{
                position: "relative",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(26px, 3.6vw, 38px)",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              {s.n}
              {isActive && (
                <span
                  aria-hidden="true"
                  style={{ position: "absolute", left: 0, right: -10, top: "50%", height: 2, background: "var(--accent)" }}
                />
              )}
            </span>
            <span
              style={{
                fontFamily: "var(--font-heading-stack)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: isActive ? "var(--fg)" : "var(--text-secondary)",
              }}
            >
              {s.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
