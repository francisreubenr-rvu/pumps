import type { Instrumentation } from "next"
import { log } from "@/lib/log"

/**
 * Server-side error capture. Next calls this whenever the server captures an
 * error (route handlers, Server Components, etc.). We route it through the
 * structured logger so it's queryable in the platform logs — and through the
 * same `captureError` seam, so wiring Sentry later instruments server errors
 * with no change here.
 */
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  log.exception("server.request_error", err, {
    path: request.path,
    method: request.method,
    routeType: context.routeType,
  })
}
