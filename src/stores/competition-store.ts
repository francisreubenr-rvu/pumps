import { create } from "zustand"

interface CompetitionState {
  competitionId: string | null
  userId: string | null
  isActive: boolean
  logs: { userId: string; setNumber: number; reps: number; weight: number; timestamp: string }[]
  setCompetition: (id: string, userId: string) => void
  addLog: (log: { userId: string; setNumber: number; reps: number; weight: number; timestamp: string }) => void
  setActive: (active: boolean) => void
  reset: () => void
}

export const useCompetitionStore = create<CompetitionState>((set) => ({
  competitionId: null,
  userId: null,
  isActive: false,
  logs: [],
  setCompetition: (id, userId) => set({ competitionId: id, userId }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  setActive: (active) => set({ isActive: active }),
  reset: () => set({ competitionId: null, userId: null, isActive: false, logs: [] }),
}))
