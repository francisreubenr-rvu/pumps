"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

/**
 * App-wide TanStack Query provider. This is the single data-fetching layer for
 * the client — every Supabase read should flow through a query hook so reads are
 * cached, deduped, and invalidated on mutation. It replaces the old per-page
 * `useState`/`useEffect`/`createClient()` pattern (and the `window` focus-refetch
 * band-aids) that caused stale dashboards until a re-render was forced.
 *
 * The QueryClient is created lazily in state so it is stable across re-renders
 * but never shared between requests/users on the server.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30s — avoids refetch storms while
            // navigating, but a freshly-saved workout shows up on the next focus.
            staleTime: 30_000,
            // Workout/nutrition data rarely changes server-side without the user
            // acting, so one retry is plenty; fail fast and surface errors.
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      })
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
