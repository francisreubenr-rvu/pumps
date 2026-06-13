"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export type Mode = "default" | "monk" | "revenge" | "winter" | "happy"

const STORAGE_KEY = "kinetic_mode"

const MODE_META: Record<Mode, { label: string; tagline: string; description: string; color: string }> = {
  default: { label: "STANDARD", tagline: "OVERVIEW", description: "Default training mode.", color: "oklch(0.85 0.22 130)" },
  monk:    { label: "MONK MODE", tagline: "DISCIPLINE IS FREEDOM", description: "Zero distractions. Pure focus.", color: "oklch(0.55 0.12 275)" },
  revenge: { label: "REVENGE ARC", tagline: "THEY DOUBTED YOU. REMEMBER THAT.", description: "Train with something to prove.", color: "oklch(0.60 0.25 25)" },
  winter:  { label: "WINTER ARC", tagline: "THE GRIND DOESN'T STOP", description: "Off-season. No excuses.", color: "oklch(0.80 0.05 240)" },
  happy:   { label: "HAPPY ARC", tagline: "ENJOY THE JOURNEY", description: "Train for joy. Progress is the reward.", color: "oklch(0.85 0.20 80)" },
}

export const JOURNAL_PROMPTS: Record<Mode, string> = {
  default: "How did your training feel today?",
  monk:    "What did you sacrifice for your goals today?",
  revenge: "Who or what are you training harder than today?",
  winter:  "How did you push through the cold today?",
  happy:   "What made you proud about today's session?",
}

const ModeContext = createContext<{
  mode: Mode
  setMode: (m: Mode) => Promise<void>
  meta: typeof MODE_META
}>({
  mode: "default",
  setMode: async () => {},
  meta: MODE_META,
})

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("default")

  // Read from localStorage on mount and apply body class
  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null) as Mode | null
    if (stored && stored in MODE_META) {
      setModeState(stored)
      applyBodyClass(stored)
    }
  }, [])

  async function setMode(newMode: Mode) {
    setModeState(newMode)
    applyBodyClass(newMode)
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newMode)
    }
    // Persist to Supabase (best-effort)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("user_modes").upsert({ user_id: user.id, mode: newMode })
      }
    } catch {
      // non-critical
    }
  }

  return (
    <ModeContext.Provider value={{ mode, setMode, meta: MODE_META }}>
      {children}
    </ModeContext.Provider>
  )
}

function applyBodyClass(mode: Mode) {
  if (typeof document === "undefined") return
  document.body.classList.remove("mode-monk", "mode-revenge", "mode-winter", "mode-happy")
  if (mode !== "default") {
    document.body.classList.add(`mode-${mode}`)
  }
}

export function useMode() {
  return useContext(ModeContext)
}

export { MODE_META }
