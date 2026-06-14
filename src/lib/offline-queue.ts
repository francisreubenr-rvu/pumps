import type { SupabaseClient } from "@supabase/supabase-js"
import { insertWorkout, type NewWorkoutInput } from "@/lib/workout-writes"
import { log } from "@/lib/log"

/**
 * Persistent offline mutation queue. When a write can't reach the server (the
 * device is offline, or the request fails while offline), it's appended here
 * and replayed automatically once the connection returns — so a workout logged
 * in a gym dead zone is never lost. Survives reloads and tab closes via
 * localStorage. Paired with the in-progress draft (workouts/new): the draft
 * protects the live session; the queue protects the committed save.
 */

const QUEUE_KEY = "kinetic_sync_queue"
const QUEUE_EVENT = "kinetic:queue-changed"

export type QueuedMutation = {
  id: string
  type: "workout.create"
  userId: string
  input: NewWorkoutInput
  createdAt: number
}

function read(): QueuedMutation[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as QueuedMutation[]) : []
  } catch {
    return []
  }
}

function write(items: QueuedMutation[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
  } catch {
    /* storage full / unavailable — non-fatal */
  }
  try {
    window.dispatchEvent(new Event(QUEUE_EVENT))
  } catch {
    /* ignore */
  }
}

let idCounter = 0

export function enqueueWorkoutCreate(userId: string, input: NewWorkoutInput): void {
  const createdAt = Date.now()
  idCounter += 1
  const items = read()
  items.push({ id: `${createdAt}-${idCounter}`, type: "workout.create", userId, input, createdAt })
  write(items)
}

/** Number of pending mutations. */
export function queueLength(): number {
  return read().length
}

/** Subscribe to queue changes (enqueue / drain). Returns an unsubscribe fn. */
export function onQueueChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(QUEUE_EVENT, cb)
  return () => window.removeEventListener(QUEUE_EVENT, cb)
}

let processing = false

/**
 * Drain the queue, executing each mutation against Supabase. Items that fail
 * (e.g. still offline) are kept for the next attempt. Re-entrancy-guarded so an
 * `online` event and a mount-time drain can't double-insert.
 */
export async function processQueue(
  supabase: SupabaseClient
): Promise<{ synced: number; remaining: number }> {
  if (processing) return { synced: 0, remaining: read().length }
  const items = read()
  if (items.length === 0) return { synced: 0, remaining: 0 }

  processing = true
  let synced = 0
  const remaining: QueuedMutation[] = []
  try {
    for (const item of items) {
      try {
        if (item.type === "workout.create") {
          await insertWorkout(supabase, item.userId, item.input)
          synced += 1
        }
      } catch (err) {
        log.exception("sync.replay_failed", err, { type: item.type, id: item.id })
        remaining.push(item)
      }
    }
  } finally {
    processing = false
  }
  write(remaining)
  return { synced, remaining: remaining.length }
}
