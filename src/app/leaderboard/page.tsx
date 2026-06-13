"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Crown, Medal } from "lucide-react"

export default function LeaderboardPage() {
  const [tab, setTab] = useState("max-weight")
  const [maxWeight, setMaxWeight] = useState<any[]>([])
  const [totalVolume, setTotalVolume] = useState<any[]>([])
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from("exercises").select("*").order("category").then(({ data }) => setExercises(data??[])).catch(() => {})
    supabase.from("exercise_sets").select(`weight_kg, reps, workout_exercises!inner(exercise_id, exercises!inner(name), workouts!inner(user_id))`).eq("completed",true).then(({data})=>{
      supabase.from("profiles").select("id, username").then(({data:profiles})=>{
        const pm = Object.fromEntries((profiles??[]).map((p:any)=>[p.id,p]))
        const ub:Record<string,any>={}; const uv:Record<string,any>={}
        ;(data??[]).forEach((s:any)=>{const uid=s.workout_exercises?.workouts?.user_id;const prof=pm[uid];if(!prof)return;const w=Number(s.weight_kg??0);if(w>(ub[uid]?.weight??0))ub[uid]={weight:w,username:prof.username,exercise:s.workout_exercises.exercises.name};uv[uid]={volume:(uv[uid]?.volume??0)+s.reps*w,username:prof.username}})
        setMaxWeight(Object.values(ub).sort((a:any,b:any)=>b.weight-a.weight).map((e:any,i:number)=>({rank:i+1,...e})))
        setTotalVolume(Object.values(uv).sort((a:any,b:any)=>b.volume-a.volume).map((e:any,i:number)=>({rank:i+1,...e})))
        setLoading(false)
      }).catch(() => setLoading(false))
    }).catch(() => setLoading(false))
  },[])

  const cats = [...new Set(exercises.map(e=>e.category))]

  return (
    <div style={{backgroundColor:"#050505",minHeight:"100vh"}}>
      <header style={{position:"sticky",top:0,zIndex:50,backgroundColor:"rgba(5,5,5,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid #1a1a1a"}}>
        <div style={{maxWidth:1280,margin:"0 auto",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px"}}>
          <Link href="/dashboard" style={{fontFamily:"var(--font-heading-stack)",fontSize:16,fontWeight:700,letterSpacing:"-0.04em",textTransform:"uppercase",color:"#ffffff",textDecoration:"none"}}>PUMPS</Link>
        </div>
      </header>
      <main style={{maxWidth:1280,margin:"0 auto",padding:"40px 24px"}}>
        <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,56px)",fontWeight:600,letterSpacing:"-0.02em",textTransform:"uppercase",color:"#ffffff",lineHeight:1.05,marginBottom:4}}>LEADERBOARDS</h1>
        <p style={{fontFamily:"var(--font-heading-stack)",fontSize:13,fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase",color:"#ccff00",marginBottom:32}}>WHO DOMINATES THE GYM</p>

        <div style={{display:"flex",gap:2,marginBottom:32,flexWrap:"wrap"}}>
          {[{k:"max-weight",l:"MAX WEIGHT"},{k:"volume",l:"TOTAL VOLUME"},...cats.map(c=>({k:`cat-${c}`,l:c.toUpperCase()}))].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)}
              style={{fontFamily:"var(--font-heading-stack)",fontSize:11,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"8px 16px",background:tab===t.k?"#ccff00":"#111",color:tab===t.k?"#050505":"#8d8d8d",border:"1px solid #1a1a1a",cursor:"pointer"}}>
              {t.l}
            </button>
          ))}
        </div>

        {loading ? <p style={{color:"#8d8d8d"}}>…</p> : null}

        {tab==="max-weight" && <LBTable data={maxWeight} vk="weight" u="kg" showEx />}
        {tab==="volume" && <LBTable data={totalVolume} vk="volume" u="kg" />}

        {cats.map(c=>tab===`cat-${c}`&&exercises.filter(e=>e.category===c).map(ex=>(
          <div key={ex.id} className="card-surface" style={{padding:24,marginTop:2}}>
            <h3 style={{fontFamily:"var(--font-heading-stack)",fontSize:14,fontWeight:600,letterSpacing:"-0.02em",color:"#ffffff",textTransform:"uppercase",marginBottom:16}}>{ex.name}</h3>
            <LBTable data={(()=>{const best:Record<string,any>={};maxWeight.filter(e=>e.exercise===ex.name).forEach(e=>{if(e.weight>(best[e.username]?.weight??0))best[e.username]=e});return Object.values(best).sort((a:any,b:any)=>b.weight-a.weight).map((e:any,i)=>({rank:i+1,...e})).slice(0,20)})()} vk="weight" u="kg" />
          </div>
        )))}
      </main>
    </div>
  )
}

function LBTable({data,vk,u,showEx}:any){
  if(!data||data.length===0) return <p style={{fontFamily:"var(--font-heading-stack)",fontSize:12,color:"#8d8d8d",padding:"20px 0",textAlign:"center"}}>No rankings yet</p>
  return (
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{color:"#8d8d8d"}}>
        <th style={{textAlign:"left",padding:"8px 0",fontFamily:"var(--font-heading-stack)",fontSize:10,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase"}}>#</th>
        <th style={{textAlign:"left",padding:"8px 0",fontFamily:"var(--font-heading-stack)",fontSize:10,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase"}}>ATHLETE</th>
        {showEx&&<th style={{textAlign:"left",padding:"8px 0",fontFamily:"var(--font-heading-stack)",fontSize:10,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase"}}>EXERCISE</th>}
        <th style={{textAlign:"right",padding:"8px 0",fontFamily:"var(--font-heading-stack)",fontSize:10,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase"}}>BEST</th>
      </tr></thead>
      <tbody>{data.map((e:any)=>(
        <tr key={e.rank} style={{borderTop:"1px solid #1a1a1a"}}>
          <td style={{padding:"10px 0"}}>{e.rank===1?<Crown size={14} style={{color:"#ccff00"}}/>:e.rank===2?<Medal size={14} style={{color:"#8d8d8d"}}/>:e.rank===3?<Medal size={14} style={{color:"#3a3aff"}}/>:<span style={{fontFamily:"var(--font-heading-stack)",fontSize:12,color:"#8d8d8d"}}>{e.rank}</span>}</td>
          <td style={{padding:"10px 0"}}><span style={{fontFamily:"var(--font-heading-stack)",fontSize:13,fontWeight:600,color:"#ffffff"}}>{e.username}</span></td>
          {showEx&&<td style={{padding:"10px 0",fontFamily:"var(--font-heading-stack)",fontSize:12,color:"#8d8d8d"}}>{e.exercise}</td>}
          <td style={{padding:"10px 0",textAlign:"right"}}><span className="badge">{Math.round(e[vk]).toLocaleString()} {u}</span></td>
        </tr>
      ))}</tbody>
    </table>
  )
}
