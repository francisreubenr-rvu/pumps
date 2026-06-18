"use client"

/**
 * KINETIC UI primitives.
 *
 * Small, composable building blocks that encode the design system so pages
 * stop hand-rolling the same inline style objects. Styling lives in the
 * `.k-*` / `.card-*` utility classes in globals.css; these components just
 * compose them. Everything stays mode-themeable through the --accent / --fg
 * CSS-variable cascade.
 */

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react"
import Link from "next/link"
import { ChevronRight, ArrowLeft, AlertTriangle, RotateCw, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { AppNav } from "@/components/layout/nav"

/* ── PageShell ── full-page chrome: background + nav + padded container ── */
export function PageShell({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <div className={className} style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main className={cn("page-container", contentClassName)}>{children}</main>
    </div>
  )
}

/* ── DetailHeader ── focused sub-flow top bar: optional back, logo, crumb,
   trailing slot. Themed (CSS vars) so it follows the active mode, unlike the
   old bespoke per-page headers that hardcoded hex colors. ── */
export function DetailHeader({
  backHref,
  crumb,
  trailing,
}: {
  backHref?: string
  crumb?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <header className="k-topbar">
      <div className="k-topbar-inner">
        {backHref && (
          <Link href={backHref} className="k-icon-link" aria-label="Back">
            <ArrowLeft size={18} aria-hidden="true" />
          </Link>
        )}
        <Link href="/dashboard" className="k-logo">PUMPS</Link>
        {crumb && (
          <>
            <span className="k-crumb-sep" aria-hidden="true">/</span>
            <span className="k-crumb">{crumb}</span>
          </>
        )}
        {trailing && <div style={{ marginLeft: "auto", flexShrink: 0 }}>{trailing}</div>}
      </div>
    </header>
  )
}

/* ── DetailShell ── DetailHeader + a narrower padded main (detail/create pages) ── */
export function DetailShell({
  backHref,
  crumb,
  trailing,
  children,
  maxWidth = 1280,
}: {
  backHref?: string
  crumb?: ReactNode
  trailing?: ReactNode
  children: ReactNode
  maxWidth?: number
}) {
  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <DetailHeader backHref={backHref} crumb={crumb} trailing={trailing} />
      <main className="k-enter" style={{ maxWidth, margin: "0 auto", padding: "clamp(24px, 5vw, 40px) clamp(16px, 4vw, 24px)" }}>
        {children}
      </main>
    </div>
  )
}

/* ── Fill ── full-viewport centered message (loading / not-found) ── */
export function Fill({ children }: { children: ReactNode }) {
  return <div className="k-fill">{children}</div>
}

/* ── PageTitle ── big sentence-case heading + accent eyebrow (list pages).
   Saira, not Teko-uppercase — "premium, not shouty" per the rebuild spec.
   The eyebrow stays uppercase: it's a micro-label. ── */
export function PageTitle({ title, eyebrow }: { title: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="k-section">
      {eyebrow && (
        <p
          style={{
            fontFamily: "var(--font-heading-stack)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 10,
          }}
        >
          {eyebrow}
        </p>
      )}
      <h1
        style={{
          fontFamily: "var(--font-heading-stack)",
          fontSize: "clamp(32px, 4.6vw, 48px)",
          fontWeight: 600,
          letterSpacing: "-0.035em",
          color: "var(--fg)",
          lineHeight: 1.04,
        }}
      >
        {title}
      </h1>
    </div>
  )
}

/* ── PageHero ── name/title + tagline banner with optional faint bg image ── */
export function PageHero({
  title,
  tagline,
  bgImage,
}: {
  title: ReactNode
  tagline?: ReactNode
  bgImage?: string
}) {
  return (
    <div
      className="k-section"
      style={{
        position: "relative",
        padding: "clamp(28px, 5vw, 40px) clamp(20px, 4vw, 32px)",
        overflow: "hidden",
        borderRadius: "var(--r-xl)",
        border: "1px solid var(--border)",
        background:
          "radial-gradient(120% 140% at 88% -20%, color-mix(in oklch, var(--accent) 12%, transparent), transparent 55%), linear-gradient(180deg, var(--surface-elevated), transparent)",
      }}
    >
      {bgImage && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            opacity: 0.08,
          }}
        />
      )}
      <div style={{ position: "relative" }}>
        {tagline && (
          <p
            style={{
              fontFamily: "var(--font-heading-stack)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 10,
            }}
          >
            {tagline}
          </p>
        )}
        <h1
          style={{
            fontFamily: "var(--font-heading-stack)",
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 600,
            letterSpacing: "-0.035em",
            color: "var(--fg)",
            lineHeight: 1.04,
          }}
        >
          {title}
        </h1>
      </div>
    </div>
  )
}

/* ── Eyebrow ── small uppercase label ── */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("k-eyebrow", className)}>{children}</span>
}

/* ── SectionHeader ── title + optional trailing action (or a view-all href) ── */
export function SectionHeader({
  title,
  action,
  viewAllHref,
  viewAllLabel = "View all",
}: {
  title: ReactNode
  action?: ReactNode
  viewAllHref?: string
  viewAllLabel?: string
}) {
  return (
    <div className="k-section-head">
      <h3 className="k-title">{title}</h3>
      {action ?? (viewAllHref && <ViewAllLink href={viewAllHref} label={viewAllLabel} />)}
    </div>
  )
}

export function ViewAllLink({ href, label = "View all" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="k-link">
      {label} <ChevronRight size={12} aria-hidden="true" />
    </Link>
  )
}

/* ── Card ── glass surface with system padding; becomes a Link when href set ── */
export function Card({
  children,
  href,
  interactive,
  elevated,
  padded = true,
  className,
  style,
}: {
  children: ReactNode
  href?: string
  interactive?: boolean
  elevated?: boolean
  padded?: boolean
  className?: string
  style?: CSSProperties
}) {
  const isLink = Boolean(href)
  const classes = cn(
    elevated ? "card-elevated" : "card-surface",
    padded && "card-pad",
    (interactive || isLink) && "card-interactive",
    className,
  )
  if (isLink) {
    return (
      <Link href={href!} className={classes} style={style}>
        {children}
      </Link>
    )
  }
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  )
}

/* ── StatCard ── icon + label + value (+ unit), with optional count-up ── */
export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  animate = false,
  delay = 0,
}: {
  icon: LucideIcon
  label: string
  value: number | string
  unit?: string
  animate?: boolean
  delay?: number
}) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon size={14} style={{ color: "var(--accent)" }} aria-hidden="true" />
        <span className="k-eyebrow">{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        {animate && typeof value === "number" ? (
          <AnimatedNumber value={value} delay={delay} className="k-stat" />
        ) : (
          <span className="k-stat">{value}</span>
        )}
        {unit && <span className="k-stat-unit">{unit}</span>}
      </div>
    </Card>
  )
}

/* ── AnimatedNumber ── count-up on scroll-into-view; respects reduced motion ── */
export function AnimatedNumber({
  value,
  delay = 0,
  className,
}: {
  value: number
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState("0")
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.3 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !mounted) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(String(value))
      return
    }
    const timer = setTimeout(() => {
      const steps = 20
      let step = 0
      const t = setInterval(() => {
        step++
        setDisplay(String(Math.floor((value * step) / steps)))
        if (step >= steps) { setDisplay(String(value)); clearInterval(t) }
      }, 30)
    }, delay)
    return () => clearTimeout(timer)
  }, [visible, value, delay, mounted])

  return (
    <span ref={ref} aria-live="polite" className={className}>
      {display}
    </span>
  )
}

/* ── Badge ── status pill ── */
type BadgeVariant = "solid" | "muted" | "live"
export function Badge({
  children,
  variant = "solid",
}: {
  children: ReactNode
  variant?: BadgeVariant
}) {
  const style: CSSProperties =
    variant === "muted"
      ? { background: "var(--surface-elevated)", color: "var(--text-secondary)" }
      : { background: "var(--accent)", color: "var(--bg)" }
  return (
    <span
      className="badge"
      style={{ ...style, display: "inline-flex", alignItems: "center", gap: 4 }}
    >
      {variant === "live" && <span className="status-dot active" aria-hidden="true" />}
      {children}
    </span>
  )
}

/* ── ListRow ── title + subtitle on the left, trailing node on the right ── */
export function ListRow({
  href,
  title,
  subtitle,
  trailing,
}: {
  href?: string
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
}) {
  const inner = (
    <>
      <div style={{ minWidth: 0 }}>
        <p className="k-row-title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title}
        </p>
        {subtitle && <p className="k-row-sub" style={{ marginTop: 2 }}>{subtitle}</p>}
      </div>
      {trailing}
    </>
  )
  if (href) {
    return (
      <Link href={href} className="k-list-row">
        {inner}
      </Link>
    )
  }
  return <div className="k-list-row">{inner}</div>
}

/* ── EmptyState ── centered "nothing here yet" with optional icon + action ── */
export function EmptyState({
  message,
  actionHref,
  actionLabel,
  icon: Icon,
}: {
  message: string
  actionHref?: string
  actionLabel?: string
  icon?: LucideIcon
}) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {Icon && (
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: "var(--r-pill)",
            background: "var(--surface-elevated)",
            color: "var(--text-secondary)",
          }}
        >
          <Icon size={20} />
        </span>
      )}
      <p className="k-row-sub" style={{ maxWidth: 280 }}>{message}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="k-link">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

/* ── ErrorState ── failure message + retry, themed (replaces ad-hoc red text) ── */
export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          borderRadius: "var(--r-pill)",
          background: "color-mix(in oklch, var(--accent-red) 14%, transparent)",
          color: "var(--accent-red)",
        }}
      >
        <AlertTriangle size={20} />
      </span>
      <p className="k-row-sub" style={{ maxWidth: 300, color: "var(--text-secondary)" }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline" style={{ fontSize: 11, padding: "8px 16px" }}>
          <RotateCw size={12} aria-hidden="true" /> Retry
        </button>
      )}
    </div>
  )
}

/* ── Skeleton ── shimmering placeholder block; compose for any loading shape ── */
export function Skeleton({
  width,
  height = 14,
  radius,
  className,
  style,
}: {
  width?: number | string
  height?: number | string
  radius?: number | string
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("k-skeleton", className)}
      style={{ display: "block", width: width ?? "100%", height, borderRadius: radius, ...style }}
    />
  )
}

/* ── SkeletonRows ── N stacked text-line skeletons (lists, tables) ── */
export function SkeletonRows({ rows = 5, gap = 12 }: { rows?: number; gap?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={16} width={`${88 - (i % 4) * 12}%`} />
      ))}
    </div>
  )
}
