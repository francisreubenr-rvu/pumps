"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Swords } from "lucide-react"
import { DetailShell, PageTitle } from "@/components/ui/kinetic"

export default function NewCompetitionPage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<any[]>([])
  const [name, setName] = useState("")
  const [exerciseId, setExerciseId] = useState("")
  const [type, setType] = useState("max_weight")
  const [saving, setSaving] = useState(false)
  const mounted = useRef(true)

  useEffect(() => { createClient().from("exercises").select("*").order("name").then(({ data }) => setExercises(data ?? [])) }, [])
  useEffect(() => { return () => { mounted.current = false } }, [])

  async function create() {
    if (saving) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !name || !exerciseId) return
      const { data: c, error: compErr } = await supabase.from("competitions").insert({ name, exercise_id: exerciseId, type, status: "waiting", created_by: user.id }).select().single()
      if (compErr || !c) { console.error("create competition failed:", compErr); return }
      const { error: partErr } = await supabase.from("competition_participants").insert({ competition_id: c.id, user_id: user.id })
      if (partErr) console.error("participant insert failed:", partErr)
      if (mounted.current) router.push(`/competitions/${c.id}`)
    } catch (err) {
      console.error("create failed:", err)
    } finally {
      if (mounted.current) setSaving(false)
    }
  }

  return (
    <DetailShell backHref="/competitions" crumb="New" maxWidth={480}>
      <div className="k-section">
        <PageTitle title="New competition" eyebrow="Set up a battle" />
      </div>

      <div className="card-elevated" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div><label className="label-sm">NAME</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bench Press Showdown" className="input-field" /></div>
        <div><label className="label-sm">EXERCISE</label><select value={exerciseId} onChange={e => setExerciseId(e.target.value)} className="input-field"><option value="">Select exercise</option>{exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}</select></div>
        <div><label className="label-sm">TYPE</label><select value={type} onChange={e => setType(e.target.value)} className="input-field"><option value="max_weight">Max Weight</option><option value="max_reps">Max Reps</option><option value="total_volume">Total Volume</option></select></div>
        <button onClick={create} disabled={!name || !exerciseId || saving} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px 0" }}><Swords size={14} /> {saving ? "CREATING…" : "CREATE"}</button>
      </div>
    </DetailShell>
  )
}
