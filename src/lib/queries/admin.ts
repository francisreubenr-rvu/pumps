"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

/**
 * Whether the current user is an admin. Reads the `admins` table, which is
 * RLS-gated to admins — a non-admin simply gets no row back (and any error,
 * e.g. pre-migration, resolves to false). No row leak: non-admins can't see
 * the table at all.
 */
export function useIsAdmin(userId: string | undefined) {
  return useQuery<boolean>({
    queryKey: ["admin", "is-admin", userId],
    enabled: !!userId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", userId!)
        .maybeSingle()
      if (error) return false
      return !!data
    },
  })
}

export type AuditEvent = {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  actor: { username: string | null } | null
}

/**
 * The recent audit trail (admins only — RLS exposes all events to admins).
 * `enabled` should be the admin check, so non-admins never even fire it.
 */
export function useAuditEvents(enabled: boolean) {
  return useQuery<AuditEvent[]>({
    queryKey: ["admin", "audit-events"],
    enabled,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("audit_events")
        .select("id, action, entity_type, entity_id, metadata, created_at, actor:profiles!actor_id(username)")
        .order("created_at", { ascending: false })
        .limit(100)
      if (error) {
        console.error("Audit events query failed:", error)
        throw error
      }
      return (data ?? []) as unknown as AuditEvent[]
    },
  })
}
