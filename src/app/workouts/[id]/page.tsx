import WorkoutDetailClient from "./client"

export function generateStaticParams() {
  return [{ id: "default" }]
}

export default function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <WorkoutDetailClient />
}
