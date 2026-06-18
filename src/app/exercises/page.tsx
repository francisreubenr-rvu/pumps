"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Plus } from "lucide-react"
import { PageShell, PageTitle, Card, EmptyState, Fill } from "@/components/ui/kinetic"

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([])
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const router = useRouter()

  async function load() {
    const { data } = await createClient().from("exercises").select("*").order("category")
    setExercises(data ?? [])
    setLoading(false)
  }
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      load()
    })
  }, [router])

  async function add() {
    if (!name || !category || adding) return
    setAdding(true)
    await createClient().from("exercises").insert({ name, category: category.toLowerCase().trim() })
    setName(""); setCategory("")
    await load()
    setAdding(false)
  }

  const cats = [...new Set(exercises.map(e => e.category))]

  return (
    <PageShell>
      <PageTitle title="Exercise library" eyebrow="Browse & create" />

      <div style={{ display: "flex", gap: 12, marginBottom: 40, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <label className="label-sm">NAME</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") add() }}
            placeholder="e.g. Bulgarian Split Squat"
            className="input-field"
            style={{ width: 240 }}
          />
        </div>
        <div>
          <label className="label-sm">CATEGORY</label>
          <input
            value={category}
            onChange={e => setCategory(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") add() }}
            placeholder="e.g. legs"
            className="input-field"
            style={{ width: 140 }}
          />
        </div>
        <button onClick={add} className="btn-primary" disabled={adding}>
          <Plus size={14} /> {adding ? "ADDING…" : "ADD"}
        </button>
      </div>

      {loading ? (
        <Fill>Loading library…</Fill>
      ) : exercises.length === 0 ? (
        <Card>
          <EmptyState message="No exercises yet — add your first above to build the library." />
        </Card>
      ) : (
        cats.map(cat => (
          <div key={cat} style={{ marginBottom: 32 }}>
            <h3 className="k-title" style={{ textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              {cat}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {exercises.filter(e => e.category === cat).map(ex => (
                <Card key={ex.id}>
                  <p className="k-row-title" style={{ textTransform: "uppercase" }}>{ex.name}</p>
                  <p className="k-row-sub" style={{ marginTop: 4, textTransform: "uppercase" }}>{ex.category}</p>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </PageShell>
  )
}
