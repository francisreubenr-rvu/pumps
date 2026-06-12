import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Crown } from "lucide-react"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: allSets } = await supabase
    .from("exercise_sets")
    .select(`
      weight_kg, reps,
      workout_exercises!inner(
        exercise_id,
        exercises!inner(name, category),
        workouts!inner(user_id)
      )
    `)
    .eq("completed", true)

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, category")
    .order("category")

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />
    if (rank === 2) return <Medal className="h-5 w-5 text-zinc-300" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-zinc-500 font-mono text-sm">{rank}</span>
  }

  function computeMaxWeight(exerciseId?: string) {
    if (!allSets) return []
    const filtered = exerciseId
      ? allSets.filter((s) => (s as any).workout_exercises.exercise_id === exerciseId)
      : allSets

    const userBest: Record<string, { weight: number; username: string; avatar: string; exercise: string }> = {}
    filtered.forEach((s) => {
      const userId = (s as any).workout_exercises.workouts.user_id
      const profile = profileMap[userId]
      if (!profile) return
      const weight = Number(s.weight_kg ?? 0)
      if (weight > (userBest[userId]?.weight ?? 0)) {
        userBest[userId] = {
          weight,
          username: profile.username ?? "Unknown",
          avatar: profile.avatar_url ?? "",
          exercise: (s as any).workout_exercises.exercises.name,
        }
      }
    })

    return Object.values(userBest)
      .sort((a, b) => b.weight - a.weight)
      .map((entry, i) => ({ rank: i + 1, ...entry }))
      .slice(0, 50)
  }

  function computeTotalVolume() {
    if (!allSets) return []
    const userVolume: Record<string, { volume: number; username: string; avatar: string }> = {}

    allSets.forEach((s) => {
      const userId = (s as any).workout_exercises.workouts.user_id
      const profile = profileMap[userId]
      if (!profile) return
      userVolume[userId] = {
        volume: (userVolume[userId]?.volume ?? 0) + s.reps * Number(s.weight_kg ?? 0),
        username: profile.username ?? "Unknown",
        avatar: profile.avatar_url ?? "",
      }
    })

    return Object.values(userVolume)
      .sort((a, b) => b.volume - a.volume)
      .map((entry, i) => ({ rank: i + 1, ...entry }))
      .slice(0, 50)
  }

  const exercisesList = exercises ?? []
  const categories = [...new Set(exercisesList.map((e) => e.category))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboards</h1>
        <p className="text-zinc-400">See who dominates the gym</p>
      </div>

      <Tabs defaultValue="overall-max" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800 flex-wrap h-auto gap-1">
          <TabsTrigger value="overall-max" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            Max Weight
          </TabsTrigger>
          <TabsTrigger value="overall-volume" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            Total Volume
          </TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={`cat-${cat}`} className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overall-max">
          <LeaderboardTable data={computeMaxWeight()} valueKey="weight" unit="kg" />
        </TabsContent>

        <TabsContent value="overall-volume">
          <LeaderboardTable data={computeTotalVolume()} valueKey="volume" unit="kg" />
        </TabsContent>

        {categories.map((cat) => (
          <TabsContent key={`cat-${cat}`} value={`cat-${cat}`}>
            <div className="space-y-4">
              {exercisesList
                .filter((e) => e.category === cat)
                .map((exercise) => (
                  <Card key={exercise.id} className="border-zinc-800 bg-zinc-900">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-white">{exercise.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LeaderboardTable
                        data={computeMaxWeight(exercise.id)}
                        valueKey="weight"
                        unit="kg"
                        compact
                      />
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function LeaderboardTable({
  data,
  valueKey,
  unit,
  compact = false,
}: {
  data: any[]
  valueKey: string
  unit: string
  compact?: boolean
}) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-zinc-500">No data yet. Start logging workouts!</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500">
            <th className="pb-2 w-12 font-medium">#</th>
            <th className="pb-2 font-medium">Athlete</th>
            {!compact && <th className="pb-2 font-medium">Exercise</th>}
            <th className="pb-2 text-right font-medium">Best</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
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
              {!compact && <td className="py-3 text-zinc-400">{entry.exercise}</td>}
              <td className="py-3 text-right">
                <Badge className="bg-orange-600 text-white">
                  {Math.round(entry[valueKey]).toLocaleString()} {unit}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function rankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />
  if (rank === 2) return <Medal className="h-5 w-5 text-zinc-300" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
  return <span className="font-mono text-sm text-zinc-500">{rank}</span>
}
