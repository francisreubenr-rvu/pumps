import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Dumbbell, TrendingUp, CalendarDays, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single()

  if (!profile?.username) redirect("/onboarding")

  const { count: workoutCount } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { data: recentWorkouts } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(5)

  const { data: totalVolume } = await supabase
    .from("exercise_sets")
    .select("reps, weight_kg, workout_exercises!inner(workout_id, workouts!inner(user_id))")
    .eq("workout_exercises.workouts.user_id", user.id)
    .eq("completed", true)

  const volume = totalVolume?.reduce((sum, s) => sum + (s.reps * (s.weight_kg ?? 0)), 0) ?? 0

  const { data: activeCompetitions } = await supabase
    .from("competitions")
    .select("*")
    .eq("status", "active")
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {profile.username}</h1>
          <p className="text-zinc-400">Here&apos;s your gym overview</p>
        </div>
        <Link href="/workouts/new">
          <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700">
            <Plus className="mr-2 h-4 w-4" />
            Start Workout
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-400">
              <Dumbbell className="h-4 w-4 text-orange-500" />
              Total Workouts
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
              Active Competitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{activeCompetitions?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Recent Workouts</CardTitle>
            <Link href="/workouts" className="text-sm text-orange-500 hover:text-orange-400">
              View all <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentWorkouts && recentWorkouts.length > 0 ? (
              <div className="space-y-3">
                {recentWorkouts.map((w) => (
                  <Link
                    key={w.id}
                    href={`/workouts/${w.id}`}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3 transition-colors hover:border-zinc-700"
                  >
                    <div>
                      <p className="font-medium text-white">{w.name}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(w.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={w.completed_at ? "default" : "secondary"}>
                      {w.completed_at ? "Done" : "In Progress"}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-zinc-500">
                No workouts yet.{' '}
                <Link href="/workouts/new" className="text-orange-500 hover:text-orange-400">
                  Start your first workout
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Active Competitions</CardTitle>
            <Link href="/competitions" className="text-sm text-orange-500 hover:text-orange-400">
              View all <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {activeCompetitions && activeCompetitions.length > 0 ? (
              <div className="space-y-3">
                {activeCompetitions.map((c) => (
                  <Link
                    key={c.id}
                    href={`/competitions/${c.id}`}
                    className="block rounded-lg border border-zinc-800 bg-zinc-950 p-3 transition-colors hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{c.name}</p>
                      <Badge className="bg-green-600">{c.type.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      Started {new Date(c.created_at).toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-zinc-500">No active competitions</p>
                <Link href="/competitions/new">
                  <Button variant="link" className="mt-2 text-orange-500">
                    Create one
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
