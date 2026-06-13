"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AppNav } from "@/components/layout/nav"
import { VoiceInput } from "@/components/onboarding/voice-input"
import { Sparkles } from "lucide-react"

type StatFields = {
  display_name: string
  age: string
  sex: string
  height_cm: string
  weight_kg: string
  body_fat_pct: string
  experience_level: string
  primary_goal: string
  bench_press_kg: string
  squat_kg: string
  deadlift_kg: string
  overhead_press_kg: string
}

const EMPTY_STATS: StatFields = {
  display_name: "",
  age: "",
  sex: "",
  height_cm: "",
  weight_kg: "",
  body_fat_pct: "",
  experience_level: "",
  primary_goal: "",
  bench_press_kg: "",
  squat_kg: "",
  deadlift_kg: "",
  overhead_press_kg: "",
}

// Maps the parsed JSON (numbers/strings/null) into the string-based form state.
function toFormValue(v: unknown): string {
  if (v === null || v === undefined) return ""
  return String(v)
}

// Parse a form string back to a number for DB, or null if blank/invalid.
function numOrNull(v: string): number | null {
  const t = v.trim()
  if (t === "") return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

function strOrNull(v: string): string | null {
  const t = v.trim()
  return t === "" ? null : t
}

export default function OnboardingPage() {
  const [username, setUsername] = useState("")
  const [rawText, setRawText] = useState("")
  const [stats, setStats] = useState<StatFields>(EMPTY_STATS)
  const [parsing, setParsing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/auth/login")
        return
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .single()
      // Pre-fill username if the auto-create trigger already set one.
      if (p?.username) setUsername(p.username)
    })
  }, [router])

  function setField(key: keyof StatFields, value: string) {
    setStats((s) => ({ ...s, [key]: value }))
  }

  function appendTranscript(chunk: string) {
    setRawText((prev) => (prev ? `${prev} ${chunk}` : chunk))
  }

  async function autofill() {
    if (!rawText.trim()) return
    setError("")
    setNotice("")
    setParsing(true)
    try {
      const res = await fetch("/api/ai/parse-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.stats) {
        setError(data?.error ?? "Could not read your stats. Please fill them in manually.")
        return
      }
      const s = data.stats as Record<string, unknown>
      setStats({
        display_name: toFormValue(s.display_name),
        age: toFormValue(s.age),
        sex: toFormValue(s.sex),
        height_cm: toFormValue(s.height_cm),
        weight_kg: toFormValue(s.weight_kg),
        body_fat_pct: toFormValue(s.body_fat_pct),
        experience_level: toFormValue(s.experience_level),
        primary_goal: toFormValue(s.primary_goal),
        bench_press_kg: toFormValue(s.bench_press_kg),
        squat_kg: toFormValue(s.squat_kg),
        deadlift_kg: toFormValue(s.deadlift_kg),
        overhead_press_kg: toFormValue(s.overhead_press_kg),
      })
      setNotice("Filled from your description. Review and edit anything below, then save.")
    } catch {
      setError("Network error reaching the AI. Please fill them in manually.")
    } finally {
      setParsing(false)
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!username || username.length < 3) {
      setError("Pick a username (at least 3 characters).")
      return
    }
    setError("")
    setBusy(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setBusy(false)
        router.replace("/auth/login")
        return
      }

      const payload = {
        id: user.id,
        username,
        display_name: strOrNull(stats.display_name),
        age: numOrNull(stats.age),
        sex: strOrNull(stats.sex),
        height_cm: numOrNull(stats.height_cm),
        weight_kg: numOrNull(stats.weight_kg),
        body_fat_pct: numOrNull(stats.body_fat_pct),
        experience_level: strOrNull(stats.experience_level),
        primary_goal: strOrNull(stats.primary_goal),
        bench_press_kg: numOrNull(stats.bench_press_kg),
        squat_kg: numOrNull(stats.squat_kg),
        deadlift_kg: numOrNull(stats.deadlift_kg),
        overhead_press_kg: numOrNull(stats.overhead_press_kg),
        onboarded_at: new Date().toISOString(),
      }

      const { error: saveError } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" })

      if (saveError) {
        if (saveError.code === "23505") {
          setError("That username is already taken. Try another.")
        } else {
          setError(saveError.message)
        }
        setBusy(false)
        return
      }
      router.push("/dashboard")
    } catch {
      setError("Network error. Please try again.")
      setBusy(false)
    }
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <div className="page-container" style={{ maxWidth: 560, paddingBottom: 64 }}>
        <div style={{ textAlign: "center", margin: "32px 0 28px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 11vw, 56px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: "var(--fg)",
              lineHeight: 1,
            }}
          >
            Set Up Your Profile
          </h1>
          <p
            style={{
              fontFamily: "var(--font-heading-stack)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginTop: 8,
            }}
          >
            Tell us about yourself — type or speak
          </p>
        </div>

        {/* AI capture card */}
        <div className="card-elevated" style={{ padding: 24, marginBottom: 24 }}>
          <label htmlFor="onboard-raw" className="label-sm">
            ABOUT YOU
          </label>
          <textarea
            id="onboard-raw"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g. 'I'm 22, male, 178cm, 75kg, intermediate, bench 100kg, want to build muscle'"
            rows={4}
            className="input-field"
            style={{ resize: "vertical", minHeight: 96, fontSize: 16, lineHeight: 1.5 }}
          />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 12,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={autofill}
              disabled={parsing || !rawText.trim()}
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13 }}
            >
              <Sparkles size={16} aria-hidden="true" />
              {parsing ? "Reading…" : "Auto-fill with AI"}
            </button>
            <VoiceInput onTranscript={appendTranscript} />
          </div>
          {notice && (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--text-secondary)",
                marginTop: 12,
              }}
            >
              {notice}
            </p>
          )}
        </div>

        {/* Editable stat form */}
        <form onSubmit={save} className="card-elevated" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label htmlFor="onboard-username" className="label-sm">
              USERNAME
            </label>
            <input
              id="onboard-username"
              name="username"
              type="text"
              required
              minLength={3}
              maxLength={30}
              placeholder="your_gym_name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              style={{ fontSize: 16 }}
            />
          </div>

          <div>
            <label htmlFor="f-display-name" className="label-sm">
              DISPLAY NAME
            </label>
            <input
              id="f-display-name"
              type="text"
              maxLength={60}
              placeholder="What we call you"
              value={stats.display_name}
              onChange={(e) => setField("display_name", e.target.value)}
              className="input-field"
              style={{ fontSize: 16 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label htmlFor="f-age" className="label-sm">
                AGE
              </label>
              <input
                id="f-age"
                type="number"
                inputMode="numeric"
                min={10}
                max={100}
                placeholder="22"
                value={stats.age}
                onChange={(e) => setField("age", e.target.value)}
                className="input-field"
                style={{ fontSize: 16 }}
              />
            </div>
            <div>
              <label htmlFor="f-sex" className="label-sm">
                SEX
              </label>
              <select
                id="f-sex"
                value={stats.sex}
                onChange={(e) => setField("sex", e.target.value)}
                className="input-field"
                style={{ fontSize: 16 }}
              >
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label htmlFor="f-height" className="label-sm">
                HEIGHT (CM)
              </label>
              <input
                id="f-height"
                type="number"
                inputMode="decimal"
                placeholder="178"
                value={stats.height_cm}
                onChange={(e) => setField("height_cm", e.target.value)}
                className="input-field"
                style={{ fontSize: 16 }}
              />
            </div>
            <div>
              <label htmlFor="f-weight" className="label-sm">
                WEIGHT (KG)
              </label>
              <input
                id="f-weight"
                type="number"
                inputMode="decimal"
                placeholder="75"
                value={stats.weight_kg}
                onChange={(e) => setField("weight_kg", e.target.value)}
                className="input-field"
                style={{ fontSize: 16 }}
              />
            </div>
            <div>
              <label htmlFor="f-bf" className="label-sm">
                BODY FAT %
              </label>
              <input
                id="f-bf"
                type="number"
                inputMode="decimal"
                placeholder="15"
                value={stats.body_fat_pct}
                onChange={(e) => setField("body_fat_pct", e.target.value)}
                className="input-field"
                style={{ fontSize: 16 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label htmlFor="f-exp" className="label-sm">
                EXPERIENCE
              </label>
              <select
                id="f-exp"
                value={stats.experience_level}
                onChange={(e) => setField("experience_level", e.target.value)}
                className="input-field"
                style={{ fontSize: 16 }}
              >
                <option value="">—</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label htmlFor="f-goal" className="label-sm">
                PRIMARY GOAL
              </label>
              <input
                id="f-goal"
                type="text"
                maxLength={60}
                placeholder="build muscle"
                value={stats.primary_goal}
                onChange={(e) => setField("primary_goal", e.target.value)}
                className="input-field"
                style={{ fontSize: 16 }}
              />
            </div>
          </div>

          <div>
            <span className="label-sm" style={{ display: "block", marginBottom: 4 }}>
              KNOWN 1-REP MAXES (KG)
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label htmlFor="f-bench" className="label-sm">
                  BENCH
                </label>
                <input
                  id="f-bench"
                  type="number"
                  inputMode="decimal"
                  placeholder="100"
                  value={stats.bench_press_kg}
                  onChange={(e) => setField("bench_press_kg", e.target.value)}
                  className="input-field"
                  style={{ fontSize: 16 }}
                />
              </div>
              <div>
                <label htmlFor="f-squat" className="label-sm">
                  SQUAT
                </label>
                <input
                  id="f-squat"
                  type="number"
                  inputMode="decimal"
                  placeholder="140"
                  value={stats.squat_kg}
                  onChange={(e) => setField("squat_kg", e.target.value)}
                  className="input-field"
                  style={{ fontSize: 16 }}
                />
              </div>
              <div>
                <label htmlFor="f-dead" className="label-sm">
                  DEADLIFT
                </label>
                <input
                  id="f-dead"
                  type="number"
                  inputMode="decimal"
                  placeholder="180"
                  value={stats.deadlift_kg}
                  onChange={(e) => setField("deadlift_kg", e.target.value)}
                  className="input-field"
                  style={{ fontSize: 16 }}
                />
              </div>
              <div>
                <label htmlFor="f-ohp" className="label-sm">
                  OVERHEAD PRESS
                </label>
                <input
                  id="f-ohp"
                  type="number"
                  inputMode="decimal"
                  placeholder="60"
                  value={stats.overhead_press_kg}
                  onChange={(e) => setField("overhead_press_kg", e.target.value)}
                  className="input-field"
                  style={{ fontSize: 16 }}
                />
              </div>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              style={{
                fontFamily: "var(--font-heading-stack)",
                fontSize: 11,
                fontWeight: 600,
                padding: "8px 12px",
                background: "var(--surface-elevated)",
                color: "var(--accent-red)",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || username.length < 3}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "14px 0", fontSize: 14 }}
          >
            {busy ? "Saving…" : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  )
}
