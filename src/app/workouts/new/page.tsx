"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, Plus, Trash2, Save } from "lucide-react"
import type { Exercise } from "@/lib/types"

export default function NewWorkoutPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [sets, setSets] = useState<Record<string, { reps: number; weight: number; completed: boolean }[]>>({})
  const [workoutName, setWorkoutName] = useState("")
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.from("exercises").select("*").order("category").then(({ data }) => {
      setExercises(data || [])
    })
  }, [])

  function addExercise(exerciseId: string) {
    if (selectedExercises.includes(exerciseId)) return
    setSelectedExercises([...selectedExercises, exerciseId])
    setSets({ ...sets, [exerciseId]: [] })
  }

  function removeExercise(exerciseId: string) {
    setSelectedExercises(selectedExercises.filter((id) => id !== exerciseId))
    const newSets = { ...sets }
    delete newSets[exerciseId]
    setSets(newSets)
  }

  function addSet(exerciseId: string) {
    const current = sets[exerciseId] || []
    setSets({ ...sets, [exerciseId]: [...current, { reps: 0, weight: 0, completed: false }] })
  }

  function updateSet(exerciseId: string, index: number, field: "reps" | "weight", value: number) {
    const current = [...(sets[exerciseId] || [])]
    current[index] = { ...current[index], [field]: value }
    setSets({ ...sets, [exerciseId]: current })
  }

  function toggleSet(exerciseId: string, index: number) {
    const current = [...(sets[exerciseId] || [])]
    current[index] = { ...current[index], completed: !current[index].completed }
    setSets({ ...sets, [exerciseId]: current })
  }

  function removeSet(exerciseId: string, index: number) {
    const current = [...(sets[exerciseId] || [])]
    current.splice(index, 1)
    setSets({ ...sets, [exerciseId]: current })
  }

  async function saveWorkout() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { data: workout } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        name: workoutName || "Workout",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (!workout) { setSaving(false); return }

    for (const [idx, exerciseId] of selectedExercises.entries()) {
      const { data: we } = await supabase
        .from("workout_exercises")
        .insert({
          workout_id: workout.id,
          exercise_id: exerciseId,
          sort_order: idx,
        })
        .select()
        .single()

      if (!we) continue

      const exerciseSets = sets[exerciseId] || []
      await supabase.from("exercise_sets").insert(
        exerciseSets.map((s, i) => ({
          workout_exercise_id: we.id,
          set_number: i + 1,
          reps: s.reps,
          weight_kg: s.weight,
          completed: s.completed,
        }))
      )
    }

    setSaving(false)
    router.push(`/workouts/${workout.id}`)
  }

  const categories = [...new Set(exercises.map((e) => e.category))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">New Workout</h1>
          <p className="text-zinc-400">Log your sets</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Workout name (e.g. Push Day)"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          className="max-w-xs border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {selectedExercises.map((exerciseId) => {
            const exercise = exercises.find((e) => e.id === exerciseId)
            const exerciseSets = sets[exerciseId] || []
            return (
              <Card key={exerciseId} className="border-zinc-800 bg-zinc-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base text-white">{exercise?.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(exerciseId)}
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {exerciseSets.map((set, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Badge variant="outline" className="w-8 justify-center text-xs">
                        {idx + 1}
                      </Badge>
                      <Input
                        type="number"
                        placeholder="Weight"
                        value={set.weight || ""}
                        onChange={(e) => updateSet(exerciseId, idx, "weight", Number(e.target.value))}
                        className="w-24 border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-600"
                      />
                      <span className="text-xs text-zinc-500">kg</span>
                      <Input
                        type="number"
                        placeholder="Reps"
                        value={set.reps || ""}
                        onChange={(e) => updateSet(exerciseId, idx, "reps", Number(e.target.value))}
                        className="w-20 border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-600"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSet(exerciseId, idx)}
                        className={set.completed ? "text-green-500" : "text-zinc-600"}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSet(exerciseId, idx)}
                        className="text-zinc-600 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSet(exerciseId)}
                    className="mt-2 w-full border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Set
                  </Button>
                </CardContent>
              </Card>
            )
          })}

          {selectedExercises.length > 0 && (
            <Button
              onClick={saveWorkout}
              disabled={saving}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Complete Workout"}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-base text-white">Add Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.map((category) => (
                <div key={category} className="mb-3">
                  <p className="mb-1 text-xs font-semibold uppercase text-zinc-500">{category}</p>
                  <div className="space-y-1">
                    {exercises
                      .filter((e) => e.category === category)
                      .map((exercise) => (
                        <Button
                          key={exercise.id}
                          variant={selectedExercises.includes(exercise.id) ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          disabled={selectedExercises.includes(exercise.id)}
                          onClick={() => addExercise(exercise.id)}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          {exercise.name}
                        </Button>
                      ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
