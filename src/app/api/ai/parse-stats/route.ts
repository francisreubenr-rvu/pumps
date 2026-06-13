import { NextResponse } from "next/server"
import { callDeepSeek, parseJsonResponse } from "@/lib/deepseek"

const SYSTEM_PROMPT = `You are a strict gym/fitness stat extraction engine. The user will give a free-text description of THEMSELVES (their body stats, training experience, goals, and known lifts). Your ONLY job is to extract that information into structured JSON. You do not chat, advise, or add commentary.

Return ONLY valid JSON (no markdown, no prose, no explanation) matching this exact schema:
{
  "display_name": string | null,
  "age": number | null,
  "sex": "male" | "female" | null,
  "height_cm": number | null,
  "weight_kg": number | null,
  "body_fat_pct": number | null,
  "experience_level": "beginner" | "intermediate" | "advanced" | null,
  "primary_goal": string | null,
  "bench_press_kg": number | null,
  "squat_kg": number | null,
  "deadlift_kg": number | null,
  "overhead_press_kg": number | null
}

Rules:
- Use null for ANY field the user did not clearly state. Never guess or invent values.
- Unit conversion (always output metric):
  - Weight in lb -> kg: divide by 2.2046, round to 1 decimal.
  - Height in ft/in or inches -> cm: 1 in = 2.54 cm, 1 ft = 30.48 cm, round to nearest whole number.
  - If a value is already metric, keep it (round weights to 1 decimal, heights to whole cm).
- "bench", "bench press" -> bench_press_kg. "squat" -> squat_kg. "deadlift", "dl" -> deadlift_kg. "ohp", "overhead press", "military press", "shoulder press" -> overhead_press_kg. These are 1-rep-max / working maxes the user mentions.
- experience_level: map "newbie/new/just started" -> beginner, "been lifting a while/intermediate" -> intermediate, "advanced/competitive/years of training" -> advanced.
- primary_goal: a short lowercase phrase like "build muscle", "lose fat", "gain strength", "recomp". Null if not stated.
- sex: only "male" or "female"; null otherwise.
- display_name: only if the user explicitly gives a name to be called.
- Ignore and do NOT extract anything unrelated to fitness stats. If the text contains no fitness stats at all, return every field as null.
- Output strict JSON only. Never include text outside the JSON object.`

type ParsedStats = {
  display_name: string | null
  age: number | null
  sex: "male" | "female" | null
  height_cm: number | null
  weight_kg: number | null
  body_fat_pct: number | null
  experience_level: "beginner" | "intermediate" | "advanced" | null
  primary_goal: string | null
  bench_press_kg: number | null
  squat_kg: number | null
  deadlift_kg: number | null
  overhead_press_kg: number | null
}

const NUMERIC_FIELDS = [
  "age",
  "height_cm",
  "weight_kg",
  "body_fat_pct",
  "bench_press_kg",
  "squat_kg",
  "deadlift_kg",
  "overhead_press_kg",
] as const

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return null
}

function str(v: unknown): string | null {
  if (typeof v === "string") {
    const t = v.trim()
    return t === "" ? null : t
  }
  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const text: string = body?.text ?? ""

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 })
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: "text too long (max 2000 chars)" }, { status: 400 })
    }

    const raw = await callDeepSeek(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      { temperature: 0.1, max_tokens: 512 }
    )

    let parsed: Record<string, unknown>
    try {
      parsed = parseJsonResponse<Record<string, unknown>>(raw)
    } catch {
      return NextResponse.json(
        { error: "AI returned an unreadable response. Please try rephrasing." },
        { status: 502 }
      )
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid AI response structure" }, { status: 502 })
    }

    // Normalize / sanitize every field so the client gets a predictable shape.
    const sex = str(parsed.sex)?.toLowerCase()
    const exp = str(parsed.experience_level)?.toLowerCase()

    const result: ParsedStats = {
      display_name: str(parsed.display_name),
      age: num(parsed.age),
      sex: sex === "male" || sex === "female" ? sex : null,
      height_cm: num(parsed.height_cm),
      weight_kg: num(parsed.weight_kg),
      body_fat_pct: num(parsed.body_fat_pct),
      experience_level:
        exp === "beginner" || exp === "intermediate" || exp === "advanced" ? exp : null,
      primary_goal: str(parsed.primary_goal),
      bench_press_kg: num(parsed.bench_press_kg),
      squat_kg: num(parsed.squat_kg),
      deadlift_kg: num(parsed.deadlift_kg),
      overhead_press_kg: num(parsed.overhead_press_kg),
    }

    // Round numeric weights/heights to sane precision.
    for (const f of NUMERIC_FIELDS) {
      const v = result[f]
      if (v !== null) {
        result[f] = f === "age" || f === "height_cm" ? Math.round(v) : Math.round(v * 10) / 10
      }
    }

    return NextResponse.json({ stats: result })
  } catch (err) {
    console.error("[parse-stats]", err)
    return NextResponse.json({ error: "Failed to parse stats" }, { status: 500 })
  }
}
