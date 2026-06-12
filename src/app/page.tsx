import Link from "next/link"
import { Dumbbell, Trophy, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl shadow-orange-500/30">
          <Dumbbell className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-white">Pumps</h1>
        <p className="mt-4 text-xl text-zinc-400">Track workouts. Compete with friends. Dominate the leaderboard.</p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 backdrop-blur-sm">
            <Dumbbell className="mx-auto h-8 w-8 text-orange-500" />
            <h3 className="mt-3 font-semibold text-white">Log Workouts</h3>
            <p className="mt-1 text-sm text-zinc-400">Record sets, reps, and weights for any exercise.</p>
          </div>
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 backdrop-blur-sm">
            <Trophy className="mx-auto h-8 w-8 text-yellow-500" />
            <h3 className="mt-3 font-semibold text-white">Compete Live</h3>
            <p className="mt-1 text-sm text-zinc-400">Race friends in real-time on the same exercise.</p>
          </div>
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 backdrop-blur-sm">
            <TrendingUp className="mx-auto h-8 w-8 text-green-500" />
            <h3 className="mt-3 font-semibold text-white">Track Progress</h3>
            <p className="mt-1 text-sm text-zinc-400">Visualize strength gains with interactive charts.</p>
          </div>
        </div>

        <div className="mt-10">
          <Link href="/auth/login">
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 h-12 px-8 text-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
