/**
 * FEATURE VISUALS — small inner art for the landing feature cards (C4).
 *
 * Three pure-SVG/CSS visuals modeled on the Verdant card internals, each
 * themed entirely through the --accent / --border cascade (no hardcoded hex).
 * Every root sets `color: var(--accent)` so SVG `currentColor` and the local
 * keyframes inherit the active mode's accent. All three are decorative, so the
 * roots are aria-hidden.
 *
 * Motion: subtle stroke draw-in + a gentle accent pulse. Both are paused under
 * `prefers-reduced-motion` (locally guarded *and* covered by the global
 * reduced-motion reset in globals.css — keyframes resolve to their resting
 * 100% state so the snap looks correct).
 *
 * No "use client" — these are static, stateless SVGs with no hooks/handlers.
 */

import type { CSSProperties } from "react"
import { Shield } from "lucide-react"

type VisualProps = {
  className?: string
  style?: CSSProperties
}

/* Shared root styling: fixed-ish height band, full width, accent-themed.
   `color` drives every `currentColor` stroke/fill and the local keyframes. */
const ROOT_STYLE: CSSProperties = {
  width: "100%",
  height: "clamp(100px, 26vw, 130px)",
  color: "var(--accent)",
  display: "block",
  overflow: "visible",
}

/* One scoped <style> block, shared by all three exports. Class/keyframe names
   are `fv-`-prefixed to guarantee no collision with globals.css. */
function VisualStyles() {
  return (
    <style>{`
      @keyframes fvDraw { to { stroke-dashoffset: 0; } }
      @keyframes fvPulse {
        0%, 100% { opacity: 0.55; transform: scale(1); }
        50%      { opacity: 1;    transform: scale(1.06); }
      }
      @keyframes fvFade { from { opacity: 0; } to { opacity: 1; } }

      .fv-line {
        stroke-dasharray: var(--fv-len, 120);
        stroke-dashoffset: var(--fv-len, 120);
        animation: fvDraw 1.1s var(--ease-expo, ease) forwards;
        animation-delay: var(--fv-delay, 0ms);
      }
      .fv-pulse {
        transform-box: fill-box;
        transform-origin: center;
        animation: fvPulse 3.4s var(--ease-apple, ease-in-out) infinite;
      }
      .fv-fade {
        opacity: 0;
        animation: fvFade 0.8s var(--ease-expo, ease) forwards;
        animation-delay: var(--fv-delay, 0ms);
      }

      @media (prefers-reduced-motion: reduce) {
        .fv-line { stroke-dashoffset: 0; animation: none; }
        .fv-pulse { animation: none; opacity: 1; }
        .fv-fade { opacity: 1; animation: none; }
      }
    `}</style>
  )
}

/* ── NodeDiagram ── source nodes (left) → curved dotted lines converge into
   one glowing accent hub node (right). "Unify your data." ── */
export function NodeDiagram({ className, style }: VisualProps) {
  // Left-column source nodes, evenly distributed in the vertical band.
  const sources = [
    { x: 22, y: 26 },
    { x: 22, y: 62 },
    { x: 22, y: 98 },
  ]
  const hub = { x: 210, y: 62 }

  return (
    <svg
      className={className}
      style={{ ...ROOT_STYLE, ...style }}
      viewBox="0 0 240 124"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <VisualStyles />
      <defs>
        <radialGradient id="fv-nd-hub" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* converging connectors: dotted curves from each source into the hub */}
      <g fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="2 4" strokeLinecap="round">
        {sources.map((s, i) => (
          <path
            key={i}
            className="fv-line"
            style={{ ["--fv-len" as string]: 220, ["--fv-delay" as string]: `${i * 140}ms` } as CSSProperties}
            d={`M ${s.x} ${s.y} C ${(s.x + hub.x) / 2} ${s.y}, ${(s.x + hub.x) / 2} ${hub.y}, ${hub.x} ${hub.y}`}
          />
        ))}
      </g>

      {/* source nodes */}
      {sources.map((s, i) => (
        <g
          key={i}
          className="fv-fade"
          style={{ ["--fv-delay" as string]: `${i * 120}ms` } as CSSProperties}
        >
          <circle cx={s.x} cy={s.y} r="7" fill="var(--surface-elevated)" stroke="var(--border)" strokeWidth="1" />
          <circle cx={s.x} cy={s.y} r="2.5" fill="currentColor" opacity="0.7" />
        </g>
      ))}

      {/* glowing hub node */}
      <g>
        {/* soft glow halo */}
        <circle className="fv-pulse" cx={hub.x} cy={hub.y} r="26" fill="url(#fv-nd-hub)" opacity="0.5" />
        <circle
          cx={hub.x}
          cy={hub.y}
          r="13"
          fill="currentColor"
          style={{ filter: "var(--ring-glow)" }}
        />
        <circle cx={hub.x} cy={hub.y} r="13" fill="none" stroke="var(--bg)" strokeWidth="2" opacity="0.35" />
      </g>
    </svg>
  )
}

/* ── GlowChart ── rising glowing area + line with a soft gradient fill fading
   to transparent, plus an accent delta pill near the peak. ── */
export function GlowChart({ className, style, delta = "+32%" }: VisualProps & { delta?: string }) {
  // Line path (rising, with a little life) and a matching filled area.
  const line = "M 6 96 L 44 84 L 84 90 L 124 60 L 164 50 L 204 22 L 234 14"
  const area = `${line} L 234 118 L 6 118 Z`

  return (
    <svg
      className={className}
      style={{ ...ROOT_STYLE, ...style }}
      viewBox="0 0 240 124"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <VisualStyles />
      <defs>
        <linearGradient id="fv-gc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.32" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.06" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* faint baseline grid */}
      <g stroke="var(--border)" strokeWidth="1" opacity="0.7">
        <line x1="6" y1="40" x2="234" y2="40" />
        <line x1="6" y1="78" x2="234" y2="78" />
      </g>

      {/* gradient area fill */}
      <path className="fv-fade" style={{ ["--fv-delay" as string]: "260ms" } as CSSProperties} d={area} fill="url(#fv-gc-fill)" />

      {/* the glowing line */}
      <path
        className="fv-line"
        style={{ ["--fv-len" as string]: 300, filter: "var(--ring-glow)" } as CSSProperties}
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* peak marker */}
      <circle
        className="fv-fade"
        style={{ ["--fv-delay" as string]: "900ms" } as CSSProperties}
        cx="204"
        cy="22"
        r="4"
        fill="currentColor"
      />

      {/* delta pill near the peak */}
      <g className="fv-fade" style={{ ["--fv-delay" as string]: "1000ms" } as CSSProperties}>
        <rect
          x="150"
          y="2"
          width="48"
          height="20"
          rx="10"
          fill="currentColor"
          vectorEffect="non-scaling-stroke"
        />
        <text
          x="174"
          y="16"
          textAnchor="middle"
          fill="var(--bg)"
          style={{
            fontFamily: "var(--font-heading-stack)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          {delta}
        </text>
      </g>
    </svg>
  )
}

/* ── Radar ── 3 concentric accent rings, a glowing center shield, and a few
   pinging dots on the rings. "Act with confidence." ── */
export function Radar({ className, style }: VisualProps) {
  const cx = 120
  const cy = 62
  const rings = [18, 34, 50]
  // dots sit on a ring at a given angle (degrees, 0 = +x axis, clockwise-ish)
  const dots = [
    { r: 34, deg: -42, delay: 0 },
    { r: 50, deg: 28, delay: 600 },
    { r: 50, deg: 158, delay: 1200 },
  ]
  const polar = (radius: number, deg: number) => {
    const rad = (deg * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  return (
    <svg
      className={className}
      style={{ ...ROOT_STYLE, ...style }}
      viewBox="0 0 240 124"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <VisualStyles />
      <defs>
        <radialGradient id="fv-rd-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* concentric rings — outer faint, inner brighter */}
      {rings.map((r, i) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          opacity={0.18 + i * 0.14}
          className="fv-fade"
          style={{ ["--fv-delay" as string]: `${(rings.length - 1 - i) * 120}ms` } as CSSProperties}
        />
      ))}

      {/* crosshair ticks */}
      <g stroke="var(--border)" strokeWidth="1" opacity="0.6">
        <line x1={cx - 56} y1={cy} x2={cx + 56} y2={cy} />
        <line x1={cx} y1={cy - 56} x2={cx} y2={cy + 56} />
      </g>

      {/* dots on the rings */}
      {dots.map((d, i) => {
        const p = polar(d.r, d.deg)
        return (
          <g key={i}>
            <circle
              className="fv-pulse"
              style={{ animationDelay: `${d.delay}ms` }}
              cx={p.x}
              cy={p.y}
              r="6"
              fill="currentColor"
              opacity="0.28"
            />
            <circle cx={p.x} cy={p.y} r="2.5" fill="currentColor" />
          </g>
        )
      })}

      {/* glowing core + shield */}
      <circle className="fv-pulse" cx={cx} cy={cy} r="22" fill="url(#fv-rd-core)" opacity="0.55" />
      <circle cx={cx} cy={cy} r="13" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
      <Shield
        x={cx - 8}
        y={cy - 8}
        width={16}
        height={16}
        stroke="currentColor"
        fill="currentColor"
        fillOpacity={0.18}
        strokeWidth={1.75}
        style={{ filter: "var(--ring-glow)" }}
      />
    </svg>
  )
}
