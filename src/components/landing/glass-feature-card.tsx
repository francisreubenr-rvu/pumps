"use client"

/**
 * GlassFeatureCard — DESIGN.md C3 (Verdant feature cards).
 *
 * A glassmorphic card that "glows from within": a glowing accent-tinted icon
 * tile sits at the top, then a Saira title and a muted body paragraph, with an
 * optional `children` slot below for an inner visual (built by a sibling task —
 * see feature-visuals.tsx, C4).
 *
 * Composition: the glass shell (.card-surface + accent-mixed border + soft glow
 * on hover) is the outer element that owns hover; the existing SpotlightCard
 * sits inside it as a transparent, full-height layer that contributes the
 * cursor-follow glow (and is already reduced-motion-safe). SpotlightCard only
 * accepts { children, className, color, style, onClick }, so hover lives on the
 * wrapper we own. Everything cascades from --accent / --bg → it recolors with
 * the active mode; no literal hex.
 */

import { useState, type CSSProperties, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { SpotlightCard } from "@/components/ui/interactive"
import { cn } from "@/lib/utils"

export function GlassFeatureCard({
  icon: Icon,
  title,
  body,
  children,
  className,
  style,
}: {
  icon: LucideIcon
  title: string
  body: string
  children?: ReactNode
  className?: string
  style?: CSSProperties
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={cn("card-surface", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: "100%",
        // accent-tinted glass border, mirroring DESIGN.md --glass-brd
        borderColor: "color-mix(in oklch, var(--accent) 14%, rgba(255,255,255,0.08))",
        // soft outer glow on hover — pulled from --glow-soft
        boxShadow: hovered ? "var(--glow-soft)" : "none",
        transition:
          "box-shadow var(--duration-normal) var(--ease-apple), border-color var(--duration-normal) var(--ease-apple)",
        ...style,
      }}
    >
      <SpotlightCard
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          padding: "var(--card-pad)",
          // transparent layer over the glass shell — its only job is the
          // cursor-follow glow + holding content; inherit the shell's radius
          background: "transparent",
          borderRadius: "var(--r-xl)",
        }}
      >
        {/* glowing icon tile */}
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: "var(--r-md)",
            color: "var(--accent)",
            background: "color-mix(in oklch, var(--accent) 12%, transparent)",
            border: "1px solid color-mix(in oklch, var(--accent) 28%, transparent)",
            boxShadow: "var(--glow-accent)",
          }}
        >
          <Icon size={22} />
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <h3 className="k-title" style={{ fontSize: "clamp(16px, 2.2vw, 19px)" }}>
            {title}
          </h3>
          <p className="k-row-sub" style={{ lineHeight: 1.55, color: "var(--text-secondary)" }}>
            {body}
          </p>
        </div>

        {/* optional inner visual, pinned to the bottom so cards in a grid align */}
        {children != null && <div style={{ marginTop: "auto" }}>{children}</div>}
      </SpotlightCard>
    </div>
  )
}
