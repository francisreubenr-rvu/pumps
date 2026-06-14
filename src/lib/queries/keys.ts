/**
 * Central query-key registry. Keys are structured hierarchically so a mutation
 * can invalidate a whole subtree (e.g. everything under a user's workouts) with
 * one call. Always reference keys through this factory — never hand-write key
 * arrays at the call site, or invalidation will silently miss caches.
 */
export const queryKeys = {
  auth: {
    user: () => ["auth", "user"] as const,
  },
  dashboard: {
    /** All dashboard data for a user. Invalidate on any workout/comp mutation. */
    all: (userId: string) => ["dashboard", userId] as const,
    workoutCount: (userId: string) => ["dashboard", userId, "workout-count"] as const,
    volume: (userId: string) => ["dashboard", userId, "volume"] as const,
    recentWorkouts: (userId: string) => ["dashboard", userId, "recent-workouts"] as const,
    volumeHistory: (userId: string) => ["dashboard", userId, "volume-history"] as const,
  },
  workouts: {
    /** A user's full workout list. */
    list: (userId: string) => ["workouts", userId, "list"] as const,
  },
  progress: {
    /** A user's progress analytics (per-exercise max weight + weekly volume). */
    all: (userId: string) => ["progress", userId] as const,
  },
  competitions: {
    active: () => ["competitions", "active"] as const,
  },
} as const
