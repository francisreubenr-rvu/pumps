import { test, expect, describe } from "bun:test"
import {
  volumeOf,
  totalVolume,
  epley1RM,
  best1RM,
  weeklyVolume,
  dailyMaxWeight,
  dailyBest1RM,
  muscleFrequency,
  distinctExercises,
  currentStreak,
  acuteChronicRatio,
  readinessFromRatio,
  mealTotals,
} from "./metrics"

const DAY = 86_400_000
function dayOffset(n: number): Date {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  return new Date(d.getTime() + n * DAY)
}

describe("volumeOf", () => {
  test("reps × weight", () => expect(volumeOf(10, 100)).toBe(1000))
  test("null weight counts as 0", () => expect(volumeOf(10, null)).toBe(0))
  test("zero reps", () => expect(volumeOf(0, 100)).toBe(0))
})

describe("totalVolume", () => {
  test("sums all sets", () => {
    expect(totalVolume([{ reps: 10, weight_kg: 100 }, { reps: 5, weight_kg: 80 }])).toBe(1400)
  })
  test("empty → 0", () => expect(totalVolume([])).toBe(0))
  test("null weights ignored", () => {
    expect(totalVolume([{ reps: 10, weight_kg: null }, { reps: 5, weight_kg: 60 }])).toBe(300)
  })
})

describe("epley1RM", () => {
  test("single rep returns the weight", () => expect(epley1RM(100, 1)).toBe(100))
  test("Epley formula for multi-rep", () => expect(epley1RM(100, 10)).toBeCloseTo(133.33, 1))
  test("non-positive reps or weight → 0", () => {
    expect(epley1RM(100, 0)).toBe(0)
    expect(epley1RM(0, 5)).toBe(0)
  })
})

describe("best1RM", () => {
  test("picks the highest estimated 1RM across sets", () => {
    // 60×10 → 80; 100×3 → 110; 120×1 → 120
    const sets = [{ reps: 10, weight_kg: 60 }, { reps: 3, weight_kg: 100 }, { reps: 1, weight_kg: 120 }]
    expect(best1RM(sets)).toBe(120)
  })
  test("empty → 0", () => expect(best1RM([])).toBe(0))
})

describe("weeklyVolume", () => {
  test("buckets sets by ISO week, oldest→newest", () => {
    const sets = [
      { reps: 10, weight_kg: 100, date: "2026-01-05" }, // Mon
      { reps: 10, weight_kg: 100, date: "2026-01-07" }, // Wed (same week)
      { reps: 10, weight_kg: 50, date: "2026-01-14" }, // following week
    ]
    const out = weeklyVolume(sets)
    expect(out).toHaveLength(2)
    expect(out[0].volume).toBe(2000)
    expect(out[1].volume).toBe(500)
    // sorted ascending by week key
    expect(out[0].week < out[1].week).toBe(true)
  })
  test("limits to the last N weeks", () => {
    const sets = Array.from({ length: 12 }, (_, i) => ({
      reps: 1,
      weight_kg: 1,
      date: `2026-${String(1 + Math.floor(i / 4)).padStart(2, "0")}-${String(1 + (i % 4) * 7).padStart(2, "0")}`,
    }))
    expect(weeklyVolume(sets, 3).length).toBeLessThanOrEqual(3)
  })
  test("empty → []", () => expect(weeklyVolume([])).toEqual([]))
})

describe("dailyMaxWeight", () => {
  test("keeps the heaviest lift per (day, exercise)", () => {
    const sets = [
      { reps: 5, weight_kg: 100, date: "2026-01-05", exercise: "Bench Press" },
      { reps: 3, weight_kg: 110, date: "2026-01-05", exercise: "Bench Press" },
      { reps: 5, weight_kg: 90, date: "2026-01-05", exercise: "Squat" },
    ]
    const out = dailyMaxWeight(sets)
    const bench = out.find((r) => r.exercise === "Bench Press")
    expect(bench?.weight_kg).toBe(110)
    expect(out).toHaveLength(2)
  })
})

describe("dailyBest1RM", () => {
  test("keeps the best estimated 1RM per (day, exercise)", () => {
    const sets = [
      { reps: 5, weight_kg: 100, date: "2026-01-05", exercise: "Bench Press" }, // e1RM ~116.7
      { reps: 1, weight_kg: 120, date: "2026-01-05", exercise: "Bench Press" }, // e1RM 120 (best)
      { reps: 8, weight_kg: 90, date: "2026-01-12", exercise: "Bench Press" },
    ]
    const out = dailyBest1RM(sets)
    expect(out).toHaveLength(2)
    const first = out.find((r) => r.day === "2026-01-05")
    expect(first?.e1rm).toBe(120)
    // oldest → newest
    expect(out[0].day < out[1].day).toBe(true)
  })
  test("empty → []", () => expect(dailyBest1RM([])).toEqual([]))
})

describe("muscleFrequency", () => {
  test("counts sets per category, busiest first", () => {
    const sets = [
      { reps: 1, weight_kg: 1, date: "2026-01-01", category: "chest" },
      { reps: 1, weight_kg: 1, date: "2026-01-01", category: "chest" },
      { reps: 1, weight_kg: 1, date: "2026-01-01", category: "back" },
    ]
    const out = muscleFrequency(sets)
    expect(out[0]).toEqual({ category: "chest", sets: 2 })
    expect(out[1]).toEqual({ category: "back", sets: 1 })
  })
  test("empty → []", () => expect(muscleFrequency([])).toEqual([]))
})

describe("distinctExercises", () => {
  test("unique names, first-seen order", () => {
    const sets = [
      { reps: 1, weight_kg: 1, date: "2026-01-01", exercise: "Squat" },
      { reps: 1, weight_kg: 1, date: "2026-01-01", exercise: "Bench Press" },
      { reps: 1, weight_kg: 1, date: "2026-01-01", exercise: "Squat" },
    ]
    expect(distinctExercises(sets)).toEqual(["Squat", "Bench Press"])
  })
})

describe("currentStreak", () => {
  test("consecutive days ending today", () => {
    expect(currentStreak([dayOffset(0), dayOffset(-1), dayOffset(-2)])).toBe(3)
  })
  test("counts from yesterday when today is a rest day", () => {
    expect(currentStreak([dayOffset(-1), dayOffset(-2)])).toBe(2)
  })
  test("lapsed streak (gap >1 day) → 0", () => {
    expect(currentStreak([dayOffset(-3), dayOffset(-4)])).toBe(0)
  })
  test("duplicate same-day entries count once", () => {
    expect(currentStreak([dayOffset(0), dayOffset(0)])).toBe(1)
  })
  test("empty → 0", () => expect(currentStreak([])).toBe(0))
})

describe("acuteChronicRatio", () => {
  const NOW = new Date("2026-02-01T12:00:00Z")
  const at = (daysAgo: number) => new Date(NOW.getTime() - daysAgo * 86_400_000).toISOString()

  test("null ratio when there's no chronic history", () => {
    expect(acuteChronicRatio([], NOW).ratio).toBeNull()
  })
  test("steady load → ratio ~1", () => {
    // 100 volume once inside the 7d window (day 1) + once per prior week →
    // acute=100, chronic 28d=400, weekly=100, ratio=1. Days avoid the cutoffs.
    const sets = [1, 8, 15, 22].map(d => ({ reps: 1, weight_kg: 100, date: at(d) }))
    const { ratio } = acuteChronicRatio(sets, NOW)
    expect(ratio).toBeCloseTo(1, 5)
  })
  test("recent spike → ratio > 1.5", () => {
    // big acute load, little prior → high ratio
    const sets = [
      { reps: 1, weight_kg: 1000, date: at(1) },
      { reps: 1, weight_kg: 100, date: at(20) },
    ]
    expect(acuteChronicRatio(sets, NOW).ratio! > 1.5).toBe(true)
  })
})

describe("readinessFromRatio", () => {
  test("buckets", () => {
    expect(readinessFromRatio(null).tone).toBe("muted")
    expect(readinessFromRatio(0.5).label).toBe("Detraining")
    expect(readinessFromRatio(1.0).label).toBe("Optimal")
    expect(readinessFromRatio(1.4).label).toBe("Building")
    expect(readinessFromRatio(2.0).label).toBe("High load")
  })
})

describe("mealTotals", () => {
  test("sums calories and macros, null-safe", () => {
    const out = mealTotals([
      { calories: 500, protein_g: 40, carbs_g: 50, fat_g: 10 },
      { calories: 300, protein_g: null, carbs_g: 20, fat_g: null },
    ])
    expect(out).toEqual({ calories: 800, protein: 40, carbs: 70, fat: 10 })
  })
  test("empty → zeros", () => {
    expect(mealTotals([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  })
})
