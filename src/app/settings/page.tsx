"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/queries/auth"
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useUsernameAvailable,
  toFormValue,
  numOrNull,
  strOrNull,
  sliderVal,
  type Profile,
} from "@/lib/queries/profile"
import { queryKeys } from "@/lib/queries/keys"
import { exportWorkoutsCsv, exportAllJson } from "@/lib/export"
import { PageShell, Card, SectionHeader } from "@/components/ui/kinetic"
import { Slider } from "@/components/ui/interactive"
import { Camera, Check } from "lucide-react"

type FormFields = {
  username: string
  display_name: string
  phone: string
  address: string
  age: string
  sex: string
  height_cm: string
  weight_kg: string
  body_fat_pct: string
  experience_level: string
  primary_goal: string
  bench_press_kg: string
  squat_kg: string
  deadlift_kg: string
  overhead_press_kg: string
}

const EMPTY_FORM: FormFields = {
  username: "",
  display_name: "",
  phone: "",
  address: "",
  age: "22",
  sex: "",
  height_cm: "175",
  weight_kg: "75",
  body_fat_pct: "",
  experience_level: "",
  primary_goal: "",
  bench_press_kg: "",
  squat_kg: "",
  deadlift_kg: "",
  overhead_press_kg: "",
}

function profileToForm(p: Profile): FormFields {
  return {
    username: toFormValue(p.username),
    display_name: toFormValue(p.display_name),
    phone: toFormValue(p.phone),
    address: toFormValue(p.address),
    age: toFormValue(p.age),
    sex: toFormValue(p.sex),
    height_cm: toFormValue(p.height_cm),
    weight_kg: toFormValue(p.weight_kg),
    body_fat_pct: toFormValue(p.body_fat_pct),
    experience_level: toFormValue(p.experience_level),
    primary_goal: toFormValue(p.primary_goal),
    bench_press_kg: toFormValue(p.bench_press_kg),
    squat_kg: toFormValue(p.squat_kg),
    deadlift_kg: toFormValue(p.deadlift_kg),
    overhead_press_kg: toFormValue(p.overhead_press_kg),
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const initializedRef = useRef(false)

  // ── Data ──────────────────────────────────────────────────
  const { data: user, isLoading: userLoading } = useUser()
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id)
  const updateProfile = useUpdateProfile(user?.id)
  const uploadAvatar = useUploadAvatar(user?.id)

  // ── Form state ────────────────────────────────────────────
  const [form, setForm] = useState<FormFields>(EMPTY_FORM)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Depends on form.username — must be after form declaration
  const usernameAvailable = useUsernameAvailable(form.username, user?.id)

  // ── Export state ──────────────────────────────────────────
  const [exporting, setExporting] = useState<"csv" | "json" | null>(null)
  const [exportError, setExportError] = useState("")

  // ── Init form from profile (once) ─────────────────────────
  useEffect(() => {
    if (profile && !initializedRef.current) {
      setForm(profileToForm(profile))
      initializedRef.current = true
    }
  }, [profile])

  function setField(key: keyof FormFields, value: string) {
    setForm((s) => ({ ...s, [key]: value }))
    setDirty(true)
    setSaved(false)
    setError("")
  }

  // ── Avatar ────────────────────────────────────────────────
  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    try {
      await uploadAvatar.mutateAsync(file)
    } catch (err) {
      console.error("Avatar upload failed:", err)
      setError("Failed to upload photo. Please try again.")
    }
    // Reset the input so the same file can be re-selected
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleRemoveAvatar() {
    if (!user?.id) return
    setError("")
    try {
      const supabase = createClient()
      // Fetch current avatar_url to extract the storage path for cleanup
      const { data: current } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single()

      if (current?.avatar_url) {
        const match = current.avatar_url.match(/avatars\/(.+)/)
        const oldPath = match?.[1]
        if (oldPath) {
          try {
            await supabase.storage.from("avatars").remove([oldPath])
          } catch { /* non-critical */ }
        }
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id)
      if (updateError) throw updateError

      // Invalidate so the profile refetches
      qc.invalidateQueries({ queryKey: queryKeys.profile.own(user.id) })
    } catch (err) {
      console.error("Avatar removal failed:", err)
      setError("Failed to remove photo.")
    }
  }

  // ── Save ──────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaved(false)

    if (!form.username || form.username.length < 3) {
      setError("Username must be at least 3 characters.")
      return
    }

    if (usernameAvailable.data === false && form.username !== profile?.username) {
      setError("That username is already taken.")
      return
    }

    try {
      await updateProfile.mutateAsync({
        username: form.username,
        display_name: strOrNull(form.display_name),
        phone: strOrNull(form.phone),
        address: strOrNull(form.address),
        age: numOrNull(form.age),
        sex: strOrNull(form.sex),
        height_cm: numOrNull(form.height_cm),
        weight_kg: numOrNull(form.weight_kg),
        body_fat_pct: numOrNull(form.body_fat_pct),
        experience_level: strOrNull(form.experience_level),
        primary_goal: strOrNull(form.primary_goal),
        bench_press_kg: numOrNull(form.bench_press_kg),
        squat_kg: numOrNull(form.squat_kg),
        deadlift_kg: numOrNull(form.deadlift_kg),
        overhead_press_kg: numOrNull(form.overhead_press_kg),
      })
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.")
    }
  }

  // ── Export ────────────────────────────────────────────────
  async function doExport(kind: "csv" | "json") {
    if (!user) return
    setExporting(kind)
    setExportError("")
    try {
      const supabase = createClient()
      if (kind === "csv") await exportWorkoutsCsv(supabase, user.id)
      else await exportAllJson(supabase, user.id)
    } catch {
      setExportError("Export failed. Please try again.")
    } finally {
      setExporting(null)
    }
  }

  // ── Auth gate / loading ───────────────────────────────────
  if (!userLoading && !user) {
    router.replace("/auth/login")
    return null
  }

  const isLoading = userLoading || profileLoading

  // ── Derived display values ────────────────────────────────
  const avatarUrl = profile?.avatar_url
  const initials = (form.username || "?").slice(0, 2).toUpperCase()
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—"

  return (
    <PageShell>
      <div className="page-container" style={{ maxWidth: 680, paddingBottom: 64 }}>
        {/* ── Page header ─────────────────────────────────── */}
        <div style={{ margin: "32px 0 28px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 5vw, 48px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: "var(--fg)",
              lineHeight: 1.05,
              marginBottom: 4,
            }}
          >
            Settings
          </h1>
          <p
            style={{
              fontFamily: "var(--font-heading-stack)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            Your profile, your data, your account
          </p>
        </div>

        {isLoading ? (
          <Card>
            <div style={{ padding: 48, textAlign: "center" }}>
              <p className="k-row-sub">Loading…</p>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSave}>
            {/* ── Avatar ────────────────────────────────── */}
            <Card>
              <SectionHeader title="Profile picture" />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 24,
                    background: "var(--surface-elevated)",
                    border: "2px solid var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                    boxShadow: "0 0 30px color-mix(in oklch, var(--accent) 18%, transparent)",
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: "var(--font-heading-stack)",
                        fontSize: 28,
                        fontWeight: 700,
                        color: "var(--accent)",
                      }}
                    >
                      {initials}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadAvatar.isPending}
                    className="btn-outline"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      padding: "9px 16px",
                    }}
                  >
                    <Camera size={14} aria-hidden="true" />
                    {uploadAvatar.isPending ? "Uploading…" : "Change photo"}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="btn-outline"
                      style={{
                        fontSize: 12,
                        padding: "7px 16px",
                        color: "var(--accent-red)",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </Card>

            {/* ── Identity ──────────────────────────────── */}
            <Card>
              <SectionHeader title="Identity" />

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Email (read-only) */}
                <div>
                  <label className="label-sm">EMAIL</label>
                  <p
                    style={{
                      fontFamily: "var(--font-heading-stack)",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--fg)",
                      marginTop: 4,
                    }}
                  >
                    {user?.email ?? "—"}
                  </p>
                </div>

                {/* Username with availability check */}
                <div>
                  <label htmlFor="s-username" className="label-sm">
                    USERNAME
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="s-username"
                      type="text"
                      required
                      minLength={3}
                      maxLength={30}
                      placeholder="your_gym_name"
                      value={form.username}
                      onChange={(e) => setField("username", e.target.value)}
                      className="input-field"
                      style={{ fontSize: 16, paddingRight: 100 }}
                    />
                    {form.username.length >= 3 &&
                      form.username !== profile?.username && (
                        <span
                          style={{
                            position: "absolute",
                            right: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontFamily: "var(--font-heading-stack)",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: usernameAvailable.isLoading
                              ? "var(--text-secondary)"
                              : usernameAvailable.data === true
                                ? "var(--success)"
                                : "var(--danger)",
                          }}
                        >
                          {usernameAvailable.isLoading
                            ? "Checking…"
                            : usernameAvailable.data === true
                              ? "Available"
                              : "Taken"}
                        </span>
                      )}
                  </div>
                </div>

                {/* Display name */}
                <div>
                  <label htmlFor="s-display-name" className="label-sm">
                    DISPLAY NAME
                  </label>
                  <input
                    id="s-display-name"
                    type="text"
                    maxLength={60}
                    placeholder="What we call you"
                    value={form.display_name}
                    onChange={(e) => setField("display_name", e.target.value)}
                    className="input-field"
                    style={{ fontSize: 16 }}
                  />
                </div>

                {/* Member since (read-only) */}
                <div>
                  <label className="label-sm">MEMBER SINCE</label>
                  <p
                    style={{
                      fontFamily: "var(--font-heading-stack)",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--fg)",
                      marginTop: 4,
                    }}
                  >
                    {memberSince}
                  </p>
                </div>
              </div>
            </Card>

            {/* ── Contact ────────────────────────────────── */}
            <Card>
              <SectionHeader title="Contact" />

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label htmlFor="s-phone" className="label-sm">
                    PHONE
                  </label>
                  <input
                    id="s-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    className="input-field"
                    style={{ fontSize: 16 }}
                  />
                </div>

                <div>
                  <label htmlFor="s-address" className="label-sm">
                    ADDRESS
                  </label>
                  <textarea
                    id="s-address"
                    rows={2}
                    placeholder="City, State"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    className="input-field"
                    style={{ fontSize: 16, resize: "vertical" }}
                  />
                </div>
              </div>
            </Card>

            {/* ── Body Metrics ───────────────────────────── */}
            <Card>
              <SectionHeader title="Body metrics" />

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <Slider
                  label="AGE"
                  unit="yrs"
                  min={13}
                  max={80}
                  step={1}
                  value={sliderVal(form.age, 22)}
                  onChange={(v) => setField("age", String(v))}
                />
                <Slider
                  label="HEIGHT"
                  unit="cm"
                  min={130}
                  max={220}
                  step={1}
                  value={sliderVal(form.height_cm, 175)}
                  onChange={(v) => setField("height_cm", String(v))}
                />
                <Slider
                  label="WEIGHT"
                  unit="kg"
                  min={30}
                  max={200}
                  step={0.5}
                  value={sliderVal(form.weight_kg, 75)}
                  onChange={(v) => setField("weight_kg", String(v))}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginTop: 18,
                }}
              >
                <div>
                  <label htmlFor="s-sex" className="label-sm">
                    SEX
                  </label>
                  <select
                    id="s-sex"
                    value={form.sex}
                    onChange={(e) => setField("sex", e.target.value)}
                    className="input-field"
                    style={{ fontSize: 16 }}
                  >
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="s-bf" className="label-sm">
                    BODY FAT %
                  </label>
                  <input
                    id="s-bf"
                    type="number"
                    inputMode="decimal"
                    placeholder="15"
                    value={form.body_fat_pct}
                    onChange={(e) => setField("body_fat_pct", e.target.value)}
                    className="input-field"
                    style={{ fontSize: 16 }}
                  />
                </div>
              </div>
            </Card>

            {/* ── Fitness Profile ────────────────────────── */}
            <Card>
              <SectionHeader title="Fitness profile" />

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <div>
                    <label htmlFor="s-exp" className="label-sm">
                      EXPERIENCE
                    </label>
                    <select
                      id="s-exp"
                      value={form.experience_level}
                      onChange={(e) => setField("experience_level", e.target.value)}
                      className="input-field"
                      style={{ fontSize: 16 }}
                    >
                      <option value="">—</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="s-goal" className="label-sm">
                      PRIMARY GOAL
                    </label>
                    <input
                      id="s-goal"
                      type="text"
                      maxLength={60}
                      placeholder="build muscle"
                      value={form.primary_goal}
                      onChange={(e) => setField("primary_goal", e.target.value)}
                      className="input-field"
                      style={{ fontSize: 16 }}
                    />
                  </div>
                </div>

                <div>
                  <span
                    className="label-sm"
                    style={{ display: "block", marginBottom: 4 }}
                  >
                    KNOWN 1-REP MAXES (KG)
                  </span>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}
                  >
                    {([
                        { id: "s-bench", label: "BENCH", key: "bench_press_kg" as const },
                        { id: "s-squat", label: "SQUAT", key: "squat_kg" as const },
                        { id: "s-dead", label: "DEADLIFT", key: "deadlift_kg" as const },
                        { id: "s-ohp", label: "OVERHEAD PRESS", key: "overhead_press_kg" as const },
                      ] as const).map(({ id, label, key }) => (
                      <div key={id}>
                        <label htmlFor={id} className="label-sm">
                          {label}
                        </label>
                        <input
                          id={id}
                          type="number"
                          inputMode="decimal"
                          placeholder="—"
                          value={form[key]}
                          onChange={(e) => setField(key, e.target.value)}
                          className="input-field"
                          style={{ fontSize: 16 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* ── Error / Save ──────────────────────────── */}
            {error && (
              <div
                role="alert"
                style={{
                  fontFamily: "var(--font-heading-stack)",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "10px 16px",
                  background: "var(--surface-elevated)",
                  color: "var(--danger)",
                  borderRadius: "var(--r-sm)",
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <button
                type="submit"
                disabled={updateProfile.isPending || !dirty}
                className="btn-primary btn-shine"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: "14px 0",
                  fontSize: 14,
                }}
              >
                {updateProfile.isPending ? "Saving…" : "Save Changes"}
              </button>
              {saved && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "var(--font-heading-stack)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--success)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Check size={14} aria-hidden="true" />
                  Saved
                </span>
              )}
            </div>

            {/* ── Data & Actions ────────────────────────── */}
            <Card>
              <SectionHeader title="Your data" />
              <p
                style={{
                  fontFamily: "var(--font-heading-stack)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  marginBottom: 14,
                }}
              >
                Export everything you&apos;ve logged — it&apos;s yours to keep.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 24,
                }}
              >
                <button
                  type="button"
                  onClick={() => doExport("csv")}
                  disabled={exporting !== null}
                  className="btn-outline"
                  style={{ fontSize: 12, padding: "10px 16px" }}
                >
                  {exporting === "csv" ? "Exporting…" : "Workouts (CSV)"}
                </button>
                <button
                  type="button"
                  onClick={() => doExport("json")}
                  disabled={exporting !== null}
                  className="btn-outline"
                  style={{ fontSize: 12, padding: "10px 16px" }}
                >
                  {exporting === "json" ? "Exporting…" : "Full export (JSON)"}
                </button>
              </div>
              {exportError && (
                <p
                  style={{
                    fontFamily: "var(--font-heading-stack)",
                    fontSize: 11,
                    color: "var(--danger)",
                    marginTop: 8,
                  }}
                >
                  {exportError}
                </p>
              )}

              <button
                type="button"
                onClick={async () => {
                  try {
                    await createClient().auth.signOut()
                  } catch {
                    /* ignore */
                  }
                  router.push("/auth/login")
                }}
                className="btn-primary"
                style={{
                  background: "var(--accent-red)",
                  width: "100%",
                  justifyContent: "center",
                  padding: "14px 0",
                }}
              >
                Sign Out
              </button>
            </Card>
          </form>
        )}
      </div>
    </PageShell>
  )
}
