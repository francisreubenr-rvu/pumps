import { getDb } from "../api/queries/connection";

async function seed() {
  const db = getDb();
  console.log("Seeding exercises...");

  // Seed exercises via tRPC would be ideal, but let's do direct insert for seed
  const { exercises } = await import("./schema");
  const existing = await db.query.exercises.findMany();

  if (existing.length === 0) {
    const defaultExercises = [
      { name: "Barbell Back Squat", category: "legs" as const, muscleGroup: "Quadriceps, Glutes", description: "The king of all exercises. Place the barbell on your upper back/shoulders, squat down keeping your chest up.", isDefault: true, createdBy: null },
      { name: "Conventional Deadlift", category: "back" as const, muscleGroup: "Posterior Chain, Back", description: "Pull a loaded barbell from the floor to hip level. Keep a neutral spine throughout.", isDefault: true, createdBy: null },
      { name: "Bench Press", category: "chest" as const, muscleGroup: "Chest, Triceps, Shoulders", description: "Lie on a bench, press the barbell from chest to full arm extension.", isDefault: true, createdBy: null },
      { name: "Overhead Press", category: "shoulders" as const, muscleGroup: "Shoulders, Triceps", description: "Standing barbell press from shoulders to overhead. Strict form, no leg drive.", isDefault: true, createdBy: null },
      { name: "Barbell Row", category: "back" as const, muscleGroup: "Lats, Rhomboids", description: "Bend at the hips, pull the barbell to your lower chest.", isDefault: true, createdBy: null },
      { name: "Front Squat", category: "legs" as const, muscleGroup: "Quadriceps, Core", description: "Barbell rests on front deltoids. Squat down keeping torso upright.", isDefault: true, createdBy: null },
      { name: "Romanian Deadlift", category: "legs" as const, muscleGroup: "Hamstrings, Glutes", description: "Hip hinge movement with slight knee bend. Feel the stretch in hamstrings.", isDefault: true, createdBy: null },
      { name: "Pull-Up", category: "back" as const, muscleGroup: "Lats, Biceps", description: "Hang from a bar, pull your chin over the bar.", isDefault: true, createdBy: null },
      { name: "Dip", category: "chest" as const, muscleGroup: "Chest, Triceps, Shoulders", description: "Lower body on parallel bars until shoulders are below elbows, press up.", isDefault: true, createdBy: null },
      { name: "Incline Bench Press", category: "chest" as const, muscleGroup: "Upper Chest, Shoulders", description: "Bench press on an inclined bench (30-45 degrees).", isDefault: true, createdBy: null },
      { name: "Leg Press", category: "legs" as const, muscleGroup: "Quadriceps, Glutes", description: "Seated leg press machine. Full range of motion, do not lock knees.", isDefault: true, createdBy: null },
      { name: "Lat Pulldown", category: "back" as const, muscleGroup: "Lats, Biceps", description: "Pull the bar down to upper chest, squeeze lats.", isDefault: true, createdBy: null },
      { name: "Barbell Curl", category: "arms" as const, muscleGroup: "Biceps", description: "Standing curl with barbell. Keep elbows stationary.", isDefault: true, createdBy: null },
      { name: "Skull Crusher", category: "arms" as const, muscleGroup: "Triceps", description: "Lying tricep extension. Lower bar to forehead, extend arms.", isDefault: true, createdBy: null },
      { name: "Face Pull", category: "shoulders" as const, muscleGroup: "Rear Delts, Upper Back", description: "Pull cable towards face, external rotation at the end.", isDefault: true, createdBy: null },
      { name: "Leg Curl", category: "legs" as const, muscleGroup: "Hamstrings", description: "Lying or seated hamstring curl machine.", isDefault: true, createdBy: null },
      { name: "Calf Raise", category: "legs" as const, muscleGroup: "Calves", description: "Standing or seated calf raise. Full stretch at bottom, squeeze at top.", isDefault: true, createdBy: null },
      { name: "Plank", category: "core" as const, muscleGroup: "Core", description: "Hold a straight body position on forearms and toes.", isDefault: true, createdBy: null },
      { name: "Hanging Leg Raise", category: "core" as const, muscleGroup: "Abs, Hip Flexors", description: "Hang from bar, raise legs to parallel or higher.", isDefault: true, createdBy: null },
      { name: "Power Clean", category: "olympic" as const, muscleGroup: "Full Body", description: "Explosive pull from floor to front rack position.", isDefault: true, createdBy: null },
    ];

    for (const ex of defaultExercises) {
      await db.insert(exercises).values(ex);
    }
    console.log(`Seeded ${defaultExercises.length} exercises`);
  } else {
    console.log("Exercises already seeded");
  }

  // Seed sample workouts for demo user
  const { workouts, workoutSets, competitions } = await import("./schema");

  const existingWorkouts = await db.query.workouts.findMany();
  if (existingWorkouts.length === 0) {
    console.log("Seeding sample workouts...");
    const now = new Date();

    for (let w = 0; w < 20; w++) {
      const date = new Date(now);
      date.setDate(date.getDate() - w * 2 - Math.floor(Math.random() * 2));

      const workoutData = {
        userId: 1,
        userType: "oauth" as const,
        title: [
          "HYROX PREP",
          "POWER BUILDING",
          "VOLUME DAY",
          "DELOAD SESSION",
          "STRENGTH FOCUS",
          "ACCESSORY WORK",
          "FULL BODY",
          "UPPER BODY BLAST",
          "LEG DAY DESTROYER",
          "BACK & BICEPS",
          "PUSH DAY",
          "PULL DAY",
          "OLYMPIC LIFTING",
          "CONDITIONING",
          "RECOVERY FLOW",
        ][w % 15],
        notes: "Session felt strong today. Progressive overload on main lifts.",
        duration: 45 + Math.floor(Math.random() * 60),
        date: date,
      };

      const result = await db.insert(workouts).values(workoutData);
      const workoutId = Number(result[0].insertId);

      // Add 3-5 sets per workout
      const numSets = 3 + Math.floor(Math.random() * 3);
      for (let s = 0; s < numSets; s++) {
        await db.insert(workoutSets).values({
          workoutId,
          exerciseId: 1 + Math.floor(Math.random() * 20),
          setNumber: s + 1,
          reps: 3 + Math.floor(Math.random() * 12),
          weight: Math.round((20 + Math.random() * 120) * 2) / 2,
          rpe: 6 + Math.floor(Math.random() * 4),
        });
      }
    }
    console.log("Seeded 20 sample workouts");
  } else {
    console.log("Workouts already seeded");
  }

  // Seed competitions
  const existingComps = await db.query.competitions.findMany();
  if (existingComps.length === 0) {
    console.log("Seeding competitions...");
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(now.getDate() + 7);
    const twoWeeksFromNow = new Date(now);
    twoWeeksFromNow.setDate(now.getDate() + 14);
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    await db.insert(competitions).values([
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
    ]);
    console.log("Seeded 4 competitions");
  } else {
    console.log("Competitions already seeded");
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
