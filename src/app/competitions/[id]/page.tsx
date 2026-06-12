"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Swords, Play, Square, Timer, ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"

interface CompetitionLog {
  id: string
  user_id: string
  set_number: number
  reps: number
  weight_kg: number
  logged_at: string
}

interface Participant {
  user_id: string
  username: string
}

interface CompetitionData {
  id: string
  name: string
  type: "max_weight" | "max_reps" | "total_volume"
  status: "waiting" | "active" | "completed"
  created_by: string
  exercise_name: string
}

export default function CompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const [competitionId, setCompetitionId] = useState("")
  const [competition, setCompetition] = useState<CompetitionData | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [logs, setLogs] = useState<CompetitionLog[]>([])
  const [weight, setWeight] = useState(60)
  const [reps, setReps] = useState(10)
  const [userId, setUserId] = useState("")
  const [isParticipant, setIsParticipant] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const { id } = await params
      setCompetitionId(id)
    }
    init()
  }, [params])

  useEffect(() => {
    if (!competitionId) return
    loadData()
  }, [competitionId])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data: comp } = await supabase
      .from("competitions")
      .select("*, exercises(name)")
      .eq("id", competitionId)
      .single()

    if (!comp) return
    setCompetition({
      id: comp.id,
      name: comp.name,
      type: comp.type,
      status: comp.status,
      created_by: comp.created_by,
      exercise_name: (comp as any).exercises?.name ?? "Unknown",
    })

    const { data: parts } = await supabase
      .from("competition_participants")
      .select("user_id, profiles!inner(username)")
      .eq("competition_id", competitionId)

    setParticipants(
      (parts ?? []).map((p: any) => ({
        user_id: p.user_id,
        username: (p as any).profiles?.username ?? "Unknown",
      }))
    )

    setIsParticipant(parts?.some((p: any) => p.user_id === user.id) ?? false)

    const { data: logData } = await supabase
      .from("competition_logs")
      .select("*")
      .eq("competition_id", competitionId)
      .order("logged_at", { ascending: true })

    setLogs((logData ?? []) as CompetitionLog[])
  }

  useEffect(() => {
    if (!competitionId) return

    const channel = supabase
      .channel(`competition:${competitionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "competition_logs",
          filter: `competition_id=eq.${competitionId}`,
        },
        (payload: any) => {
          setLogs((prev) => [...prev, payload.new as CompetitionLog])
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "competitions",
          filter: `id=eq.${competitionId}`,
        },
        (payload: any) => {
          setCompetition((prev) =>
            prev ? { ...prev, status: payload.new.status } : prev
          )
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "competition_participants",
          filter: `competition_id=eq.${competitionId}`,
        },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [competitionId])

  useEffect(() => {
    if (competition?.status !== "active") return
    const startTime = Date.now()
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [competition?.status])

  async function startCompetition() {
    await supabase
      .from("competitions")
      .update({ status: "active", starts_at: new Date().toISOString() })
      .eq("id", competitionId)
  }

  async function endCompetition() {
    await supabase
      .from("competitions")
      .update({ status: "completed", ends_at: new Date().toISOString() })
      .eq("id", competitionId)
  }

  async function joinCompetition() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("competition_participants").insert({
      competition_id: competitionId,
      user_id: user.id,
    })
    setIsParticipant(true)
    loadData()
  }

  async function logSet() {
    if (!isParticipant) return
    await supabase.from("competition_logs").insert({
      competition_id: competitionId,
      user_id: userId,
      set_number: (logs.filter((l) => l.user_id === userId).length) + 1,
      reps,
      weight_kg: weight,
    })
  }

  function getParticipantStats(userId: string) {
    const userLogs = logs.filter((l) => l.user_id === userId)
    if (!competition) return { label: "" }

    if (competition.type === "max_weight") {
      const maxW = Math.max(...userLogs.map((l) => Number(l.weight_kg ?? 0)), 0)
      return { label: `${maxW} kg` }
    }
    if (competition.type === "max_reps") {
      const maxR = Math.max(...userLogs.map((l) => l.reps), 0)
      return { label: `${maxR} reps` }
    }
    const total = userLogs.reduce((sum, l) => sum + l.reps * Number(l.weight_kg ?? 0), 0)
    return { label: `${total} kg total` }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  const isCreator = competition?.created_by === userId
  const canLog = isParticipant && competition?.status === "active"

  if (!competition) {
    return <div className="py-12 text-center text-zinc-500">Loading competition...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/competitions">
          <Button variant="ghost" size="sm" className="text-zinc-400">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{competition.name}</h1>
          <p className="text-zinc-400">
            {competition.exercise_name} — {competition.type.replace("_", " ")}
          </p>
        </div>
        <Badge
          className={`ml-auto ${
            competition.status === "active"
              ? "bg-green-600"
              : competition.status === "completed"
              ? "bg-zinc-600"
              : "bg-yellow-600"
          }`}
        >
          {competition.status}
        </Badge>
      </div>

      {competition.status === "active" && (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="flex items-center justify-center py-4">
            <Timer className="mr-2 h-5 w-5 text-orange-500" />
            <span className="text-2xl font-mono text-white">{formatTime(elapsed)}</span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg text-white">Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {participants.map((p) => {
                  const stats = getParticipantStats(p.user_id)
                  return (
                    <div
                      key={p.user_id}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-zinc-700 text-xs">
                            {p.username?.slice(0, 2).toUpperCase() ?? "??"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-white">{p.username}</span>
                      </div>
                      <Badge className="bg-orange-600">{stats.label}</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {canLog && (
            <Card className="border-zinc-800 bg-zinc-900 ring-1 ring-green-600/50">
              <CardContent className="flex items-end gap-3 pt-6">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-zinc-500">Weight (kg)</label>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="border-zinc-700 bg-zinc-800 text-white"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-zinc-500">Reps</label>
                  <Input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(Number(e.target.value))}
                    className="border-zinc-700 bg-zinc-800 text-white"
                  />
                </div>
                <Button
                  onClick={logSet}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
                >
                  Log Set
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {isCreator && competition.status === "waiting" && (
            <Button
              onClick={startCompetition}
              disabled={participants.length < 1}
              className="w-full bg-green-600 text-white hover:bg-green-700"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Competition
            </Button>
          )}

          {isCreator && competition.status === "active" && (
            <Button
              onClick={endCompetition}
              className="w-full bg-red-600 text-white hover:bg-red-700"
            >
              <Square className="mr-2 h-4 w-4" />
              End Competition
            </Button>
          )}

          {!isParticipant && competition.status !== "completed" && (
            <Button
              onClick={joinCompetition}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Join Competition
            </Button>
          )}

          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-base text-white">
                <Swords className="mr-2 inline h-4 w-4 text-orange-500" />
                Live Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] space-y-2 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-sm text-zinc-500">Waiting for first set...</p>
                ) : (
                  [...logs].reverse().map((log) => {
                    const user = participants.find((p) => p.user_id === log.user_id)
                    return (
                      <div key={log.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                        <p className="text-xs font-medium text-white">
                          {user?.username ?? "Unknown"}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Set {log.set_number}: {log.weight_kg} kg × {log.reps} ={" "}
                          {(Number(log.weight_kg ?? 0) * log.reps).toLocaleString()} kg
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
