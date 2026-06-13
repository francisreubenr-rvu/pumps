import CompetitionDetailClient from "./client"

export default function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <CompetitionDetailClient />
}
