"use client"

/**
 * INTERACTIVE primitives — patterns borrowed from Aceternity UI
 * (ui.aceternity.com) but re-expressed in pure CSS + the KINETIC token system.
 * No framer-motion: the app stays animation-light (CSS transitions + a single
 * mousemove handler), and every control follows the --accent / --fg cascade so
 * it themes with the active mode. Styling lives in globals.css (.k-range,
 * .k-segmented*, .k-spotlight*).
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/* ── Slider ── labeled range with a live accent value readout + unit ── */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label?: ReactNode
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0
  return (
    <div>
      {label != null && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span className="label-sm">{label}</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--accent)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
            {value}
            {unit && <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginLeft: 4 }}>{unit}</span>}
          </span>
        </div>
      )}
      <input
        type="range"
        className="k-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--val-pct" as string]: `${pct}%` } as CSSProperties}
        aria-label={typeof label === "string" ? label : undefined}
        aria-valuetext={unit ? `${value} ${unit}` : String(value)}
      />
    </div>
  )
}

/* ── SegmentedTabs ── tab strip with a single accent thumb that slides to the
   active tab (measured from the DOM, so labels can be any width) ── */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { key: T; label: string; icon?: LucideIcon }[]
  value: T
  onChange: (key: T) => void
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ left: 0, width: 0 })

  const measure = useCallback(() => {
    const root = ref.current
    if (!root) return
    const active = root.querySelector<HTMLButtonElement>('[data-active="true"]')
    if (active) setThumb({ left: active.offsetLeft - root.clientLeft, width: active.offsetWidth })
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [measure, value, tabs.length])

  return (
    <div ref={ref} className={cn("k-segmented", className)} role="tablist">
      <span
        className="k-segmented-thumb"
        aria-hidden="true"
        style={{ transform: `translateX(${thumb.left}px)`, width: thumb.width, opacity: thumb.width ? 1 : 0 }}
      />
      {tabs.map((t) => {
        const active = t.key === value
        const Icon = t.icon
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            data-active={active}
            className="k-segmented-tab"
            onClick={() => onChange(t.key)}
          >
            {Icon && <Icon size={14} aria-hidden="true" />}
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── SpotlightCard ── card whose accent glow tracks the cursor on hover.
   Renders its own glow layer so it composes with card-surface / card-elevated
   without clobbering their styles. ── */
export function SpotlightCard({
  children,
  className,
  color,
  style,
  onClick,
}: {
  children: ReactNode
  className?: string
  color?: string
  style?: CSSProperties
  onClick?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMove(e: MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - r.left}px`)
    el.style.setProperty("--my", `${e.clientY - r.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onClick={onClick}
      className={cn("k-spotlight", className)}
      style={{ ...(color ? ({ ["--spot-color" as string]: color } as CSSProperties) : {}), ...style }}
    >
      <span className="k-spotlight-glow" aria-hidden="true" />
      {children}
    </div>
  )
}
