"use client"

import { useQuery } from "@tanstack/react-query"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { queryKeys } from "./keys"

/**
 * The authenticated user, cached app-wide. Returns `null` when signed out.
 * Pages gate their data queries on `data?.id` and redirect when `null` once
 * `isLoading` is false. Replaces the repeated `supabase.auth.getUser()` +
 * `useState` dance and the unstable "Frank → Athlete → Frank" greeting flicker.
 */
export function useUser() {
  return useQuery<User | null>({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error) return null
      return data.user ?? null
    },
    // The session rarely changes within a tab; keep it warm to stop the flicker.
    staleTime: 5 * 60_000,
  })
}
