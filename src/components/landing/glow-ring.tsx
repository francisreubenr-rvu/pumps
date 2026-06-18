"use client"

import type { CSSProperties } from "react"

/**
 * GlowRing — a thin accent arc sweeping a circle, with a faint static inner
 * ring for depth. Pulled from the NUORBIT portal. Purely decorative; the spin
 * lives in `.glow-ring::before` (paused under reduced motion). Position it via
 * `style` (it renders absolute).
 */
export function GlowRing({
  size = 460,
  style,
  className,
}: {
  size?: number
  style?: CSSProperties
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", width: size, height: size, ...style }}
    >
      <span className="glow-ring" style={{ inset: 0 }} />
      <span
        className="glow-ring"
        style={{ inset: "16%", opacity: 0.45, boxShadow: "none" }}
      />
    </div>
  )
}
