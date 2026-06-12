import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { workouts, workoutSets, exercises } from "@db/schema";
import { eq, and, desc, gte } from "drizzle-orm";

export const workoutRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          userId: z.number(),
          userType: z.enum(["oauth", "local"]).default("oauth"),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (!input) return [];
      return db.query.workouts.findMany({
        where: and(
          eq(workouts.userId, input.userId),
          eq(workouts.userType, input.userType)
        ),
        orderBy: [desc(workouts.date)],
        limit: input.limit,
        offset: input.offset,
      });
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const workout = await db.query.workouts.findFirst({
        where: eq(workouts.id, input.id),
      });
      if (!workout) return null;
      const sets = await db.query.workoutSets.findMany({
        where: eq(workoutSets.workoutId, input.id),
        with: { exercise: true },
      });
      return { ...workout, sets };
    }),

  create: publicQuery
    .input(
      z.object({
        userId: z.number(),
        userType: z.enum(["oauth", "local"]).default("oauth"),
        title: z.string().min(1),
        notes: z.string().optional(),
        duration: z.number().optional(),
        date: z.string().or(z.date()),
        sets: z
          .array(
            z.object({
              exerciseId: z.number(),
              setNumber: z.number(),
              reps: z.number(),
              weight: z.number(),
              rpe: z.number().min(1).max(10).optional(),
              notes: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { sets, ...workoutData } = input;
      const result = await db.insert(workouts).values({
        ...workoutData,
        date: new Date(workoutData.date),
      });
      const workoutId = Number(result[0].lastInsertRowid);

      if (sets && sets.length > 0) {
        for (const set of sets) {
          await db.insert(workoutSets).values({
            ...set,
            workoutId,
          });
        }
      }

      return { id: workoutId };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        notes: z.string().optional(),
        duration: z.number().optional(),
        date: z.string().or(z.date()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(workouts)
        .set({
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        })
        .where(eq(workouts.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(workoutSets).where(eq(workoutSets.workoutId, input.id));
      await db.delete(workouts).where(eq(workouts.id, input.id));
      return { success: true };
    }),

  // ─── Stats ────────────────────────────────────────────────────
  stats: publicQuery
    .input(
      z.object({
        userId: z.number(),
        userType: z.enum(["oauth", "local"]).default("oauth"),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const userWorkouts = await db.query.workouts.findMany({
        where: and(
          eq(workouts.userId, input.userId),
          eq(workouts.userType, input.userType)
        ),
        orderBy: [desc(workouts.date)],
      });

      if (userWorkouts.length === 0) {
        return {
          totalWorkouts: 0,
          totalVolume: 0,
          avgDuration: 0,
          currentStreak: 0,
          maxStreak: 0,
          thisWeekVolume: 0,
          lastWeekVolume: 0,
          personalRecords: [],
        };
      }

      // Get all sets for this user
      const allSets = await db
        .select({
          workoutId: workoutSets.workoutId,
          exerciseId: workoutSets.exerciseId,
          reps: workoutSets.reps,
          weight: workoutSets.weight,
          exerciseName: exercises.name,
        })
        .from(workoutSets)
        .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id))
        .innerJoin(workouts, eq(workoutSets.workoutId, workouts.id))
        .where(
          and(
            eq(workouts.userId, input.userId),
            eq(workouts.userType, input.userType)
          )
        );

      // Total volume = sum(reps * weight)
      const totalVolume = allSets.reduce(
        (sum, s) => sum + s.reps * s.weight,
        0
      );

      // Avg duration
      const avgDuration =
        userWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) /
        userWorkouts.length;

      // Streak calculation
      const dateSet = new Set(userWorkouts.map((w) => w.date.toISOString().split("T")[0]));
      const sortedDates = Array.from(dateSet).sort().reverse();
      let currentStreak = 0;
      let maxStreak = 0;
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        currentStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prev = new Date(sortedDates[i - 1]);
          const curr = new Date(sortedDates[i]);
          const diff = (prev.getTime() - curr.getTime()) / 86400000;
          if (diff === 1) currentStreak++;
          else break;
        }
      }

      // Calculate max streak
      let tempStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (prev.getTime() - curr.getTime()) / 86400000;
        if (diff === 1) {
          tempStreak++;
          maxStreak = Math.max(maxStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }

      // This week vs last week volume
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const lastWeekStart = new Date(weekStart);
      lastWeekStart.setDate(weekStart.getDate() - 7);

      const thisWeekWorkouts = userWorkouts.filter(
        (w) => w.date >= weekStart
      );
      const lastWeekWorkouts = userWorkouts.filter(
        (w) => w.date >= lastWeekStart && w.date < weekStart
      );

      // PRs - max weight per exercise
      const prMap = new Map<string, { weight: number; reps: number }>();
      for (const s of allSets) {
        const key = s.exerciseName;
        const current = prMap.get(key);
        if (!current || s.weight > current.weight) {
          prMap.set(key, { weight: s.weight, reps: s.reps });
        }
      }
      const personalRecords = Array.from(prMap.entries()).map(
        ([exercise, record]) => ({ exercise, ...record })
      );

      return {
        totalWorkouts: userWorkouts.length,
        totalVolume,
        avgDuration: Math.round(avgDuration),
        currentStreak,
        maxStreak,
        thisWeekVolume: thisWeekWorkouts.length,
        lastWeekVolume: lastWeekWorkouts.length,
        personalRecords: personalRecords.slice(0, 10),
      };
    }),

  // ─── Volume Over Time (for progress charts) ───────────────────
  volumeHistory: publicQuery
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

      const weekMap = new Map<string, { volume: number; workouts: number }>();

      for (const w of userWorkouts) {
        const d = new Date(w.date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];
        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, { volume: 0, workouts: 0 });
        }
        weekMap.get(weekKey)!.workouts++;
      }

      // Get set volumes
      for (const w of userWorkouts) {
        const sets = await db.query.workoutSets.findMany({
          where: eq(workoutSets.workoutId, w.id),
        });
        const vol = sets.reduce((s, set) => s + set.reps * set.weight, 0);
        const d = new Date(w.date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];
        weekMap.get(weekKey)!.volume += vol;
      }

      const sorted = Array.from(weekMap.entries()).sort(([a], [b]) =>
        a.localeCompare(b)
      );
      return sorted.map(([week, data]) => ({
        week,
        volume: Math.round(data.volume),
        workouts: data.workouts,
      }));
    }),
});
