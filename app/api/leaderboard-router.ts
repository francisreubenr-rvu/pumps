import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  workouts,
  workoutSets,
  exercises,
  competitionEntries,
} from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const leaderboardRouter = createRouter({
  // ─── Global Leaderboard (by total volume) ─────────────────────
  byVolume: publicQuery
    .input(
      z
        .object({
          limit: z.number().default(20),
          timeRange: z.enum(["week", "month", "all"]).default("all"),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit || 20;

      // Aggregate total volume per user from all workout sets
      const allWorkouts = await db.query.workouts.findMany({
        orderBy: [desc(workouts.date)],
      });

      const userVolumes = new Map<
        string,
        { userId: number; userType: string; totalVolume: number; workouts: number; name: string }
      >();

      for (const w of allWorkouts) {
        const sets = await db.query.workoutSets.findMany({
          where: eq(workoutSets.workoutId, w.id),
        });
        const vol = sets.reduce((s, set) => s + set.reps * set.weight, 0);
        const key = `${w.userType}:${w.userId}`;
        if (!userVolumes.has(key)) {
          userVolumes.set(key, {
            userId: w.userId,
            userType: w.userType,
            totalVolume: 0,
            workouts: 0,
            name: w.userType === "oauth" ? `User ${w.userId}` : `Athlete ${w.userId}`,
          });
        }
        const entry = userVolumes.get(key)!;
        entry.totalVolume += vol;
        entry.workouts++;
      }

      return Array.from(userVolumes.values())
        .sort((a, b) => b.totalVolume - a.totalVolume)
        .slice(0, limit)
        .map((u, i) => ({ ...u, rank: i + 1 }));
    }),

  // ─── Competition Leaderboard ──────────────────────────────────
  forCompetition: publicQuery
    .input(
      z.object({
        competitionId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const entries = await db.query.competitionEntries.findMany({
        where: eq(competitionEntries.competitionId, input.competitionId),
        orderBy: [desc(competitionEntries.score)],
      });

      // Get unique best score per user
      const bestByUser = new Map<
        string,
        { userId: number; userType: string; score: number; submittedAt: Date }
      >();

      for (const e of entries) {
        const key = `${e.userType}:${e.userId}`;
        const existing = bestByUser.get(key);
        if (!existing || e.score > existing.score) {
          bestByUser.set(key, {
            userId: e.userId,
            userType: e.userType,
            score: e.score,
            submittedAt: e.submittedAt,
          });
        }
      }

      return Array.from(bestByUser.values())
        .sort((a, b) => b.score - a.score)
        .map((e, i) => ({ ...e, rank: i + 1 }));
    }),

  // ─── Personal Records Leaderboard ─────────────────────────────
  personalRecords: publicQuery
    .input(
      z.object({
        exerciseId: z.number(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const allSets = await db
        .select({
          userId: workouts.userId,
          userType: workouts.userType,
          weight: workoutSets.weight,
          reps: workoutSets.reps,
          exerciseName: exercises.name,
        })
        .from(workoutSets)
        .innerJoin(workouts, eq(workoutSets.workoutId, workouts.id))
        .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id))
        .where(eq(workoutSets.exerciseId, input.exerciseId));

      const bestByUser = new Map<
        string,
        { userId: number; userType: string; weight: number; reps: number }
      >();

      for (const s of allSets) {
        const key = `${s.userType}:${s.userId}`;
        const existing = bestByUser.get(key);
        if (!existing || s.weight > existing.weight) {
          bestByUser.set(key, {
            userId: s.userId,
            userType: s.userType,
            weight: s.weight,
            reps: s.reps,
          });
        }
      }

      return Array.from(bestByUser.values())
        .sort((a, b) => b.weight - a.weight)
        .slice(0, input.limit)
        .map((e, i) => ({ ...e, rank: i + 1 }));
    }),
});
