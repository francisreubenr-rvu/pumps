"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, Trash2, ImageOff } from "lucide-react"
import { useUser } from "@/lib/queries/auth"
import {
  useProgressPhotos,
  useUploadProgressPhoto,
  useDeleteProgressPhoto,
  type ProgressPhoto,
} from "@/lib/queries/photos"
import { PageShell, PageTitle, Card, EmptyState } from "@/components/ui/kinetic"

export default function PhotosPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [weight, setWeight] = useState("")
  const [error, setError] = useState("")

  const { data: user, isLoading: userLoading } = useUser()
  const { data: photos = [], isPending } = useProgressPhotos(user?.id)
  const upload = useUploadProgressPhoto(user?.id)
  const del = useDeleteProgressPhoto(user?.id)

  useEffect(() => {
    if (!userLoading && !user) router.replace("/auth/login")
  }, [userLoading, user, router])

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // let the same file be chosen again
    if (!file) return
    if (!file.type.startsWith("image/")) { setError("Please choose an image."); return }
    if (file.size > 8 * 1024 * 1024) { setError("Image too large (max 8MB)."); return }
    setError("")
    try {
      await upload.mutateAsync({ file, weightKg: weight ? Number(weight) : null })
      setWeight("")
    } catch (err) {
      console.error("Photo upload failed:", err)
      setError("Upload failed. Please try again.")
    }
  }

  async function onDelete(photo: ProgressPhoto) {
    if (!window.confirm("Delete this photo? This can't be undone.")) return
    try {
      await del.mutateAsync({ id: photo.id, storage_path: photo.storage_path })
    } catch (err) {
      console.error("Photo delete failed:", err)
    }
  }

  const loading = userLoading || (!!user && isPending)

  return (
    <PageShell>
      <PageTitle title="Progress photos" eyebrow="See the change" />

      {/* Upload */}
      <Card className="k-section" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <input
          type="number"
          inputMode="decimal"
          placeholder="Bodyweight kg (optional)"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          className="input-field"
          style={{ width: 220, padding: "10px 12px", fontSize: 13 }}
        />
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={upload.isPending}
          className="btn-primary"
          style={{ gap: 8 }}
        >
          <Camera size={14} aria-hidden="true" /> {upload.isPending ? "Uploading…" : "Add photo"}
        </button>
        {error && <span className="k-row-sub" style={{ color: "var(--danger)" }}>{error}</span>}
      </Card>

      {/* Gallery */}
      {photos.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 2 }}>
          {photos.map(p => (
            <Card key={p.id} padded={false} style={{ overflow: "hidden", position: "relative" }}>
              <div style={{ position: "relative", aspectRatio: "3 / 4", background: "var(--surface-elevated)" }}>
                {p.url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, not a static asset
                  <img src={p.url} alt={`Progress photo from ${new Date(p.taken_at).toLocaleDateString()}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                    <ImageOff size={20} aria-label="Image unavailable" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(p)}
                  aria-label="Delete photo"
                  style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "var(--r-pill)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "color-mix(in oklch, var(--bg) 70%, transparent)", color: "var(--fg)", backdropFilter: "blur(8px)" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span className="k-row-sub">{new Date(p.taken_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                {p.weight_kg != null && <span className="k-row-title" style={{ fontSize: 13 }}>{p.weight_kg} kg</span>}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message={loading ? "Loading…" : "No photos yet — add your first to track visible progress."} />
      )}
    </PageShell>
  )
}
