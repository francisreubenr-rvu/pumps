"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { queryKeys } from "./keys"

/**
 * A user's workout list, newest first. Cached and focus-refetched by TanStack
 * Query, so a workout saved elsewhere shows up on return without the old
 * manual `window` focus-listener band-aid.
 */
export function useWorkouts(userId: string | undefined) {
  return useQuery<any[]>({
    queryKey: userId ? queryKeys.workouts.list(userId) : ["workouts", "anon"],
    enabled: !!userId,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userId!)
        .order("started_at", { ascending: false })
      if (error) {
        console.error("Workouts query failed:", error)
        throw error
      }
      return data ?? []
    },
  })
}
