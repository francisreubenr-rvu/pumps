"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Plus, Swords } from "lucide-react"

export default function CompetitionsPage() {
  const [comps, setComps] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
    supabase.from("competitions").select("*, exercises(name), competition_participants(count)").order("created_at",{ascending:false}).then(({data})=>setComps(data??[]))
  },[])

  return (
    <div style={{backgroundColor:"#050505",minHeight:"100vh"}}>
      <header style={{position:"sticky",top:0,zIndex:50,backgroundColor:"rgba(5,5,5,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid #1a1a1a"}}>
        <div style={{maxWidth:1280,margin:"0 auto",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px"}}>
          <Link href="/dashboard" style={{fontFamily:"var(--font-heading-stack)",fontSize:16,fontWeight:700,letterSpacing:"-0.04em",textTransform:"uppercase",color:"#ffffff",textDecoration:"none"}}>PUMPS</Link>
          {userId && <Link href="/competitions/new" className="btn-primary" style={{fontSize:12,padding:"8px 16px"}}><Plus size={14}/> CREATE</Link>}
        </div>
      </header>
      <main style={{maxWidth:1280,margin:"0 auto",padding:"40px 24px"}}>
        <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,56px)",fontWeight:600,letterSpacing:"-0.02em",textTransform:"uppercase",color:"#ffffff",lineHeight:1.05,marginBottom:4}}>COMPETITIONS</h1>
        <p style={{fontFamily:"var(--font-heading-stack)",fontSize:13,fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase",color:"#ccff00",marginBottom:32}}>LIVE WORKOUT BATTLES</p>

        {comps.length>0?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:2}} className="stagger">
            {comps.map(c=>(
              <Link key={c.id} href={`/competitions/${c.id}`} className="card-surface" style={{padding:24,textDecoration:"none",display:"block",transition:"opacity 0.1s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <p style={{fontFamily:"var(--font-heading-stack)",fontSize:14,fontWeight:600,letterSpacing:"-0.02em",color:"#ffffff",textTransform:"uppercase"}}>{c.name}</p>
                  <span className="badge" style={{background:c.status==="active"?"#ccff00":c.status==="completed"?"#1a1a1a":"#3a3aff",color:c.status==="active"?"#050505":c.status==="completed"?"#8d8d8d":"#ffffff"}}>
                    {c.status==="active" && <><span className="status-dot active" style={{marginRight:4}}/>LIVE</>}{c.status==="waiting"&&"UPCOMING"}{c.status==="completed"&&"DONE"}
                  </span>
                </div>
                <p style={{fontFamily:"var(--font-heading-stack)",fontSize:12,fontWeight:500,color:"#8d8d8d"}}>{c.exercises?.name} — {c.type?.replace("_"," ")}</p>
                <p style={{fontFamily:"var(--font-heading-stack)",fontSize:11,fontWeight:500,color:"#8d8d8d",marginTop:8}}><Swords size={12} style={{display:"inline",marginRight:4}}/>{c.competition_participants?.[0]?.count??0} participants</p>
              </Link>
            ))}
          </div>
        ):(
          <div className="card-surface" style={{padding:60,textAlign:"center"}}>
            <Swords size={24} style={{color:"#8d8d8d",marginBottom:12}}/>
            <p style={{fontFamily:"var(--font-heading-stack)",fontSize:13,color:"#8d8d8d"}}>No competitions yet</p>
            <Link href="/competitions/new" className="btn-primary" style={{display:"inline-flex",marginTop:16}}>CREATE ONE</Link>
          </div>
        )}
      </main>
    </div>
  )
}
