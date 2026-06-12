import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dumbbell } from "lucide-react"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single()

  if (profile?.username) redirect("/dashboard")

  async function setUsername(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/auth/login")

    const username = formData.get("username") as string
    if (!username || username.length < 3) return

    await supabase.from("profiles").update({ username }).eq("id", user.id)
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome to Pumps</h1>
          <p className="mt-2 text-zinc-400">Choose your username to get started</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-zinc-300">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="your_gym_name"
              minLength={3}
              maxLength={30}
              required
              className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
            />
          </div>
          <Button
            formAction={setUsername}
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
          >
            Let&apos;s Go
          </Button>
        </form>
      </div>
    </div>
  )
}
