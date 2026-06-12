import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core"

// ─── Users (OAuth) ──────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  unionId: text("unionId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
  lastSignInAt: text("lastSignInAt").notNull().$defaultFn(() => new Date().toISOString()),
})

export type User = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert

// ─── Local Users (Username/Password) ────────────────────────────
export const localUsers = sqliteTable("local_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  displayName: text("displayName").notNull(),
  email: text("email"),
  passwordHash: text("passwordHash").notNull(),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
})

export type LocalUser = typeof localUsers.$inferSelect
export type InsertLocalUser = typeof localUsers.$inferInsert

// ─── Exercises Catalog ──────────────────────────────────────────
export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category", { enum: ["chest","back","legs","shoulders","arms","core","cardio","olympic","other"] }).notNull(),
  muscleGroup: text("muscleGroup"),
  description: text("description"),
  isDefault: integer("isDefault", { mode: "boolean" }).default(true).notNull(),
  createdBy: integer("createdBy"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
})

export type Exercise = typeof exercises.$inferSelect
export type InsertExercise = typeof exercises.$inferInsert

// ─── Workouts ───────────────────────────────────────────────────
export const workouts = sqliteTable("workouts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  userType: text("userType", { enum: ["oauth", "local"] }).default("oauth").notNull(),
  title: text("title").notNull(),
  notes: text("notes"),
  duration: integer("duration"),
  date: text("date").notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
})

export type Workout = typeof workouts.$inferSelect
export type InsertWorkout = typeof workouts.$inferInsert

// ─── Workout Sets ───────────────────────────────────────────────
export const workoutSets = sqliteTable("workout_sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workoutId: integer("workoutId").notNull(),
  exerciseId: integer("exerciseId").notNull(),
  setNumber: integer("setNumber").notNull(),
  reps: integer("reps").notNull(),
  weight: real("weight").notNull(),
  rpe: integer("rpe"),
  notes: text("notes"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
})

export type WorkoutSet = typeof workoutSets.$inferSelect
export type InsertWorkoutSet = typeof workoutSets.$inferInsert

// ─── Competitions ───────────────────────────────────────────────
export const competitions = sqliteTable("competitions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type", { enum: ["max_weight","total_volume","max_reps","timed","custom"] }).notNull(),
  exerciseId: integer("exerciseId"),
  startDate: text("startDate").notNull(),
  endDate: text("endDate").notNull(),
  status: text("status", { enum: ["upcoming","active","completed"] }).default("upcoming").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdByType: text("createdByType", { enum: ["oauth", "local"] }).default("oauth").notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
})

export type Competition = typeof competitions.$inferSelect
export type InsertCompetition = typeof competitions.$inferInsert

// ─── Competition Participants ───────────────────────────────────
export const competitionParticipants = sqliteTable("competition_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  competitionId: integer("competitionId").notNull(),
  userId: integer("userId").notNull(),
  userType: text("userType", { enum: ["oauth", "local"] }).default("oauth").notNull(),
  joinedAt: text("joinedAt").notNull().$defaultFn(() => new Date().toISOString()),
})

export type CompetitionParticipant = typeof competitionParticipants.$inferSelect
export type InsertCompetitionParticipant = typeof competitionParticipants.$inferInsert

// ─── Competition Entries ────────────────────────────────────────
export const competitionEntries = sqliteTable("competition_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  competitionId: integer("competitionId").notNull(),
  userId: integer("userId").notNull(),
  userType: text("userType", { enum: ["oauth", "local"] }).default("oauth").notNull(),
  workoutId: integer("workoutId").notNull(),
  score: real("score").notNull(),
  submittedAt: text("submittedAt").notNull().$defaultFn(() => new Date().toISOString()),
})

export type CompetitionEntry = typeof competitionEntries.$inferSelect
export type InsertCompetitionEntry = typeof competitionEntries.$inferInsert
