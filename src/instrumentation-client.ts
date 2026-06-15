/**
 * Client-side observability. Captures uncaught errors + unhandled promise
 * rejections and forwards them to /api/client-error (recorded server-side, so
 * they reach the platform logs the browser can't write to). This is also the
 * place to init a browser error-tracking SDK (e.g. Sentry, gated on a DSN env).
 *
 * Guarded: deduped by message and capped per session so a hot error loop can't
 * flood the endpoint.
 */
let reported = 0
const MAX_REPORTS = 10
const seen = new Set<string>()

function report(payload: { message: string; stack?: string; source?: string }) {
  if (reported >= MAX_REPORTS) return
  const key = payload.message + (payload.source ?? "")
  if (seen.has(key)) return
  seen.add(key)
  reported += 1
  try {
    const body = JSON.stringify({ ...payload, url: location.href })
    // keepalive so the report still sends if the page is unloading.
    fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* never let error reporting throw */
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    report({ message: e.message || "Uncaught error", stack: e.error?.stack, source: e.filename })
  })
  window.addEventListener("unhandledrejection", (e) => {
    const r = e.reason
    report({ message: r?.message || String(r) || "Unhandled rejection", stack: r?.stack })
  })
}
