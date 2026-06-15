import type { ZodType } from "zod"
import { log } from "@/lib/log"

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
  opts?: { max_tokens?: number; temperature?: number; model?: string; json?: boolean }
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey || apiKey.trim() === "") {
    // Fail fast and loudly server-side; routes translate this to a 503.
    log.error("deepseek.config_missing", { detail: "DEEPSEEK_API_KEY is missing or empty" })
    throw new DeepSeekConfigError()
  }

  const model = opts?.model ?? "deepseek-chat"
  const startedAt = Date.now()
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: opts?.max_tokens ?? 2048,
      temperature: opts?.temperature ?? 0.3,
      // DeepSeek JSON mode: constrains output to a valid JSON object. Requires
      // the word "json" in the prompt (all our system prompts say "JSON").
      ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
    }),
  })
  const latencyMs = Date.now() - startedAt

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    // Log the real upstream status/body server-side for debugging.
    log.error("deepseek.upstream_error", { status: res.status, latencyMs, body: body.slice(0, 500) })
    throw new DeepSeekApiError(res.status, body)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== "string") {
    log.error("deepseek.unexpected_shape", { latencyMs, sample: JSON.stringify(data)?.slice(0, 500) })
    throw new DeepSeekApiError(res.status, "Unexpected response shape from DeepSeek")
  }
  // Success metadata for the AI subsystem — latency + token usage, queryable in
  // the platform logs (the report's "typed AI subsystem with stored metadata").
  log.info("deepseek.ok", { model, latencyMs, tokens: data?.usage?.total_tokens ?? null })
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
 * Error thrown when the model's JSON parsed but failed schema validation even
 * after a repair attempt. Routes map this to a 502.
 */
export class DeepSeekSchemaError extends Error {
  issues: string
  raw: string
  constructor(issues: string, raw: string) {
    super(`AI response failed schema validation: ${issues}`)
    this.name = "DeepSeekSchemaError"
    this.issues = issues
    this.raw = raw
  }
}

function parseAndValidate<T>(
  raw: string,
  schema: ZodType<T>
): { ok: true; data: T } | { ok: false; error: string } {
  let json: unknown
  try {
    json = parseJsonResponse<unknown>(raw)
  } catch {
    return { ok: false, error: "output was not valid JSON" }
  }
  const result = schema.safeParse(json)
  if (result.success) return { ok: true, data: result.data }
  const error = result.error.issues
    .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("; ")
  return { ok: false, error }
}

/**
 * Call DeepSeek in JSON mode and return data validated against a Zod schema.
 *
 * This replaces the old "parseJsonResponse + hand-rolled shape check" pattern:
 * the response is constrained to JSON, then validated structurally. On a
 * validation failure we make ONE repair attempt — feeding the model its own
 * bad output plus the specific Zod errors — before giving up with a
 * DeepSeekSchemaError (which routes surface as a clean 502).
 *
 * The returned value is fully typed and guaranteed to match `schema`.
 */
export async function callDeepSeekStructured<T>(
  messages: Message[],
  schema: ZodType<T>,
  opts?: { max_tokens?: number; temperature?: number; model?: string }
): Promise<T> {
  const raw = await callDeepSeek(messages, { ...opts, json: true })
  const first = parseAndValidate(raw, schema)
  if (first.ok) return first.data

  // One self-repair pass: show the model its output and the exact problems.
  const repairMessages: Message[] = [
    ...messages,
    { role: "assistant", content: raw },
    {
      role: "user",
      content: `Your previous response was invalid: ${first.error}. Return ONLY corrected JSON that exactly matches the required schema — no prose, no markdown.`,
    },
  ]
  const repaired = await callDeepSeek(repairMessages, { ...opts, json: true })
  const second = parseAndValidate(repaired, schema)
  if (second.ok) return second.data

  log.error("deepseek.schema_invalid_after_repair", { issues: second.error })
  throw new DeepSeekSchemaError(second.error, repaired)
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
  if (err instanceof DeepSeekSchemaError) {
    return { status: 502, body: { error: "The AI response didn't match the expected format. Please try again." } }
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
