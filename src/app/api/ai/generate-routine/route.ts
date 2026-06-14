import { NextResponse } from "next/server"
import { z } from "zod"
import { callDeepSeekStructured, withGuardrail, deepSeekErrorResponse } from "@/lib/deepseek"
import { log } from "@/lib/log"

const SYSTEM_PROMPT = withGuardrail(`You are an expert strength and conditioning coach with 20 years of experience.
Create a complete weekly workout routine based on the user's parameters.
Return ONLY valid JSON with no explanation, matching this exact schema:
{"name":string,"overview":string,"days":[{"day":string,"focus":string,"exercises":[{"name":string,"sets":number,"reps":string,"rest_seconds":number,"notes":string}]}]}
Rules:
- "reps" is a string so you can write ranges like "8-12" or "5" or "AMRAP"
- Make the routine progressive and appropriate for the experience level
- Include warmup and cooldown as exercise items where appropriate
- Only ever produce gym/fitness training programs; if the parameters describe anything non-fitness, return {"name":"","overview":"","days":[]}
- Never include text outside the JSON`)

const GeneratedRoutineSchema = z.object({
  name: z.string(),
  overview: z.string(),
  days: z.array(
    z.object({
      day: z.string(),
      focus: z.string(),
      exercises: z.array(
        z.object({
          name: z.string(),
          sets: z.number(),
          reps: z.string(),
          rest_seconds: z.number(),
          notes: z.string(),
        })
      ),
    })
  ),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { goal, days_per_week, equipment, experience } = body ?? {}

    if (!goal || !days_per_week || !equipment || !experience) {
      return NextResponse.json({ error: "goal, days_per_week, equipment, and experience are required" }, { status: 400 })
    }

    const validGoals = ["muscle_gain", "strength", "fat_loss", "endurance", "athletic"]
    const validEquipment = ["full_gym", "dumbbells_only", "bodyweight", "home_gym"]
    const validExperience = ["beginner", "intermediate", "advanced"]

    if (!validGoals.includes(goal) || !validEquipment.includes(equipment) || !validExperience.includes(experience)) {
      return NextResponse.json({ error: "Invalid parameter values" }, { status: 400 })
    }

    if (days_per_week < 2 || days_per_week > 7) {
      return NextResponse.json({ error: "days_per_week must be between 2 and 7" }, { status: 400 })
    }

    const userPrompt = `Goal: ${goal.replace("_", " ")}. Training days per week: ${days_per_week}. Equipment: ${equipment.replace(/_/g, " ")}. Experience level: ${experience}. Create a complete, progressive weekly program.`

    const parsed = await callDeepSeekStructured(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      GeneratedRoutineSchema,
      { temperature: 0.5, max_tokens: 3000 }
    )

    return NextResponse.json(parsed)
  } catch (err) {
    log.exception("ai.generate_routine_error", err)
    const mapped = deepSeekErrorResponse(err)
    if (mapped) return NextResponse.json(mapped.body, { status: mapped.status })
    return NextResponse.json({ error: "Failed to generate routine" }, { status: 500 })
  }
}
