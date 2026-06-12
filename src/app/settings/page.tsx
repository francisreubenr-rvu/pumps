import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  async function signOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400">Manage your account</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">Profile</CardTitle>
          <CardDescription className="text-zinc-400">Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm text-zinc-500">Email</span>
            <p className="text-white">{user.email}</p>
          </div>
          <div>
            <span className="text-sm text-zinc-500">Username</span>
            <p className="text-white">{profile?.username ?? "Not set"}</p>
          </div>
          <div>
            <span className="text-sm text-zinc-500">Joined</span>
            <p className="text-white">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <Button formAction={signOut} type="submit" variant="destructive" className="w-full">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
