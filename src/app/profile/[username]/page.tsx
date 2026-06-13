import ProfileClient from "./client"

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  return <ProfileClient />
}
