type Message = {
  role: "system" | "user" | "assistant"
  content: string | ContentBlock[]
}

/**
 * Error thrown when the server is missing required AI configuration
 * (i.e. DEEPSEEK_API_KEY is unset/empty). Routes should map this to a 503 so
 * the client gets a clear "AI not configured" message instead of an opaque 500.
 */
export class DeepSeekConfigError extends Error {
  constructor(message = "AI is not configured. Set DEEPSEEK_API_KEY.") {
    super(message)
    this.name = "DeepSeekConfigError"
  }
}

/**
 * Error thrown when DeepSeek returns a non-2xx response. Carries the upstream
 * HTTP status and body so routes can log details server-side while returning a
 * clean message to the client.
 */
export class DeepSeekApiError extends Error {
  status: number
  body: string
  constructor(status: number, body: string) {
    super(`DeepSeek API error ${status}: ${body}`)
    this.name = "DeepSeekApiError"
    this.status = status
    this.body = body
  }
}

/**
 * Error thrown when the model response could not be parsed into the expected
 * JSON. Routes should map this to a 502 ("could not parse AI response").
 */
export class DeepSeekParseError extends Error {
  raw: string
  constructor(raw: string) {
    super("Could not parse AI response")
    this.name = "DeepSeekParseError"
    this.raw = raw
  }
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
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey || apiKey.trim() === "") {
    // Fail fast and loudly server-side; routes translate this to a 503.
    console.error(
      "[deepseek] DEEPSEEK_API_KEY is missing or empty — set it in the deployment environment."
    )
    throw new DeepSeekConfigError()
  }

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
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
    // Log the real upstream status/body server-side for debugging.
    console.error(`[deepseek] upstream error ${res.status}: ${body}`)
    throw new DeepSeekApiError(res.status, body)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== "string") {
    console.error("[deepseek] unexpected response shape:", JSON.stringify(data)?.slice(0, 500))
    throw new DeepSeekApiError(res.status, "Unexpected response shape from DeepSeek")
  }
  return content
}

export function parseJsonResponse<T>(raw: string): T {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ?? raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  const jsonStr = match ? match[1] ?? match[0] : raw.trim()
  try {
    return JSON.parse(jsonStr) as T
  } catch {
    // Model returned prose / malformed JSON — surface as a parse error so
    // routes can return a 502 rather than an opaque 500.
    throw new DeepSeekParseError(raw)
  }
}

/**
 * Maps a thrown error from callDeepSeek/parseJsonResponse to an appropriate
 * HTTP response shape. Keeps config (503), upstream (502), and parse (502)
 * failures distinguishable from genuine 500s. Returns null if the error is not
 * a known DeepSeek error (caller should fall through to its generic 500).
 */
export function deepSeekErrorResponse(
  err: unknown
): { status: number; body: { error: string } } | null {
  if (err instanceof DeepSeekConfigError) {
    return { status: 503, body: { error: err.message } }
  }
  if (err instanceof DeepSeekParseError) {
    return { status: 502, body: { error: "Could not parse AI response. Please try again." } }
  }
  if (err instanceof DeepSeekApiError) {
    // Pass auth/config-ish upstream failures through as 503 so the operator
    // knows it's a configuration problem; everything else is a 502 (bad
    // upstream response) rather than a generic 500.
    if (err.status === 401 || err.status === 403) {
      return { status: 503, body: { error: "AI is not configured. Set DEEPSEEK_API_KEY." } }
    }
    return { status: 502, body: { error: "The AI service is temporarily unavailable. Please try again." } }
  }
  return null
}
