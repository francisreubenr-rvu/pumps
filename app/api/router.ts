import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { exerciseRouter } from "./exercise-router";
import { workoutRouter } from "./workout-router";
import { competitionRouter } from "./competition-router";
import { leaderboardRouter } from "./leaderboard-router";
import { progressRouter } from "./progress-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  exercise: exerciseRouter,
  workout: workoutRouter,
  competition: competitionRouter,
  leaderboard: leaderboardRouter,
  progress: progressRouter,
});

export type AppRouter = typeof appRouter;
