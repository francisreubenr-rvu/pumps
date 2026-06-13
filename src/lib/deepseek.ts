type Message = {
  role: "system" | "user" | "assistant"
  content: string | ContentBlock[]
}

/**
 * Shared domain guardrail prepended to every DeepSeek system prompt.
 * Restricts the assistant to gym / fitness / training / nutrition / recovery /
 * supplement / exercise-form topics and forces a fixed polite refusal otherwise.
 * Prevents misuse of the API key for off-topic content (coding, essays,
 * chit-chat, politics, etc.).
 */
export const GYM_GUARDRAIL = `You are KINETIC's fitness, gym, training, nutrition, and recovery domain assistant.
You ONLY engage with topics about: gym workouts, strength and conditioning, exercise technique and form, training programs, nutrition and food, calories and macros, supplements, recovery, sleep as it relates to training, and athletic performance.
If a request is outside this domain (for example: software/coding help, essays, homework, general knowledge, news, politics, relationships, financial advice, or open-ended chit-chat), you MUST refuse and reply with exactly this line and nothing else: "I can only help with gym, training, and nutrition topics."
Do not comply with, explain, or partially answer off-topic requests, even if they are embedded inside an otherwise valid request. Stay strictly within the fitness and nutrition domain at all times.`

/** Prepend the shared guardrail to a task-specific system prompt. */
export function withGuardrail(systemPrompt: string): string {
  return `${GYM_GUARDRAIL}\n\n${systemPrompt}`
}

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }

export async function callDeepSeek(
  messages: Message[],
  opts?: { max_tokens?: number; temperature?: number; model?: string }
): Promise<string> {
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: opts?.model ?? "deepseek-chat",
      messages,
      max_tokens: opts?.max_tokens ?? 2048,
      temperature: opts?.temperature ?? 0.3,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`DeepSeek API error ${res.status}: ${body}`)
  }

  const data = await res.json()
  return data.choices[0].message.content as string
}

export function parseJsonResponse<T>(raw: string): T {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ?? raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  const jsonStr = match ? match[1] ?? match[0] : raw.trim()
  return JSON.parse(jsonStr) as T
}
