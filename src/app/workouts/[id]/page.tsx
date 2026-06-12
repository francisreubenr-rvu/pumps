import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: workout } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", id)
    .single()

  if (!workout || workout.user_id !== user.id) notFound()

  const { data: workoutExercises } = await supabase
    .from("workout_exercises")
    .select("*, exercises(name, category)")
    .eq("workout_id", id)
    .order("sort_order")

  let totalVolume = 0
  const exercisesWithSets: { id: string; sets: { id: string; set_number: number; reps: number; weight_kg: number | null }[] }[] = await Promise.all(
    (workoutExercises || []).map(async (we) => {
      const { data: sets } = await supabase
        .from("exercise_sets")
        .select("*")
        .eq("workout_exercise_id", we.id)
        .order("set_number")

      sets?.forEach((s) => {
        totalVolume += (s.reps * (s.weight_kg ?? 0))
      })

      return { ...we, sets: sets || [] }
    })
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/workouts">
          <Button variant="ghost" size="sm" className="text-zinc-400">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{workout.name}</h1>
          <p className="text-zinc-400">
            {new Date(workout.started_at).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Badge variant={workout.completed_at ? "default" : "secondary"} className="ml-auto">
          {workout.completed_at ? "Completed" : "In Progress"}
        </Badge>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">
            Total Volume: {totalVolume.toLocaleString()} kg
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {exercisesWithSets.map((wes) => (
          <Card key={wes.id} className="border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">
                {(wes as any).exercises?.name ?? "Exercise"}
                <Badge variant="outline" className="ml-2 text-xs">
                  {(wes as any).exercises?.category ?? ""}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500">
                      <th className="pb-2 font-medium">Set</th>
                      <th className="pb-2 font-medium">Weight</th>
                      <th className="pb-2 font-medium">Reps</th>
                      <th className="pb-2 font-medium">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wes.sets.map((s) => (
                      <tr key={s.id} className="border-t border-zinc-800">
                        <td className="py-2 text-zinc-400">{s.set_number}</td>
                        <td className="py-2 text-white">{s.weight_kg ?? 0} kg</td>
                        <td className="py-2 text-white">{s.reps}</td>
                        <td className="py-2 text-orange-400">
                          {(s.reps * (s.weight_kg ?? 0)).toLocaleString()} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
