"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { uploadProgressPhoto, signedPhotoUrl, removeProgressPhoto } from "@/lib/storage"
import { queryKeys } from "./keys"

export type ProgressPhoto = {
  id: string
  storage_path: string
  weight_kg: number | null
  taken_at: string
  /** Short-lived signed URL (null if it couldn't be generated). */
  url: string | null
}

/** A user's progress photos, newest first, each with a fresh signed URL. */
export function useProgressPhotos(userId: string | undefined) {
  return useQuery<ProgressPhoto[]>({
    queryKey: userId ? queryKeys.photos.list(userId) : ["photos", "anon"],
    enabled: !!userId,
    // Signed URLs live ~1h; refetch comfortably inside that window.
    staleTime: 30 * 60_000,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("progress_photos")
        .select("id, storage_path, weight_kg, taken_at")
        .eq("user_id", userId!)
        .order("taken_at", { ascending: false })
      if (error) {
        console.error("Progress photos query failed:", error)
        throw error
      }
      return Promise.all(
        (data ?? []).map(async (r: any) => ({
          ...r,
          url: await signedPhotoUrl(supabase, r.storage_path),
        }))
      )
    },
  })
}

/** Upload a photo (+ optional bodyweight) and record it. */
export function useUploadProgressPhoto(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ file, weightKg }: { file: File; weightKg: number | null }) => {
      if (!userId) throw new Error("not authenticated")
      const supabase = createClient()
      const path = await uploadProgressPhoto(supabase, userId, file)
      const { error } = await supabase
        .from("progress_photos")
        .insert({ user_id: userId, storage_path: path, weight_kg: weightKg })
      // Don't leave an orphan file if the row insert fails.
      if (error) {
        await removeProgressPhoto(supabase, path)
        throw error
      }
    },
    onSuccess: () => {
      if (userId) qc.invalidateQueries({ queryKey: queryKeys.photos.list(userId) })
    },
  })
}

/** Delete a photo: remove the storage object, then the row. */
export function useDeleteProgressPhoto(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (photo: { id: string; storage_path: string }) => {
      const supabase = createClient()
      await removeProgressPhoto(supabase, photo.storage_path)
      const { error } = await supabase.from("progress_photos").delete().eq("id", photo.id)
      if (error) throw error
    },
    onSuccess: () => {
      if (userId) qc.invalidateQueries({ queryKey: queryKeys.photos.list(userId) })
    },
  })
}
