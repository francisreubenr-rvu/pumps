import ExerciseLeaderboardClient from "./client"

export default function ExerciseLeaderboardPage({ params }: { params: Promise<{ exerciseId: string }> }) {
  return <ExerciseLeaderboardClient />
}
