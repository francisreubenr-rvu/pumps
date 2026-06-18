"use client"

import type { CSSProperties, ReactNode } from "react"

/**
 * Hl — highlight a keyword inside a Statement. `serif` swaps to the elegant
 * italic accent face (the Verdant "grows" / Stoicism move); otherwise it just
 * recolors to accent (AgentAI). Inline, so screen readers read the sentence
 * naturally.
 */
export function Hl({ children, serif }: { children: ReactNode; serif?: boolean }) {
  return <span className={serif ? "k-hl-serif" : "k-hl"}>{children}</span>
}

/**
 * Statement — an oversized sentence with accent keywords (AgentAI). Wrap usages
 * in <Reveal> at the call site for entrance motion.
 */
export function Statement({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <p
      className={className}
      style={{
        fontFamily: "var(--font-heading-stack)",
        fontSize: "clamp(26px, 4vw, 50px)",
        fontWeight: 600,
        letterSpacing: "-0.02em",
        lineHeight: 1.18,
        color: "var(--fg)",
        ...style,
      }}
    >
      {children}
    </p>
  )
}
