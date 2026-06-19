"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { uploadAvatar, removeAvatar } from "@/lib/storage"
import { queryKeys } from "./keys"

// ── Types ──────────────────────────────────────────────────────────────

export type Profile = {
  id: string
  username: string
  avatar_url: string | null
  display_name: string | null
  age: number | null
  sex: string | null
  height_cm: number | null
  weight_kg: number | null
  body_fat_pct: number | null
  experience_level: string | null
  primary_goal: string | null
  bench_press_kg: number | null
  squat_kg: number | null
  deadlift_kg: number | null
  overhead_press_kg: number | null
  phone: string | null
  address: string | null
  created_at: string
}

export type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at">>

// ── Helpers ────────────────────────────────────────────────────────────

/** Converts a nullable DB value to a form string (null → ""). */
export function toFormValue(v: unknown): string {
  if (v === null || v === undefined) return ""
  return String(v)
}

/** Parses a form string to number, or null if blank/invalid. */
export function numOrNull(v: string): number | null {
  const t = v.trim()
  if (t === "") return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

/** Parses a form string to a trimmed string, or null if blank. */
export function strOrNull(v: string): string | null {
  const t = v.trim()
  return t === "" ? null : t
}

/** Returns a finite positive number from a form string, or a fallback. */
export function sliderVal(raw: string, fallback: number): number {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

// ── Query: fetch own profile ───────────────────────────────────────────

export function useProfile(userId: string | undefined) {
  return useQuery<Profile | null>({
    queryKey: userId ? queryKeys.profile.own(userId) : ["profile", "anon"],
    enabled: !!userId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .single()
      if (error) {
        console.error("Profile query failed:", error)
        throw error
      }
      return data
    },
  })
}

// ── Query: username availability check ─────────────────────────────────

export function useUsernameAvailable(
  username: string,
  currentUserId: string | undefined,
) {
  return useQuery<boolean>({
    queryKey: queryKeys.profile.usernameAvailable(username),
    enabled: username.length >= 3 && !!currentUserId,
    staleTime: 30_000,
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", currentUserId!)
        .maybeSingle()
      return !data
    },
  })
}

// ── Mutation: update profile fields ────────────────────────────────────

export function useUpdateProfile(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      if (!userId) throw new Error("not authenticated")
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
      if (error) {
        if (error.code === "23505") {
          throw new Error("That username is already taken.")
        }
        throw error
      }
    },
    onSuccess: () => {
      if (userId) {
        qc.invalidateQueries({ queryKey: queryKeys.profile.own(userId) })
      }
    },
  })
}

// ── Mutation: upload avatar ────────────────────────────────────────────

function extractAvatarPath(url: string): string | null {
  const match = url.match(/avatars\/(.+)/)
  return match?.[1] ?? null
}

export function useUploadAvatar(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error("not authenticated")
      const supabase = createClient()

      // Fetch current avatar_url so we can clean up the old file
      const { data: current } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .single()

      // Upload new file; returns the storage path (e.g. "uuid/timestamp.jpg")
      const path = await uploadAvatar(supabase, userId, file)

      // Construct the public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      // Update profile row with the new URL
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId)

      if (error) {
        // On DB failure, clean up the newly uploaded file
        await removeAvatar(supabase, path)
        throw error
      }

      // Remove the old avatar file (best-effort cleanup)
      if (current?.avatar_url) {
        try {
          const oldPath = extractAvatarPath(current.avatar_url)
          if (oldPath) await removeAvatar(supabase, oldPath)
        } catch {
          // Silently ignore cleanup failures
        }
      }
    },
    onSuccess: () => {
      if (userId) {
        qc.invalidateQueries({ queryKey: queryKeys.profile.own(userId) })
      }
    },
  })
}
