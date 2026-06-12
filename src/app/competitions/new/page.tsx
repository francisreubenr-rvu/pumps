"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Swords } from "lucide-react"
import type { Exercise } from "@/lib/types"

export default function NewCompetitionPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [name, setName] = useState("")
  const [exerciseId, setExerciseId] = useState("")
  const [type, setType] = useState<"max_weight" | "max_reps" | "total_volume">("max_weight")
  const [creating, setCreating] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.from("exercises").select("*").order("name").then(({ data }) => {
      setExercises(data || [])
    })
  }, [])

  async function createCompetition() {
    if (!name || !exerciseId) return
    setCreating(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setCreating(false); return }

    const { data: competition, error } = await supabase
      .from("competitions")
      .insert({
        name,
        exercise_id: exerciseId,
        type,
        status: "waiting",
        created_by: user.id,
      })
      .select()
      .single()

    if (competition) {
      await supabase.from("competition_participants").insert({
        competition_id: competition.id,
        user_id: user.id,
      })
      router.push(`/competitions/${competition.id}`)
    }

    setCreating(false)
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create Competition</h1>
        <p className="text-zinc-400">Challenge your friends to a workout battle</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">Competition Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bench Press Showdown"
              className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Exercise</Label>
            <Select value={exerciseId} onValueChange={(v) => setExerciseId(v ?? "")}>
              <SelectTrigger className="border-zinc-700 bg-zinc-800 text-white">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                {exercises.map((ex) => (
                  <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Competition Type</Label>
            <Select value={type} onValueChange={(v: string | null) => v && setType(v as any)}>
              <SelectTrigger className="border-zinc-700 bg-zinc-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                <SelectItem value="max_weight">Max Weight</SelectItem>
                <SelectItem value="max_reps">Max Reps</SelectItem>
                <SelectItem value="total_volume">Total Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={createCompetition}
            disabled={creating || !name || !exerciseId}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
          >
            <Swords className="mr-2 h-4 w-4" />
            {creating ? "Creating..." : "Create Competition"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
