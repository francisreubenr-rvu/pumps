"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts"
import { Dumbbell, TrendingUp } from "lucide-react"

export default function ProgressPage() {
  const [exercises, setExercises] = useState<string[]>([])
  const [selected, setSelected] = useState("")
  const [maxWeight, setMaxWeight] = useState<any[]>([])
  const [volume, setVolume] = useState<any[]>([])
  const [tab, setTab] = useState<"weight"|"volume">("weight")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return; setUser(data.user)
      supabase.from("exercise_sets").select(`reps, weight_kg, created_at, workout_exercises!inner(exercises!inner(name), workouts!inner(started_at))`)
        .eq("completed",true).eq("workout_exercises.workouts.user_id",data.user.id).order("created_at",{ascending:true})
        .then(({ data }) => {
          const uniq = [...new Set((data??[]).map((d:any)=>d.workout_exercises.exercises.name))] as string[]
          setExercises(uniq); if(uniq.length>0)setSelected(uniq[0])
          const all:any[]=(data??[]).map((r:any)=>({date:new Date(r.workout_exercises.workouts.started_at).toLocaleDateString(),weight_kg:r.weight_kg??0,reps:r.reps,volume:r.reps*(r.weight_kg??0),exercise:r.workout_exercises.exercises.name}))
          const mwd:any[]=[];const seen:Record<string,number>={}
          all.forEach((d:any)=>{const k=`${d.date}|${d.exercise}`;if(!seen[k]||d.weight_kg>seen[k]){seen[k]=d.weight_kg;mwd.push(d)}})
          setMaxWeight(mwd.sort((a:any,b:any)=>a.date.localeCompare(b.date)))
          const vw:Record<string,number>={}
          all.forEach((d:any)=>{const dt=new Date(d.date.replace(/\//g,"-"));dt.setDate(dt.getDate()-dt.getDay());vw[dt.toLocaleDateString()]=(vw[dt.toLocaleDateString()]||0)+d.volume})
          setVolume(Object.entries(vw).map(([p,v])=>({period:p,volume:Math.round(v)})).sort((a,b)=>a.period.localeCompare(b.period)))
        })
    })
  },[])

  const filtered = maxWeight.filter((d:any)=>d.exercise===selected)
  const demoVolume = volume.length>0?volume:[{period:"Oct 19",volume:12500},{period:"Oct 26",volume:18200},{period:"Nov 2",volume:15400},{period:"Nov 9",volume:22100},{period:"Nov 16",volume:19800},{period:"Nov 23",volume:24600},{period:"Nov 30",volume:20300},{period:"Dec 7",volume:28400}]

  return (
    <div style={{backgroundColor:"#050505",minHeight:"100vh"}}>
      <header style={{position:"sticky",top:0,zIndex:50,backgroundColor:"rgba(5,5,5,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid #1a1a1a"}}>
        <div style={{maxWidth:1280,margin:"0 auto",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px"}}>
          <Link href="/dashboard" style={{fontFamily:"var(--font-heading-stack)",fontSize:16,fontWeight:700,letterSpacing:"-0.04em",textTransform:"uppercase",color:"#ffffff",textDecoration:"none"}}>PUMPS</Link>
        </div>
      </header>
      <main style={{maxWidth:1280,margin:"0 auto",padding:"40px 24px"}}>
        <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,56px)",fontWeight:600,letterSpacing:"-0.02em",textTransform:"uppercase",color:"#ffffff",lineHeight:1.05,marginBottom:4}}>PROGRESS</h1>
        <p style={{fontFamily:"var(--font-heading-stack)",fontSize:13,fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase",color:"#ccff00",marginBottom:32}}>STRENGTH OVER TIME</p>

        <div style={{display:"flex",gap:2,marginBottom:32}}>
          {[{k:"weight"as const,l:"MAX WEIGHT",icon:Dumbbell},{k:"volume"as const,l:"WEEKLY VOLUME",icon:TrendingUp}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)}
              style={{fontFamily:"var(--font-heading-stack)",fontSize:11,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"8px 16px",background:tab===t.k?"#ccff00":"#111",color:tab===t.k?"#050505":"#8d8d8d",border:"1px solid #1a1a1a",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <t.icon size={14}/> {t.l}
            </button>
          ))}
        </div>

        {tab==="weight"&&(
          <div className="card-surface" style={{padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h3 style={{fontFamily:"var(--font-heading-stack)",fontSize:14,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:"#ffffff"}}>MAX WEIGHT</h3>
              <select value={selected} onChange={e=>setSelected(e.target.value)} style={{fontFamily:"var(--font-heading-stack)",fontSize:12,fontWeight:600,color:"#ffffff",background:"#111",border:"1px solid #1a1a1a",padding:"6px 10px"}}>
                {exercises.map(ex=><option key={ex}>{ex}</option>)}
              </select>
            </div>
            {filtered.length>0?(
              <div style={{height:300}}><ResponsiveContainer width="100%" height="100%"><LineChart data={filtered}><XAxis dataKey="date" stroke="#8d8d8d" fontSize={10}/><YAxis stroke="#8d8d8d" fontSize={10}/><Tooltip contentStyle={{background:"#111",border:"1px solid #1a1a1a",fontSize:12,fontFamily:"var(--font-heading-stack)"}}/><Line type="monotone" dataKey="weight_kg" stroke="#ccff00" strokeWidth={2} dot={{fill:"#ccff00",r:3}}/></LineChart></ResponsiveContainer></div>
            ):<p style={{color:"#8d8d8d",textAlign:"center",padding:"40px 0",fontFamily:"var(--font-heading-stack)",fontSize:12}}>No data</p>}
          </div>
        )}

        {tab==="volume"&&(
          <div className="card-surface" style={{padding:24}}>
            <h3 style={{fontFamily:"var(--font-heading-stack)",fontSize:14,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:"#ffffff",marginBottom:24}}>WEEKLY VOLUME</h3>
            <div style={{height:300}}><ResponsiveContainer width="100%" height="100%"><BarChart data={demoVolume}><XAxis dataKey="period" stroke="#8d8d8d" fontSize={10}/><YAxis stroke="#8d8d8d" fontSize={10}/><Tooltip contentStyle={{background:"#111",border:"1px solid #1a1a1a",fontSize:12,fontFamily:"var(--font-heading-stack)"}}/><Bar dataKey="volume" fill="#ccff00" radius={[0,0,0,0]}/></BarChart></ResponsiveContainer></div>
          </div>
        )}
      </main>
    </div>
  )
}
