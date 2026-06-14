import { NextResponse } from "next/server"
import { z } from "zod"
import { callDeepSeekStructured, withGuardrail, deepSeekErrorResponse } from "@/lib/deepseek"
import { log } from "@/lib/log"

const SYSTEM_PROMPT = withGuardrail(`You are a gym workout parser. Parse natural language workout descriptions into structured JSON.
Return ONLY valid JSON with no explanation, matching this exact schema:
{"exercises":[{"name":string,"sets":[{"reps":number,"weight_kg":number}]}]}
Rules:
- Match exercise names to standard gym exercise names (e.g. "bench" → "Bench Press", "squats" → "Squat")
- If weight is in lbs, convert to kg (divide by 2.205, round to 1 decimal)
- If no weight mentioned, use 0
- If reps not specified, use 0
- If the input is not a description of a gym/strength workout, return {"exercises":[]}
- Never include any text outside the JSON`)

const ParsedWorkoutSchema = z.object({
  exercises: z.array(
    z.object({
      name: z.string(),
      sets: z.array(z.object({ reps: z.number(), weight_kg: z.number() })),
    })
  ),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const text: string = body?.text ?? ""

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 })
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: "text too long (max 2000 chars)" }, { status: 400 })
    }

    const parsed = await callDeepSeekStructured(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      ParsedWorkoutSchema,
      { temperature: 0.2, max_tokens: 1024 }
    )

    return NextResponse.json(parsed)
  } catch (err) {
    log.exception("ai.workout_parse_error", err)
    const mapped = deepSeekErrorResponse(err)
    if (mapped) return NextResponse.json(mapped.body, { status: mapped.status })
    return NextResponse.json({ error: "Failed to parse workout" }, { status: 500 })
  }
}
