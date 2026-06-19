import type { SupabaseClient } from "@supabase/supabase-js"

const BUCKET = "progress-photos"

/** Upload a progress photo under the user's folder; returns the object path. */
export async function uploadProgressPhoto(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  })
  if (error) throw error
  return path
}

/** Short-lived signed URL for a private photo (default 1h). Null on failure. */
export async function signedPhotoUrl(
  supabase: SupabaseClient,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn)
  if (error) return null
  return data?.signedUrl ?? null
}

/** Remove a photo object from storage. */
export async function removeProgressPhoto(supabase: SupabaseClient, path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path])
}

// ── Avatars ────────────────────────────────────────────────────────────

const AVATAR_BUCKET = "avatars"

/** Upload an avatar image under the user's folder; returns the storage path. */
export async function uploadAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  })
  if (error) throw error
  return path
}

/** Remove an avatar object from storage. */
export async function removeAvatar(
  supabase: SupabaseClient,
  path: string,
): Promise<void> {
  await supabase.storage.from(AVATAR_BUCKET).remove([path])
}
