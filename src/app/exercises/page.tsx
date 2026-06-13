"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Plus } from "lucide-react"

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([])
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const router = useRouter()

  async function load() { const { data } = await createClient().from("exercises").select("*").order("category"); setExercises(data ?? []) }
  useEffect(() => { const supabase = createClient(); supabase.auth.getUser().then(({ data }) => { if (!data.user) { router.replace("/auth/login"); return } load() }) }, [router])

  async function add() { if (!name||!category) return; await createClient().from("exercises").insert({name,category}); setName("");setCategory("");load() }

  const cats = [...new Set(exercises.map(e=>e.category))]

  return (
    <div style={{backgroundColor:"#050505",minHeight:"100vh"}}>
      <header style={{position:"sticky",top:0,zIndex:50,backgroundColor:"rgba(5,5,5,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid #1a1a1a"}}>
        <div style={{maxWidth:1280,margin:"0 auto",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px"}}>
          <Link href="/dashboard" style={{fontFamily:"var(--font-heading-stack)",fontSize:16,fontWeight:700,letterSpacing:"-0.04em",textTransform:"uppercase",color:"#ffffff",textDecoration:"none"}}>PUMPS</Link>
        </div>
      </header>
      <main style={{maxWidth:1280,margin:"0 auto",padding:"40px 24px"}}>
        <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,56px)",fontWeight:600,letterSpacing:"-0.02em",textTransform:"uppercase",color:"#ffffff",lineHeight:1.05,marginBottom:4}}>EXERCISE LIBRARY</h1>
        <p style={{fontFamily:"var(--font-heading-stack)",fontSize:13,fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase",color:"#ccff00",marginBottom:32}}>BROWSE & CREATE</p>
        <div style={{display:"flex",gap:12,marginBottom:40,alignItems:"flex-end",flexWrap:"wrap"}}>
          <div><label className="label-sm">NAME</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Bulgarian Split Squat" className="input-field" style={{width:240}} /></div>
          <div><label className="label-sm">CATEGORY</label><input value={category} onChange={e=>setCategory(e.target.value)} placeholder="e.g. legs" className="input-field" style={{width:140}} /></div>
          <button onClick={add} className="btn-primary"><Plus size={14}/> ADD</button>
        </div>
        {cats.map(cat=>(
          <div key={cat} style={{marginBottom:32}}>
            <h3 style={{fontFamily:"var(--font-heading-stack)",fontSize:14,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:"#ffffff",marginBottom:12}}>{cat}</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:2}}>
              {exercises.filter(e=>e.category===cat).map(ex=>(
                <div key={ex.id} className="card-surface" style={{padding:20}}>
                  <p style={{fontFamily:"var(--font-heading-stack)",fontSize:13,fontWeight:600,letterSpacing:"-0.02em",color:"#ffffff",textTransform:"uppercase"}}>{ex.name}</p>
                  <p style={{fontFamily:"var(--font-heading-stack)",fontSize:10,fontWeight:500,letterSpacing:"0.06em",color:"#8d8d8d",marginTop:4,textTransform:"uppercase"}}>{ex.category}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
