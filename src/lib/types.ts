export interface Exercise {
  id: string
  name: string
  category: string
  created_by: string | null
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  name: string
  started_at: string
  completed_at: string | null
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  sort_order: number
}

export interface ExerciseSet {
  id: string
  workout_exercise_id: string
  set_number: number
  reps: number
  weight_kg: number
  completed: boolean
  created_at: string
}

export interface Competition {
  id: string
  name: string
  exercise_id: string
  type: "max_weight" | "max_reps" | "total_volume"
  status: "waiting" | "active" | "completed"
  starts_at: string | null
  ends_at: string | null
  created_by: string
  created_at: string
}

export interface CompetitionParticipant {
  id: string
  competition_id: string
  user_id: string
  joined_at: string
}

export interface CompetitionLog {
  id: string
  competition_id: string
  user_id: string
  set_number: number
  reps: number
  weight_kg: number
  logged_at: string
}
