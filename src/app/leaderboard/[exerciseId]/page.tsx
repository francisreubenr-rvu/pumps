import ExerciseLeaderboardClient from "./client"

export function generateStaticParams() {
  return [{ exerciseId: "default" }]
}

export default function ExerciseLeaderboardPage({ params }: { params: Promise<{ exerciseId: string }> }) {
  return <ExerciseLeaderboardClient />
}
