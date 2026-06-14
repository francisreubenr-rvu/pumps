import { NextResponse } from "next/server"
import { z } from "zod"
import { callDeepSeekStructured, deepSeekErrorResponse } from "@/lib/deepseek"

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

// Lenient field coercers that mirror the original hand-rolled num()/str():
// empty/whitespace strings and non-finite numbers become null; numeric strings
// coerce to numbers; absent keys become null.
const nNum = z.preprocess((v) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null
  if (typeof v === "string") {
    const t = v.trim()
    if (t === "") return null
    const n = Number(t)
    return Number.isFinite(n) ? n : null
  }
  return null
}, z.number().nullable())

const nStr = z.preprocess(
  (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null),
  z.string().nullable()
)

// Enums lower-case first (so "Male" → "male"), then fall back to null on any
// unrecognized value instead of failing the whole parse.
const enumLower = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.enum(values).nullable().catch(null)
  )

const StatsSchema = z.object({
  display_name: nStr,
  age: nNum,
  sex: enumLower(["male", "female"]),
  height_cm: nNum,
  weight_kg: nNum,
  body_fat_pct: nNum,
  experience_level: enumLower(["beginner", "intermediate", "advanced"]),
  primary_goal: nStr,
  bench_press_kg: nNum,
  squat_kg: nNum,
  deadlift_kg: nNum,
  overhead_press_kg: nNum,
})

type ParsedStats = z.infer<typeof StatsSchema>

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

    const result: ParsedStats = await callDeepSeekStructured(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      StatsSchema,
      { temperature: 0.1, max_tokens: 512 }
    )

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
    const mapped = deepSeekErrorResponse(err)
    if (mapped) return NextResponse.json(mapped.body, { status: mapped.status })
    return NextResponse.json({ error: "Failed to parse stats" }, { status: 500 })
  }
}
