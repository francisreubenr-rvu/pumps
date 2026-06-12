import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  competitions,
  competitionParticipants,
  competitionEntries,
} from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const competitionRouter = createRouter({
  // ─── List Competitions ────────────────────────────────────────
  list: publicQuery
    .input(
      z
        .object({
          status: z.enum(["upcoming", "active", "completed"]).optional(),
          type: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(competitions.status, input.status));
      }
      if (conditions.length > 0) {
        return db.query.competitions.findMany({
          where: conditions[0],
          orderBy: [desc(competitions.startDate)],
        });
      }
      return db.query.competitions.findMany({
        orderBy: [desc(competitions.startDate)],
      });
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const competition = await db.query.competitions.findFirst({
        where: eq(competitions.id, input.id),
        with: { exercise: true },
      });
      if (!competition) return null;
      const participants = await db.query.competitionParticipants.findMany({
        where: eq(competitionParticipants.competitionId, input.id),
      });
      const entries = await db.query.competitionEntries.findMany({
        where: eq(competitionEntries.competitionId, input.id),
        orderBy: [desc(competitionEntries.score)],
      });
      return { ...competition, participantCount: participants.length, entries };
    }),

  // ─── Create Competition ───────────────────────────────────────
  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        type: z.enum(["max_weight", "total_volume", "max_reps", "timed", "custom"]),
        exerciseId: z.number().optional(),
        startDate: z.string().or(z.date()),
        endDate: z.string().or(z.date()),
        createdBy: z.number(),
        createdByType: z.enum(["oauth", "local"]).default("oauth"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(competitions).values({
        name: input.name,
        description: input.description || null,
        type: input.type,
        exerciseId: input.exerciseId || null,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        createdBy: input.createdBy,
        createdByType: input.createdByType,
      });
      return { id: Number(result[0].lastInsertRowid) };
    }),

  // ─── Join Competition ─────────────────────────────────────────
  join: publicQuery
    .input(
      z.object({
        competitionId: z.number(),
        userId: z.number(),
        userType: z.enum(["oauth", "local"]).default("oauth"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.query.competitionParticipants.findFirst({
        where: and(
          eq(competitionParticipants.competitionId, input.competitionId),
          eq(competitionParticipants.userId, input.userId)
        ),
      });
      if (existing) return { alreadyJoined: true };
      await db.insert(competitionParticipants).values(input);
      return { alreadyJoined: false };
    }),

  // ─── Submit Entry ─────────────────────────────────────────────
  submitEntry: publicQuery
    .input(
      z.object({
        competitionId: z.number(),
        userId: z.number(),
        userType: z.enum(["oauth", "local"]).default("oauth"),
        workoutId: z.number(),
        score: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      // Get the competition to determine score type
      const comp = await db.query.competitions.findFirst({
        where: eq(competitions.id, input.competitionId),
      });
      if (!comp) throw new Error("Competition not found");

      await db.insert(competitionEntries).values({
        competitionId: input.competitionId,
        userId: input.userId,
        userType: input.userType,
        workoutId: input.workoutId,
        score: input.score,
      });
      return { success: true };
    }),

  // ─── My Competitions ──────────────────────────────────────────
  myCompetitions: publicQuery
    .input(
      z.object({
        userId: z.number(),
        userType: z.enum(["oauth", "local"]).default("oauth"),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const participants = await db.query.competitionParticipants.findMany({
        where: and(
          eq(competitionParticipants.userId, input.userId),
          eq(competitionParticipants.userType, input.userType)
        ),
      });
      const compIds = participants.map((p) => p.competitionId);
      if (compIds.length === 0) return [];
      const results = [];
      for (const id of compIds) {
        const comp = await db.query.competitions.findFirst({
          where: eq(competitions.id, id),
        });
        if (comp) results.push(comp);
      }
      return results.sort(
        (a, b) => b.startDate.getTime() - a.startDate.getTime()
      );
    }),

  // ─── Seed Default Competitions ────────────────────────────────
  seedDefaults: publicQuery.mutation(async () => {
    const db = getDb();
    const existing = await db.query.competitions.findMany();
    if (existing.length > 0) return { seeded: 0 };

    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(now.getDate() + 7);
    const twoWeeksFromNow = new Date(now);
    twoWeeksFromNow.setDate(now.getDate() + 14);
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    const defaultComps = [
      {
        name: "SQUAT CHALLENGE: MAX WEIGHT",
        description: "One rep max back squat. Pure strength, no wraps. Belt allowed.",
        type: "max_weight" as const,
        startDate: lastWeek,
        endDate: weekFromNow,
        status: "active" as const,
        createdBy: 1,
        createdByType: "oauth" as const,
      },
      {
        name: "DEADLIFT VOLUME WARS",
        description: "Most total volume (weight x reps) on conventional deadlift in one session.",
        type: "total_volume" as const,
        startDate: now,
        endDate: twoWeeksFromNow,
        status: "active" as const,
        createdBy: 1,
        createdByType: "oauth" as const,
      },
      {
        name: "BENCH PRESS BATTLE",
        description: "Max weight bench press. Competition pause required.",
        type: "max_weight" as const,
        startDate: nextWeek,
        endDate: twoWeeksFromNow,
        status: "upcoming" as const,
        createdBy: 1,
        createdByType: "oauth" as const,
      },
      {
        name: "PULL-UP ENDURANCE TEST",
        description: "Maximum bodyweight pull-ups in one set. Full dead hang at bottom, chin over bar at top.",
        type: "max_reps" as const,
        startDate: lastWeek,
        endDate: now,
        status: "completed" as const,
        createdBy: 1,
        createdByType: "oauth" as const,
      },
    ];

    for (const c of defaultComps) {
      await db.insert(competitions).values(c);
    }
    return { seeded: defaultComps.length };
  }),
});
