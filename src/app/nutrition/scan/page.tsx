"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AppNav } from "@/components/layout/nav"
import { Camera, Zap, Loader2, Check } from "lucide-react"

type Food = { name: string; portion: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }
type ScanResult = { foods: Food[]; total_calories: number; confidence: "high" | "medium" | "low" }

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const

export default function FoodScanPage() {
  const [user, setUser] = useState<any>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [scanError, setScanError] = useState("")
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>("lunch")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return }
      setUser(data.user)
    })
  }, [router])

  useEffect(() => {
    return () => { stream?.getTracks().forEach(t => t.stop()) }
  }, [stream])

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
    } catch {
      setScanError("Camera access denied. Please allow camera permissions.")
    }
  }

  function captureFrame() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7)
    setCaptured(dataUrl)
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
  }

  async function scanFood() {
    if (!captured) return
    setScanning(true)
    setScanError("")
    setResult(null)
    try {
      const base64 = captured.split(",")[1]
      const res = await fetch("/api/ai/calorie-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      })
      const data = await res.json()
      if (data.error) { setScanError(data.error); return }
      setResult(data)
    } catch {
      setScanError("Failed to analyze image.")
    } finally {
      setScanning(false)
    }
  }

  async function logFood() {
    if (!result || !user) return
    setSaving(true)
    const supabase = createClient()
    const today = new Date().toISOString().slice(0, 10)
    await supabase.from("meal_logs").insert(
      result.foods.map(f => ({
        user_id: user.id, date: today, meal_type: mealType,
        food_name: f.name, calories: f.calories, protein_g: f.protein_g, carbs_g: f.carbs_g, fat_g: f.fat_g,
        ai_identified: true,
      }))
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => router.push("/nutrition"), 1200)
  }

  const confidenceColor = { high: "var(--accent)", medium: "var(--accent-blue)", low: "var(--accent-red)" }

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", color: "var(--fg)", lineHeight: 1 }}>
            Scan Food
          </h1>
          <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 4 }}>
            AI Calorie Detection
          </p>
        </div>

        <div className="card-surface" style={{ padding: 24, marginBottom: 16 }}>
          {!stream && !captured && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Camera size={48} style={{ color: "var(--text-secondary)", marginBottom: 16 }} aria-hidden="true" />
              <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>
                Point your camera at food to estimate calories
              </p>
              <button type="button" onClick={startCamera} className="btn-primary" style={{ gap: 8 }}>
                <Camera size={14} aria-hidden="true" /> Open Camera
              </button>
            </div>
          )}

          {stream && (
            <div style={{ position: "relative" }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: "100%", display: "block", background: "#000" }} />
              <button
                type="button"
                onClick={captureFrame}
                className="btn-primary"
                style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", gap: 8 }}
              >
                <Camera size={14} aria-hidden="true" /> Capture
              </button>
            </div>
          )}

          {captured && !stream && (
            <div>
              <img src={captured} alt="Captured food" style={{ width: "100%", display: "block", marginBottom: 16 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => { setCaptured(null); setResult(null); startCamera() }} className="btn-outline" style={{ flex: 1, justifyContent: "center" }}>
                  Retake
                </button>
                <button type="button" onClick={scanFood} disabled={scanning} className="btn-primary" style={{ flex: 1, justifyContent: "center", gap: 8 }}>
                  {scanning ? <Loader2 size={14} style={{ animation: "spin 0.6s linear infinite" }} /> : <Zap size={14} />}
                  {scanning ? "Analyzing…" : "Identify Food"}
                </button>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        {scanError && (
          <div style={{ padding: "12px 16px", background: "var(--surface-elevated)", marginBottom: 16 }}>
            <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 11, color: "var(--accent-red)" }}>{scanError}</p>
          </div>
        )}

        {result && (
          <div className="card-surface" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-heading-stack)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg)" }}>
                Detected Foods
              </h3>
              <span className="badge" style={{ background: confidenceColor[result.confidence] ?? "var(--surface-elevated)", color: "var(--bg)" }}>
                {result.confidence} confidence
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {result.foods.map((f, i) => (
                <div key={i} className="card-elevated" style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--fg)" }}>{f.name}</p>
                    <p style={{ fontFamily: "var(--font-heading-stack)", fontSize: 10, color: "var(--text-secondary)" }}>
                      {f.portion} · P: {f.protein_g}g · C: {f.carbs_g}g · F: {f.fat_g}g
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 14, fontWeight: 700, color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>
                    {f.calories} kcal
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--border)", marginBottom: 20 }}>
              <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>Total</span>
              <span style={{ fontFamily: "var(--font-heading-stack)", fontSize: 20, fontWeight: 700, color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>
                {result.total_calories} kcal
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div>
                <label className="label-sm" style={{ marginBottom: 6, display: "block" }}>Meal Type</label>
                <select value={mealType} onChange={e => setMealType(e.target.value as any)} className="input-field" style={{ padding: "8px 12px", fontSize: 11 }}>
                  {MEAL_TYPES.map(mt => <option key={mt} value={mt}>{mt.charAt(0).toUpperCase() + mt.slice(1)}</option>)}
                </select>
              </div>
              <button
                type="button"
                onClick={logFood}
                disabled={saving || saved}
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center", alignSelf: "flex-end", gap: 8, padding: "11px 0" }}
              >
                {saved ? <><Check size={14} /> Added!</> : saving ? <><Loader2 size={14} style={{ animation: "spin 0.6s linear infinite" }} /> Saving…</> : "Add to Log"}
              </button>
            </div>
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
