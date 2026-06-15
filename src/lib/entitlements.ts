import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { log } from "@/lib/log"

/** Per-tier daily AI-invocation limit (rolling 24h). */
export const AI_DAILY_LIMIT = { free: 15, pro: 1000 } as const
export type Tier = keyof typeof AI_DAILY_LIMIT

type Supa = Awaited<ReturnType<typeof createServerSupabaseClient>>

/** Resolve a user's tier. Defaults to 'free' (no row, error, or inactive). */
export async function getTier(supabase: Supa, userId: string): Promise<Tier> {
  try {
    const { data } = await supabase
      .from("subscriptions")
      .select("tier, status")
      .eq("user_id", userId)
      .maybeSingle()
    return data?.tier === "pro" && data.status === "active" ? "pro" : "free"
  } catch {
    return "free"
  }
}

type Gate =
  | { ok: true; userId: string; tier: Tier; record: () => Promise<void> }
  | { ok: false; response: NextResponse }

/**
 * Auth + quota guard for an AI route. Returns either a ready-to-return error
 * response (401 unauthenticated, 429 over quota) or `ok` with a `record()`
 * closure to call after a successful AI call.
 *
 * Fails CLOSED on auth (AI is authenticated-only — protects the paid model
 * API) but fails OPEN on infrastructure errors (e.g. the quota tables not yet
 * migrated): metering shouldn't take AI down. Quota is only enforced when it
 * can actually be measured.
 */
export async function enforceAiQuota(kind: string): Promise<Gate> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "Sign in to use AI features." }, { status: 401 }) }
  }

  const tier = await getTier(supabase, user.id)
  const limit = AI_DAILY_LIMIT[tier]

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count, error } = await supabase
      .from("quota_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since)
    if (error) throw error
    if ((count ?? 0) >= limit) {
      const suffix = tier === "free" ? " or upgrade to Pro." : "."
      return {
        ok: false,
        response: NextResponse.json(
          { error: `Daily AI limit reached (${limit}/day on ${tier}). Try again tomorrow${suffix}` },
          { status: 429 }
        ),
      }
    }
  } catch (err) {
    // Metering unavailable (tables not migrated, etc.) — don't block AI.
    log.exception("entitlements.quota_check_failed", err, { kind })
  }

  return {
    ok: true,
    userId: user.id,
    tier,
    record: async () => {
      const { error } = await supabase.from("quota_events").insert({ user_id: user.id, kind })
      if (error) log.error("entitlements.quota_record_failed", { kind, detail: error.message })
    },
  }
}
