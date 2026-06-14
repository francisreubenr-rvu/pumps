"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/queries/auth"
import { useSoftDeleteWorkout } from "@/lib/queries/mutations"
import { DetailShell, Card, Badge, Eyebrow, Fill } from "@/components/ui/kinetic"

export default function WorkoutDetailClient() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: user } = useUser()
  const deleteWorkout = useSoftDeleteWorkout(user?.id)
  const [workout, setWorkout] = useState<any>(null)
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Soft delete: stamp deleted_at instead of removing the row. The mutation
  // optimistically drops the card from the workouts list and RLS (00011) then
  // hides the workout + its sets from every read (volume leaves the dashboard,
  // progress, and leaderboards) — recoverable, and audited.
  async function softDelete() {
    if (!user) return
    try {
      await deleteWorkout.mutateAsync(id)
      router.push("/workouts")
    } catch (err) {
      console.error("Soft-delete failed:", err)
    }
  }

  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: authData }) => {
      if (!authData.user) { window.location.href = "/auth/login"; return }
      Promise.all([
        supabase.from("workouts").select("*").eq("id", id).single(),
        supabase.from("workout_exercises").select("*, exercises(name, category)").eq("workout_id", id).order("sort_order")
      ]).then(async ([{ data: wData }, { data: exData }]) => {
        setWorkout(wData)
        setLoading(false)
        if (!exData) return
        const supabase2 = createClient()
        const withSets = await Promise.all((exData as any[]).map(async (we: any) => {
          const { data: sets } = await supabase2.from("exercise_sets").select("*").eq("workout_exercise_id", we.id).order("set_number")
          return { ...we, sets: sets || [] }
        }))
        setExercises(withSets)
      })
    })
  }, [id])

  if (loading) return <Fill>…</Fill>
  if (!workout) return <Fill>Not found</Fill>

  const totalVolume = exercises.reduce((sum, we) => sum + (we.sets ?? []).reduce((s: number, set: any) => s + (set.reps * (set.weight_kg ?? 0)), 0), 0)

  return (
    <DetailShell
      backHref="/workouts"
      crumb={workout.name}
      trailing={<Badge variant={workout.completed_at ? "solid" : "muted"}>{workout.completed_at ? "DONE" : "ACTIVE"}</Badge>}
      maxWidth={800}
    >
      <Card elevated style={{ marginBottom: 2 }}>
        <Eyebrow>Total volume</Eyebrow>
        <div style={{ marginTop: 4 }}>
          <span className="k-stat">{totalVolume.toLocaleString()}</span>{" "}
          <span className="k-stat-unit">KG</span>
        </div>
      </Card>

      {exercises.map(we => (
        <Card key={we.id} elevated style={{ marginTop: 2 }}>
          <h3 className="k-title" style={{ marginBottom: 16 }}>
            {we.exercises?.name}
            <span className="k-eyebrow" style={{ marginLeft: 8 }}>{we.exercises?.category}</span>
          </h3>
          <table className="k-table">
            <thead>
              <tr>
                <th>Set</th>
                <th>Weight</th>
                <th>Reps</th>
                <th style={{ textAlign: "right" }}>Volume</th>
              </tr>
            </thead>
            <tbody>
              {we.sets.map((s: any) => (
                <tr key={s.id}>
                  <td className="num" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{s.set_number}</td>
                  <td className="num">{s.weight_kg ?? 0} kg</td>
                  <td className="num">{s.reps}</td>
                  <td className="num" style={{ color: "var(--accent)", textAlign: "right" }}>{(s.reps * (s.weight_kg ?? 0)).toLocaleString()} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}

      {/* Soft delete — recoverable, audited. */}
      <Card style={{ marginTop: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        {confirmDelete ? (
          <>
            <span className="k-row-sub">Delete this workout? It’s removed from your stats but recoverable.</span>
            <span style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)} disabled={deleteWorkout.isPending} className="btn-outline" style={{ fontSize: 11, padding: "8px 16px" }}>Cancel</button>
              <button onClick={softDelete} disabled={deleteWorkout.isPending} className="btn-primary" style={{ fontSize: 11, padding: "8px 16px", background: "var(--danger)", color: "#fff" }}>
                {deleteWorkout.isPending ? "Deleting…" : "Delete"}
              </button>
            </span>
          </>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="btn-outline" style={{ gap: 6, fontSize: 11, padding: "8px 16px", color: "var(--text-secondary)" }}>
            <Trash2 size={13} aria-hidden="true" /> Delete workout
          </button>
        )}
      </Card>
    </DetailShell>
  )
}
