"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { queryKeys } from "./keys"

/**
 * A user's meal logs for a single day, oldest first. Cached per (user, date),
 * so flipping the date picker between days is instant after first load.
 */
export function useMealLogs(userId: string | undefined, date: string) {
  return useQuery<any[]>({
    queryKey: userId ? queryKeys.nutrition.day(userId, date) : ["nutrition", "anon", date],
    enabled: !!userId,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", userId!)
        .eq("date", date)
        .order("created_at", { ascending: true })
      if (error) {
        console.error("Meal logs query failed:", error)
        throw error
      }
      return data ?? []
    },
  })
}
