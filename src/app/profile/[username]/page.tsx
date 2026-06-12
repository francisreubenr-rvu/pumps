import ProfileClient from "./client"

export function generateStaticParams() {
  return [{ username: "default" }]
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  return <ProfileClient />
}
