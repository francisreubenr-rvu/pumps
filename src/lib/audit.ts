import type { SupabaseClient } from "@supabase/supabase-js"

/** Entities that can appear in the audit trail. */
export type AuditEntityType =
  | "workout"
  | "exercise_set"
  | "journal"
  | "meal_log"
  | "competition"
  | "squad"
  | "profile"

/**
 * Record an entry in the audit trail (`audit_events`).
 *
 * Best-effort by design: a failed audit write must NEVER block the user's
 * action, so errors are logged, not thrown. This also makes the call inert
 * (a logged error) until migration 00010 creates the table in the target
 * environment — wiring can land before the migration is applied.
 *
 * Pass whichever Supabase client the caller already holds. Client-side calls
 * are RLS-bound to `auth.uid() = actor_id`; server (service-role) calls bypass
 * RLS and may attribute events to any actor.
 */
export async function recordAuditEvent(
  supabase: SupabaseClient,
  params: {
    actorId: string
    action: string
    entityType: AuditEntityType
    entityId?: string
    metadata?: Record<string, unknown>
  }
): Promise<void> {
  try {
    const { error } = await supabase.from("audit_events").insert({
      actor_id: params.actorId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? {},
    })
    if (error) console.error("[audit] failed to record", params.action, error.message)
  } catch (err) {
    console.error("[audit] unexpected error recording", params.action, err)
  }
}
