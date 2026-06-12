import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { workouts, workoutSets, exercises } from "@db/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";

export const progressRouter = createRouter({
  // ─── Strength Progress for an Exercise ────────────────────────
  exerciseProgress: publicQuery
    .input(
      z.object({
        userId: z.number(),
        userType: z.enum(["oauth", "local"]).default("oauth"),
        exerciseId: z.number(),
        weeks: z.number().default(24),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - input.weeks * 7);

      const allSets = await db
        .select({
          weight: workoutSets.weight,
          reps: workoutSets.reps,
          date: workouts.date,
          exerciseName: exercises.name,
        })
        .from(workoutSets)
        .innerJoin(workouts, eq(workoutSets.workoutId, workouts.id))
        .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id))
        .where(
          and(
            eq(workouts.userId, input.userId),
            eq(workouts.userType, input.userType),
            eq(workoutSets.exerciseId, input.exerciseId),
            gte(workouts.date, cutoff)
          )
        )
        .orderBy(workouts.date);

      // Best weight per session
      const sessionMap = new Map<
        string,
        { date: string; maxWeight: number; totalReps: number; sets: number }
      >();

      for (const s of allSets) {
        const dateKey = s.date.toISOString().split("T")[0];
        if (!sessionMap.has(dateKey)) {
          sessionMap.set(dateKey, {
            date: dateKey,
            maxWeight: 0,
            totalReps: 0,
            sets: 0,
          });
        }
        const session = sessionMap.get(dateKey)!;
        session.maxWeight = Math.max(session.maxWeight, s.weight);
        session.totalReps += s.reps;
        session.sets++;
      }

      return Array.from(sessionMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    }),

  // ─── Body Part Breakdown ──────────────────────────────────────
  bodyPartBreakdown: publicQuery
    .input(
      z.object({
        userId: z.number(),
        userType: z.enum(["oauth", "local"]).default("oauth"),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      const allSets = await db
        .select({
          category: exercises.category,
          volume: sql<number>`SUM(${workoutSets.reps} * ${workoutSets.weight})`,
          sets: sql<number>`COUNT(*)`,
        })
        .from(workoutSets)
        .innerJoin(workouts, eq(workoutSets.workoutId, workouts.id))
        .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id))
        .where(
          and(
            eq(workouts.userId, input.userId),
            eq(workouts.userType, input.userType)
          )
        )
        .groupBy(exercises.category);

      const totalVolume = allSets.reduce((s, r) => s + Number(r.volume), 0);

      return allSets.map((r) => ({
        category: r.category,
        volume: Number(r.volume),
        sets: Number(r.sets),
        percentage: totalVolume > 0 ? Math.round((Number(r.volume) / totalVolume) * 100) : 0,
      }));
    }),

  // ─── Workout Frequency Heatmap ────────────────────────────────
  workoutFrequency: publicQuery
    .input(
      z.object({
        userId: z.number(),
        userType: z.enum(["oauth", "local"]).default("oauth"),
        weeks: z.number().default(12),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - input.weeks * 7);

      const userWorkouts = await db.query.workouts.findMany({
        where: and(
          eq(workouts.userId, input.userId),
          eq(workouts.userType, input.userType),
          gte(workouts.date, cutoff)
        ),
        orderBy: [desc(workouts.date)],
      });

      const dateMap = new Map<string, { date: string; count: number; duration: number }>();

      for (const w of userWorkouts) {
        const dateKey = w.date.toISOString().split("T")[0];
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { date: dateKey, count: 0, duration: 0 });
        }
        const entry = dateMap.get(dateKey)!;
        entry.count++;
        entry.duration += w.duration || 0;
      }

      return Array.from(dateMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    }),
});
