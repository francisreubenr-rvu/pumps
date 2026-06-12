"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface Workout {
  id: string
  name: string
  started_at: string
  completed_at: string | null
  user_id: string
}

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })

    setWorkouts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  return { workouts, loading, refetch: fetchWorkouts }
}
