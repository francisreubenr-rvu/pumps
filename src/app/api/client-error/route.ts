import { NextResponse } from "next/server"
import { log } from "@/lib/log"

/**
 * Sink for client-side errors. The browser can't write to the platform logs
 * directly, so `instrumentation-client.ts` POSTs uncaught errors here and we
 * record them server-side (structured, queryable, and through the Sentry seam).
 * Fields are length-capped so a runaway client can't bloat the logs.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body.message !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    const cap = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : undefined)
    log.error("client.error", {
      message: cap(body.message, 500),
      stack: cap(body.stack, 2000),
      source: cap(body.source, 300),
      url: cap(body.url, 300),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
