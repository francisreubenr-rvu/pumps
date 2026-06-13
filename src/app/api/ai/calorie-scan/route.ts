import { NextResponse } from "next/server"
import { callDeepSeek, parseJsonResponse } from "@/lib/deepseek"

const SYSTEM_PROMPT = `You are a nutrition expert and food identification AI. Analyze the food in this image.
Return ONLY valid JSON with no explanation, matching this exact schema:
{"foods":[{"name":string,"portion":string,"calories":number,"protein_g":number,"carbs_g":number,"fat_g":number}],"total_calories":number,"confidence":"high"|"medium"|"low"}
Rules:
- Base calorie estimates on a typical single serving unless the image clearly shows more
- If you cannot identify food with confidence, return {"foods":[],"total_calories":0,"confidence":"low"}
- Never include text outside the JSON`

type CalorieScanResult = {
  foods: { name: string; portion: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }[]
  total_calories: number
  confidence: "high" | "medium" | "low"
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const imageBase64: string = body?.imageBase64 ?? ""

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 })
    }

    // Rough size check — base64 is ~1.33x original, limit to ~600KB encoded (~450KB image)
    if (imageBase64.length > 800_000) {
      return NextResponse.json({ error: "Image too large (max ~600KB)" }, { status: 400 })
    }

    const imageUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`

    const raw = await callDeepSeek(
      [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Identify all food items in this image and estimate calories." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      { temperature: 0.3, max_tokens: 1024, model: "deepseek-chat" }
    )

    const parsed = parseJsonResponse<CalorieScanResult>(raw)

    if (!parsed?.foods || !Array.isArray(parsed.foods)) {
      return NextResponse.json({ error: "Invalid AI response structure" }, { status: 502 })
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error("[calorie-scan]", err)
    return NextResponse.json({ error: "Failed to scan food" }, { status: 500 })
  }
}
