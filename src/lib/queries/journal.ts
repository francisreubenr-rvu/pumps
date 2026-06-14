"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { queryKeys } from "./keys"

/**
 * A user's journal entries of a given type ("daily" | "weekly"), newest first,
 * capped at 30. Cached per (user, type) so switching tabs is instant.
 */
export function useJournalEntries(userId: string | undefined, type: "daily" | "weekly") {
  return useQuery<any[]>({
    queryKey: userId ? queryKeys.journal.list(userId, type) : ["journal", "anon", type],
    enabled: !!userId,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .eq("user_id", userId!)
        .eq("type", type)
        .order("date", { ascending: false })
        .limit(30)
      if (error) {
        console.error("Journal query failed:", error)
        throw error
      }
      return data ?? []
    },
  })
}
