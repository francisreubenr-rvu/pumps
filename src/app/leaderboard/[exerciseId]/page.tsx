import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Crown, Medal, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ExerciseLeaderboardPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>
}) {
  const { exerciseId } = await params
  const supabase = await createClient()

  const { data: exercise } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", exerciseId)
    .single()

  const { data: sets } = await supabase
    .from("exercise_sets")
    .select(`
      weight_kg, reps,
      workout_exercises!inner(
        exercise_id,
        exercises!inner(name),
        workouts!inner(user_id)
      )
    `)
    .eq("completed", true)
    .eq("workout_exercises.exercise_id", exerciseId)

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const userBest: Record<string, { weight: number; username: string; avatar: string }> = {}
  sets?.forEach((s) => {
    const userId = (s as any).workout_exercises.workouts.user_id
    const profile = profileMap[userId]
    if (!profile) return
    const weight = Number(s.weight_kg ?? 0)
    if (weight > (userBest[userId]?.weight ?? 0)) {
      userBest[userId] = { weight, username: profile.username, avatar: profile.avatar_url }
    }
  })

  const ranked = Object.values(userBest)
    .sort((a, b) => b.weight - a.weight)
    .map((entry, i) => ({ rank: i + 1, ...entry }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/leaderboard">
          <Button variant="ghost" size="sm" className="text-zinc-400">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{exercise?.name ?? "Exercise"} Leaderboard</h1>
          <p className="text-zinc-400">{exercise?.category ?? ""}</p>
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">Max Weight</CardTitle>
        </CardHeader>
        <CardContent>
          {ranked.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500">
                    <th className="pb-2 w-12 font-medium">#</th>
                    <th className="pb-2 font-medium">Athlete</th>
                    <th className="pb-2 text-right font-medium">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((entry) => (
                    <tr key={entry.rank} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                      <td className="py-3">{rankIcon(entry.rank)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-zinc-700 text-xs">
                              {entry.username?.slice(0, 2).toUpperCase() ?? "??"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-white">{entry.username}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Badge className="bg-orange-600 text-white">
                          {Math.round(entry.weight).toLocaleString()} kg
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-zinc-500">No lifts logged for this exercise yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function rankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />
  if (rank === 2) return <Medal className="h-5 w-5 text-zinc-300" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
  return <span className="font-mono text-sm text-zinc-500">{rank}</span>
}
