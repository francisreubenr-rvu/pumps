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
    /** Full competitions list (all statuses), newest first. */
    list: () => ["competitions", "list"] as const,
  },
  squads: {
    /** A user's squads + public discovery list. */
    all: (userId: string) => ["squads", userId] as const,
  },
  leaderboard: {
    /** All-time max-weight + total-volume rankings. */
    allTime: () => ["leaderboard", "all-time"] as const,
    /** Weekly snapshot rankings for a given week-start (YYYY-MM-DD). */
    weekly: (weekStart: string) => ["leaderboard", "weekly", weekStart] as const,
  },
  nutrition: {
    /** A user's meal logs for a single day. */
    day: (userId: string, date: string) => ["nutrition", userId, date] as const,
  },
  journal: {
    /** A user's journal entries of a given type (daily/weekly). */
    list: (userId: string, type: string) => ["journal", userId, type] as const,
  },
  photos: {
    /** A user's progress photos. */
    list: (userId: string) => ["photos", userId] as const,
  },
} as const
