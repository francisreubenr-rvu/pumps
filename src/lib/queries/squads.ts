"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { queryKeys } from "./keys"

export type SquadsData = {
  mySquads: any[]
  publicSquads: any[]
}

/**
 * A user's squads plus the public-discovery list, in one cached query. The
 * page surfaces load errors via the query's `error`/`isError` and offers a
 * `refetch()` retry — no more manual loading/error state.
 */
export function useSquads(userId: string | undefined) {
  return useQuery<SquadsData>({
    queryKey: userId ? queryKeys.squads.all(userId) : ["squads", "anon"],
    enabled: !!userId,
    queryFn: async () => {
      const supabase = createClient()
      const [mine, pub] = await Promise.all([
        supabase.from("squad_members").select("squads(*)").eq("user_id", userId!),
        supabase.from("squads").select("*, squad_members(count)").eq("is_public", true).limit(12),
      ])
      // The user's own squads are the critical data — fail the query if they
      // error so the page can show a retry. Public discovery is best-effort.
      if (mine.error) {
        console.error("My squads query failed:", mine.error)
        throw mine.error
      }
      return {
        mySquads: (mine.data ?? []).map((r: any) => r.squads).filter(Boolean),
        publicSquads: pub.error ? [] : (pub.data ?? []),
      }
    },
  })
}
