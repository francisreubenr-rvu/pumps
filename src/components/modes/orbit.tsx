"use client"

/**
 * OrbitNav — a presentational "weight-collar ring" navigator.
 *
 * Reframes the Stoicism orbit / S'Watch circular framing for a gym: a glowing
 * center disc (the plate/collar) with N tiles arranged evenly around it on a
 * circle. Each tile glows in its own color when active or hovered. Tile
 * positions are computed with trig around the ring radius.
 *
 * Below ~560px the ring math gets cramped, so it degrades to a simple vertical
 * stack of the same tiles. Everything cascades from the --accent / --bg token
 * system, so it themes with the active mode. No framer-motion — the only motion
 * is the shared `.glow-ring` sweep (already paused under reduced motion) and
 * CSS transitions on the tiles.
 */

import { useEffect, useState, type CSSProperties } from "react"
import { cn } from "@/lib/utils"

export type OrbitItem = {
  id: string
  label: string
  color?: string
}

/* ─── Mobile breakpoint hook (mount-safe — no SSR hydration mismatch) ─── */
function useIsMobile(bp = 560) {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const update = () => setMobile(window.innerWidth < bp)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [bp])
  return mobile
}

/* ── Tile ── a single orbit/stack button; glows in its own color when active ── */
function OrbitTile({
  item,
  active,
  onSelect,
  style,
}: {
  item: OrbitItem
  active: boolean
  onSelect?: (id: string) => void
  style?: CSSProperties
}) {
  const color = item.color ?? "var(--accent)"
  return (
    <button
      type="button"
      aria-pressed={active}
      data-active={active}
      onClick={() => onSelect?.(item.id)}
      className="orbit-tile"
      style={{ ["--tile-color" as string]: color, ...style } as CSSProperties}
    >
      <span aria-hidden="true" className="orbit-tile-dot" />
      <span className="orbit-tile-label">{item.label}</span>
    </button>
  )
}

export function OrbitNav({
  items,
  activeId,
  onSelect,
  size = 420,
  className,
}: {
  items: OrbitItem[]
  activeId?: string
  onSelect?: (id: string) => void
  size?: number
  className?: string
}) {
  const isMobile = useIsMobile(560)

  /* ── Mobile / narrow fallback: vertical stack (ring trig breaks on tiny widths) ── */
  if (isMobile) {
    return (
      <nav
        className={cn("orbit-stack", className)}
        aria-label="Modes"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          width: "100%",
          maxWidth: 360,
          margin: "0 auto",
        }}
      >
        {items.map((item) => (
          <OrbitTile
            key={item.id}
            item={item}
            active={item.id === activeId}
            onSelect={onSelect}
            style={{ width: "100%" }}
          />
        ))}
      </nav>
    )
  }

  /* ── Ring layout: place each tile on a circle via trig ──
     - radius leaves room (inset) so tiles don't clip the square edge
     - start at 12 o'clock (−90°) and step evenly clockwise */
  const inset = Math.round(size * 0.16)
  const radius = size / 2 - inset
  const count = items.length || 1

  return (
    <nav
      className={cn("orbit-ring", className)}
      aria-label="Modes"
      style={{
        position: "relative",
        width: size,
        height: size,
        maxWidth: "100%",
        aspectRatio: "1 / 1",
        margin: "0 auto",
      }}
    >
      {/* Decorative glowing center disc — the plate / collar */}
      <span
        aria-hidden="true"
        className="glow-ring"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "44%",
          height: "44%",
          transform: "translate(-50%, -50%)",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "30%",
          height: "30%",
          transform: "translate(-50%, -50%)",
          borderRadius: "var(--r-pill)",
          background:
            "radial-gradient(circle at 50% 38%, color-mix(in oklch, var(--accent) 26%, transparent), color-mix(in oklch, var(--accent) 6%, transparent) 62%, transparent 78%)",
          boxShadow: "var(--glow-soft)",
          pointerEvents: "none",
        }}
      />

      {/* Tiles arranged on the circle */}
      {items.map((item, i) => {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2
        const x = 50 + (Math.cos(angle) * radius * 100) / size
        const y = 50 + (Math.sin(angle) * radius * 100) / size
        return (
          <OrbitTile
            key={item.id}
            item={item}
            active={item.id === activeId}
            onSelect={onSelect}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )
      })}

      {/* Scoped styles — tokens only, mode-safe; no edits to globals.css */}
      <style>{`
        .orbit-tile {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: 10px 16px;
          min-height: 40px;
          white-space: nowrap;
          cursor: pointer;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-pill);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          font-family: var(--font-heading-stack);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          box-shadow: 0 0 0 0 transparent;
          transition:
            color var(--duration-normal) var(--ease-expo),
            border-color var(--duration-normal) var(--ease-expo),
            background var(--duration-normal) var(--ease-expo),
            box-shadow var(--duration-normal) var(--ease-expo),
            transform var(--duration-normal) var(--ease-expo);
        }
        .orbit-tile:hover {
          color: var(--fg);
          transform: translate(-50%, -50%) translateY(-2px);
          border-color: color-mix(in oklch, var(--tile-color) 55%, transparent);
          box-shadow: 0 0 26px color-mix(in oklch, var(--tile-color) 35%, transparent);
        }
        .orbit-stack .orbit-tile:hover {
          transform: translateY(-2px);
        }
        .orbit-tile[data-active="true"] {
          color: var(--fg);
          border-color: color-mix(in oklch, var(--tile-color) 70%, transparent);
          box-shadow:
            0 0 30px color-mix(in oklch, var(--tile-color) 42%, transparent),
            inset 0 0 0 1px color-mix(in oklch, var(--tile-color) 30%, transparent);
          background: color-mix(in oklch, var(--tile-color) 10%, var(--surface));
        }
        .orbit-tile:focus-visible {
          outline: 2px solid var(--tile-color);
          outline-offset: 2px;
        }
        .orbit-tile-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: var(--r-pill);
          background: var(--text-tertiary);
          transition: background var(--duration-normal) var(--ease-expo),
            box-shadow var(--duration-normal) var(--ease-expo);
        }
        .orbit-tile:hover .orbit-tile-dot,
        .orbit-tile[data-active="true"] .orbit-tile-dot {
          background: var(--tile-color);
          box-shadow: 0 0 10px color-mix(in oklch, var(--tile-color) 60%, transparent);
        }
        .orbit-tile-label { line-height: 1; }
        @media (prefers-reduced-motion: reduce) {
          .orbit-tile,
          .orbit-tile:hover,
          .orbit-stack .orbit-tile:hover {
            transition: none;
          }
        }
      `}</style>
    </nav>
  )
}
