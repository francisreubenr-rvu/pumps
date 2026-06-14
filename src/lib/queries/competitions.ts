"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { queryKeys } from "./keys"

/**
 * All competitions (every status), newest first, with exercise name and
 * participant count. Global list — not user-scoped — so it is cached once.
 */
export function useCompetitions() {
  return useQuery<any[]>({
    queryKey: queryKeys.competitions.list(),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("competitions")
        .select("*, exercises(name), competition_participants(count)")
        .order("created_at", { ascending: false })
      if (error) {
        console.error("Competitions query failed:", error)
        throw error
      }
      return data ?? []
    },
  })
}
