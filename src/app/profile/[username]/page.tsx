import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Dumbbell, TrendingUp } from "lucide-react"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (!profile) notFound()

  const { count: workoutCount } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)

  const { data: recentWorkouts } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", profile.id)
    .order("started_at", { ascending: false })
    .limit(5)

  const { data: totalVolume } = await supabase
    .from("exercise_sets")
    .select("reps, weight_kg, workout_exercises!inner(workout_id, workouts!inner(user_id))")
    .eq("workout_exercises.workouts.user_id", profile.id)
    .eq("completed", true)

  const volume = totalVolume?.reduce((sum, s) => sum + (s.reps * (s.weight_kg ?? 0)), 0) ?? 0

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="flex items-center gap-6 pt-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url ?? ""} />
            <AvatarFallback className="bg-zinc-700 text-2xl">
              {profile.username?.slice(0, 2).toUpperCase() ?? "??"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
            <p className="text-zinc-400">
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-400">
              <Dumbbell className="h-4 w-4 text-orange-500" />
              Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{workoutCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-400">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{volume.toLocaleString()} kg</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-400">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              Member Since
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-white">
              {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWorkouts && recentWorkouts.length > 0 ? (
            <div className="space-y-2">
              {recentWorkouts.map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                  <div>
                    <p className="font-medium text-white">{w.name}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(w.started_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={w.completed_at ? "default" : "secondary"}>
                    {w.completed_at ? "Done" : "Active"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-zinc-500">No workouts yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
