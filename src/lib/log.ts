/**
 * Structured logging — one consistent, queryable shape for every server log.
 *
 * Emits a single-line JSON object per event (level, event, time, …context).
 * On Vercel these become filterable structured logs out of the box (filter by
 * `event` or any context key), replacing scattered free-text `console.error`
 * strings that can't be queried.
 *
 * Error-tracking seam: `log.error` funnels through `captureError`, the single
 * place to forward exceptions to Sentry/etc. once a DSN is configured — wiring
 * an SDK there instruments every error path at once, no call-site changes.
 */

type LogContext = Record<string, unknown>

function emit(level: "info" | "warn" | "error", event: string, context?: LogContext): void {
  const entry = { level, event, time: new Date().toISOString(), ...context }
  // Stringify defensively — a circular ref in context must never throw in a logger.
  let line: string
  try {
    line = JSON.stringify(entry)
  } catch {
    line = JSON.stringify({ level, event, time: entry.time, note: "context not serializable" })
  }
  if (level === "error") console.error(line)
  else if (level === "warn") console.warn(line)
  else console.log(line)
}

/** Normalize an unknown thrown value into loggable context. */
function errorContext(err: unknown): LogContext {
  if (err instanceof Error) return { error: err.message, errorName: err.name }
  return { error: String(err) }
}

/**
 * Forward an error to the error-tracking backend. No-op until a provider is
 * wired here (e.g. `Sentry.captureException`). Kept separate so the decision to
 * add a vendor is one edit, not a codebase-wide change.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- seam signature kept for when a provider is wired
function captureError(event: string, context?: LogContext): void {
  // Intentionally empty — structured logging above already records the error.
  // Plug Sentry (or another sink) in here when a DSN is available, e.g.:
  //   Sentry.captureException(new Error(event), { extra: context })
}

export const log = {
  info: (event: string, context?: LogContext) => emit("info", event, context),
  warn: (event: string, context?: LogContext) => emit("warn", event, context),
  error: (event: string, context?: LogContext) => {
    emit("error", event, context)
    captureError(event, context)
  },
  /** Convenience: log an exception with normalized error fields. */
  exception: (event: string, err: unknown, context?: LogContext) => {
    const merged = { ...context, ...errorContext(err) }
    emit("error", event, merged)
    captureError(event, merged)
  },
}
