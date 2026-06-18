/**
 * Testimonial (C8) — landing social-proof card.
 *
 * Ref: AgentAI testimonial card. A glass shell with a big decorative serif
 * quote glyph in low-opacity accent (top-left), the quote in larger Saira, and
 * an author row: an initials avatar circle + name + role. Pure token-driven
 * styling so it follows the active --accent / --fg mode cascade. No hooks, no
 * required motion — reveal is the caller's job (wrap in <Reveal>), so this stays
 * a server component and is reduced-motion safe by construction.
 */

import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

/* Derive up-to-two uppercase initials from the author's name. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export function Testimonial({
  quote,
  author,
  role,
  className,
  style,
}: {
  quote: string
  author: string
  role: string
  className?: string
  style?: CSSProperties
}) {
  const initials = initialsOf(author)

  return (
    <figure
      className={cn("card-elevated", "card-pad", className)}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
        margin: 0,
        ...style,
      }}
    >
      {/* Decorative oversized quote glyph — serif accent, low-opacity accent color. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "calc(-1 * var(--space-4))",
          left: "var(--space-3)",
          fontFamily: "var(--font-accent)",
          fontStyle: "italic",
          fontSize: "clamp(96px, 16vw, 160px)",
          lineHeight: 1,
          fontWeight: 600,
          color: "var(--accent)",
          opacity: 0.1,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        &ldquo;
      </span>

      <blockquote
        style={{
          position: "relative",
          margin: 0,
          fontFamily: "var(--font-body)",
          fontSize: "clamp(16px, 2vw, 22px)",
          lineHeight: 1.5,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: "var(--fg)",
        }}
      >
        {quote}
      </blockquote>

      <figcaption
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          marginTop: "auto",
        }}
      >
        {/* Initials avatar — elevated surface circle with a hairline border. */}
        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: "var(--r-pill)",
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-heading-stack)",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "var(--accent)",
          }}
        >
          {initials}
        </span>
        <span style={{ minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-heading-stack)",
              fontSize: "0.9375rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "var(--fg)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {author}
          </span>
          <span className="k-row-sub" style={{ display: "block", marginTop: 2 }}>
            {role}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}
