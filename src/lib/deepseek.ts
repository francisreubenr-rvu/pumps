type Message = {
  role: "system" | "user" | "assistant"
  content: string | ContentBlock[]
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
