import WorkoutDetailClient from "./client"

export default function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <WorkoutDetailClient />
}
