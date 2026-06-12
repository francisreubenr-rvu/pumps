"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts"
import { TrendingUp, Dumbbell } from "lucide-react"

interface SetData {
  date: string
  weight_kg: number
  reps: number
  volume: number
  exercise_name: string
}

interface VolumeByPeriod {
  period: string
  volume: number
}

export default function ProgressPage() {
  const [exerciseList, setExerciseList] = useState<string[]>([])
  const [selectedExercise, setSelectedExercise] = useState("")
  const [maxWeightData, setMaxWeightData] = useState<SetData[]>([])
  const [volumeByWeek, setVolumeByWeek] = useState<VolumeByPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from("exercise_sets")
        .select(`
          reps, weight_kg, created_at,
          workout_exercises!inner(exercises!inner(name), workouts!inner(started_at))
        `)
        .eq("completed", true)
        .eq("workout_exercises.workouts.user_id", user.id)
        .order("created_at", { ascending: true })

      const typedData = (data ?? []) as any[]

      const uniqueExercises = [...new Set(typedData.map((d: any) => d.workout_exercises.exercises.name))] as string[]
      setExerciseList(uniqueExercises)
      if (uniqueExercises.length > 0) setSelectedExercise(uniqueExercises[0])

      const allData: { date: string; weight_kg: number; reps: number; volume: number; exercise_name: string }[] = typedData.map((row: any) => ({
        date: new Date(row.workout_exercises.workouts.started_at).toLocaleDateString(),
        weight_kg: row.weight_kg ?? 0,
        reps: row.reps,
        volume: row.reps * (row.weight_kg ?? 0),
        exercise_name: row.workout_exercises.exercises.name,
      }))

      const maxByDate: Record<string, SetData> = {}
      allData.forEach((d) => {
        const key = `${d.date}|${d.exercise_name}`
        if (!maxByDate[key] || d.weight_kg > maxByDate[key].weight_kg) {
          maxByDate[key] = d
        }
      })
      setMaxWeightData(Object.values(maxByDate).sort((a, b) => a.date.localeCompare(b.date)))

      const volByWeek: Record<string, number> = {}
      allData.forEach((d) => {
        const date = new Date(d.date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const key = weekStart.toLocaleDateString()
        volByWeek[key] = (volByWeek[key] || 0) + d.volume
      })
      setVolumeByWeek(
        Object.entries(volByWeek)
          .map(([period, volume]) => ({ period, volume: Math.round(volume) }))
          .sort((a, b) => a.period.localeCompare(b.period))
      )

      setLoading(false)
    }

    load()
  }, [])

  const filteredMaxWeight = maxWeightData.filter((d) => d.exercise_name === selectedExercise)

  if (loading) return <div className="py-12 text-center text-zinc-500">Loading progress data...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Progress Tracker</h1>
        <p className="text-zinc-400">Visualize your strength gains over time</p>
      </div>

      <Tabs defaultValue="max-weight" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="max-weight" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            <Dumbbell className="mr-2 h-4 w-4" />
            Max Weight
          </TabsTrigger>
          <TabsTrigger value="volume" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            <TrendingUp className="mr-2 h-4 w-4" />
            Weekly Volume
          </TabsTrigger>
        </TabsList>

        <TabsContent value="max-weight">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Max Weight Progression</CardTitle>
              <Select value={selectedExercise} onValueChange={(v) => v && setSelectedExercise(v)}>
                <SelectTrigger className="w-48 border-zinc-700 bg-zinc-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                  {exerciseList.map((ex) => (
                    <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {filteredMaxWeight.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredMaxWeight}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{ background: "#18181b", border: "1px solid #333", borderRadius: "8px" }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight_kg"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={{ fill: "#f97316", r: 4 }}
                        name="Weight (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-zinc-500">No data for this exercise yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-white">Total Volume Per Week</CardTitle>
            </CardHeader>
            <CardContent>
              {volumeByWeek.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeByWeek}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="period" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{ background: "#18181b", border: "1px solid #333", borderRadius: "8px" }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Bar dataKey="volume" fill="url(#volumeGradient)" radius={[4, 4, 0, 0]} name="Volume (kg)" />
                      <defs>
                        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-zinc-500">Log some workouts to see volume charts</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
