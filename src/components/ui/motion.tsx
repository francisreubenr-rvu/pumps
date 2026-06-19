"use client"

/**
 * MOTION primitives — the app-wide scroll-animation toolkit.
 *
 * `Reveal` animates an element into view the first time it enters the viewport
 * (or on mount, if it's already on-screen). `Stagger` sequences a set of
 * children. Both are pure CSS transitions on the --ease-expo curve — no
 * framer-motion — and both fall back to fully-visible under reduced motion.
 *
 * Variants give pages "various" entrances without bespoke code: up / down /
 * left / right / fade / scale / blur.
 */

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react"

export type RevealVariant = "up" | "down" | "left" | "right" | "fade" | "scale" | "blur"

const OFFSET: Record<RevealVariant, string> = {
  up: "translateY(28px)",
  down: "translateY(-28px)",
  left: "translateX(28px)",
  right: "translateX(-28px)",
  fade: "none",
  scale: "scale(0.94)",
  blur: "translateY(16px)",
}

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  duration = 700,
  once = true,
  className,
  style,
}: {
  children: ReactNode
  variant?: RevealVariant
  delay?: number
  duration?: number
  once?: boolean
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          if (once) obs.disconnect()
        } else if (!once) {
          setShown(false)
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : OFFSET[variant],
        filter: variant === "blur" && !shown ? "blur(10px)" : undefined,
        transition: `opacity ${duration}ms var(--ease-expo) ${delay}ms, transform ${duration}ms var(--ease-expo) ${delay}ms, filter ${duration}ms var(--ease-expo) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ── Stagger ── wraps each child in a Reveal with an incrementing delay.
   Pass grid/flex layout via `className` — Stagger IS the layout container, and
   each child becomes an animated item. Children that are already <Reveal> just
   get their delay shifted. ── */
export function Stagger({
  children,
  step = 90,
  start = 0,
  variant = "up",
  className,
  style,
}: {
  children: ReactNode
  step?: number
  start?: number
  variant?: RevealVariant
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={className} style={style}>
      {Children.map(children, (child, idx) => {
        if (!isValidElement(child)) return child
        if (child.type === Reveal) {
          const el = child as ReactElement<{ delay?: number }>
          return cloneElement(el, { delay: (el.props.delay ?? 0) + start + idx * step })
        }
        return (
          <Reveal variant={variant} delay={start + idx * step} style={{ height: "100%" }}>
            {child}
          </Reveal>
        )
      })}
    </div>
  )
}
