import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { exercises } from "@db/schema";
import { eq, like, or } from "drizzle-orm";

export const exerciseRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          search: z.string().optional(),
          category: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.search) {
        conditions.push(
          or(
            like(exercises.name, `%${input.search}%`),
            like(exercises.muscleGroup || "", `%${input.search}%`)
          )
        );
      }
      if (input?.category) {
        // @ts-expect-error category enum
        conditions.push(eq(exercises.category, input.category));
      }
      if (conditions.length > 0) {
        return db.query.exercises.findMany({
          where: conditions[0],
          orderBy: (e, { asc }) => [asc(e.name)],
        });
      }
      return db.query.exercises.findMany({
        orderBy: (e, { asc }) => [asc(e.name)],
      });
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.exercises.findFirst({
        where: eq(exercises.id, input.id),
      });
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        category: z.enum([
          "chest",
          "back",
          "legs",
          "shoulders",
          "arms",
          "core",
          "cardio",
          "olympic",
          "other",
        ]),
        muscleGroup: z.string().max(255).optional(),
        description: z.string().optional(),
        isDefault: z.boolean().optional(),
        createdBy: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(exercises).values({
        name: input.name,
        category: input.category,
        muscleGroup: input.muscleGroup || null,
        description: input.description || null,
        isDefault: input.isDefault ?? true,
        createdBy: input.createdBy || null,
      });
      return { id: Number(result[0].lastInsertRowid) };
    }),

  seedDefaults: publicQuery.mutation(async () => {
    const db = getDb();
    const defaultExercises = [
      { name: "Barbell Back Squat", category: "legs" as const, muscleGroup: "Quadriceps, Glutes", description: "The king of all exercises. Place the barbell on your upper back/shoulders, squat down keeping your chest up." },
      { name: "Conventional Deadlift", category: "back" as const, muscleGroup: "Posterior Chain, Back", description: "Pull a loaded barbell from the floor to hip level. Keep a neutral spine throughout." },
      { name: "Bench Press", category: "chest" as const, muscleGroup: "Chest, Triceps, Shoulders", description: "Lie on a bench, press the barbell from chest to full arm extension." },
      { name: "Overhead Press", category: "shoulders" as const, muscleGroup: "Shoulders, Triceps", description: "Standing barbell press from shoulders to overhead. Strict form, no leg drive." },
      { name: "Barbell Row", category: "back" as const, muscleGroup: "Lats, Rhomboids", description: "Bend at the hips, pull the barbell to your lower chest." },
      { name: "Front Squat", category: "legs" as const, muscleGroup: "Quadriceps, Core", description: "Barbell rests on front deltoids. Squat down keeping torso upright." },
      { name: "Romanian Deadlift", category: "legs" as const, muscleGroup: "Hamstrings, Glutes", description: "Hip hinge movement with slight knee bend. Feel the stretch in hamstrings." },
      { name: "Pull-Up", category: "back" as const, muscleGroup: "Lats, Biceps", description: "Hang from a bar, pull your chin over the bar." },
      { name: "Dip", category: "chest" as const, muscleGroup: "Chest, Triceps, Shoulders", description: "Lower body on parallel bars until shoulders are below elbows, press up." },
      { name: "Incline Bench Press", category: "chest" as const, muscleGroup: "Upper Chest, Shoulders", description: "Bench press on an inclined bench (30-45 degrees)." },
      { name: "Leg Press", category: "legs" as const, muscleGroup: "Quadriceps, Glutes", description: "Seated leg press machine. Full range of motion, do not lock knees." },
      { name: "Lat Pulldown", category: "back" as const, muscleGroup: "Lats, Biceps", description: "Pull the bar down to upper chest, squeeze lats." },
      { name: "Barbell Curl", category: "arms" as const, muscleGroup: "Biceps", description: "Standing curl with barbell. Keep elbows stationary." },
      { name: "Skull Crusher", category: "arms" as const, muscleGroup: "Triceps", description: "Lying tricep extension. Lower bar to forehead, extend arms." },
      { name: "Face Pull", category: "shoulders" as const, muscleGroup: "Rear Delts, Upper Back", description: "Pull cable towards face, external rotation at the end." },
      { name: "Leg Curl", category: "legs" as const, muscleGroup: "Hamstrings", description: "Lying or seated hamstring curl machine." },
      { name: "Calf Raise", category: "legs" as const, muscleGroup: "Calves", description: "Standing or seated calf raise. Full stretch at bottom, squeeze at top." },
      { name: "Plank", category: "core" as const, muscleGroup: "Core", description: "Hold a straight body position on forearms and toes." },
      { name: "Hanging Leg Raise", category: "core" as const, muscleGroup: "Abs, Hip Flexors", description: "Hang from bar, raise legs to parallel or higher." },
      { name: "Power Clean", category: "olympic" as const, muscleGroup: "Full Body", description: "Explosive pull from floor to front rack position." },
    ];

    const existing = await db.query.exercises.findMany();
    if (existing.length === 0) {
      for (const ex of defaultExercises) {
        await db.insert(exercises).values({
          ...ex,
          isDefault: true,
          createdBy: null,
        });
      }
      return { seeded: defaultExercises.length };
    }
    return { seeded: 0, message: "Exercises already seeded" };
  }),
});
