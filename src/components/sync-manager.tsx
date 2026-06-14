"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { processQueue, queueLength, onQueueChange } from "@/lib/offline-queue"

/**
 * Drives the offline sync queue: replays queued mutations on mount and whenever
 * the connection returns, and shows an unobtrusive pending/syncing badge.
 * Mounted once inside the QueryProvider so it can invalidate caches after a
 * successful replay.
 */
export function SyncManager() {
  const qc = useQueryClient()
  const [pending, setPending] = useState(0)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function drain() {
      const len = queueLength()
      if (len === 0) { setPending(0); return }
      if (typeof navigator !== "undefined" && !navigator.onLine) { setPending(len); return }

      setSyncing(true)
      const { synced, remaining } = await processQueue(createClient())
      if (cancelled) return
      setSyncing(false)
      setPending(remaining)
      if (synced > 0) {
        // Prefix-invalidate so all workout-derived caches refetch.
        qc.invalidateQueries({ queryKey: ["dashboard"] })
        qc.invalidateQueries({ queryKey: ["workouts"] })
        qc.invalidateQueries({ queryKey: ["progress"] })
      }
    }

    drain()
    const onOnline = () => drain()
    const offChange = onQueueChange(() => { setPending(queueLength()); drain() })
    window.addEventListener("online", onOnline)
    return () => {
      cancelled = true
      window.removeEventListener("online", onOnline)
      offChange()
    }
  }, [qc])

  if (pending === 0 && !syncing) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "calc(16px + env(safe-area-inset-bottom))",
        left: 16,
        zIndex: 100,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: "var(--r-pill)",
        background: "color-mix(in oklch, var(--bg) 85%, transparent)",
        border: "1px solid var(--border)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        fontFamily: "var(--font-heading-stack)",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--text-secondary)",
      }}
    >
      <RefreshCw
        size={13}
        style={{ color: "var(--accent)", animation: syncing ? "spin 0.8s linear infinite" : "none" }}
        aria-hidden="true"
      />
      {syncing ? "Syncing…" : `${pending} workout${pending === 1 ? "" : "s"} pending sync`}
    </div>
  )
}
