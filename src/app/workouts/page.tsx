import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: workouts } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workouts</h1>
          <p className="text-zinc-400">Your workout history</p>
        </div>
        <Link href="/workouts/new">
          <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700">
            <Plus className="mr-2 h-4 w-4" />
            New Workout
          </Button>
        </Link>
      </div>

      {workouts && workouts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workouts.map((w) => (
            <Link key={w.id} href={`/workouts/${w.id}`}>
              <Card className="border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{w.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(w.started_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge variant={w.completed_at ? "default" : "secondary"}>
                      {w.completed_at ? "Done" : "Active"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="flex flex-col items-center py-12">
            <p className="text-zinc-500">No workouts logged yet</p>
            <Link href="/workouts/new" className="mt-4">
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700">
                Log Your First Workout
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
