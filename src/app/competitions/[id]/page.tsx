import CompetitionDetailClient from "./client"

export function generateStaticParams() {
  return [{ id: "default" }]
}

export default function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <CompetitionDetailClient />
}
