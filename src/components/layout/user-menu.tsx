"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"

export function UserMenu() {
  const [email, setEmail] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "")
      }
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const meta = data.session.user.user_metadata
        setAvatarUrl(meta.avatar_url ?? "")
        setUsername(meta.username ?? meta.full_name ?? "")
      }
    })
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const initials = username?.slice(0, 2).toUpperCase() || email?.slice(0, 2).toUpperCase() || "?"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent hover:bg-zinc-800 focus:outline-none">
        <Avatar className="h-9 w-9">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{username || "User"}</p>
            <p className="text-xs text-zinc-500">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/profile/${username}`)}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
