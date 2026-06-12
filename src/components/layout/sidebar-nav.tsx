"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Dumbbell,
  LayoutDashboard,
  ListTodo,
  Trophy,
  Swords,
  TrendingUp,
  Library,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workouts", label: "Workouts", icon: ListTodo },
  { href: "/exercises", label: "Exercises", icon: Library },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/competitions", label: "Competitions", icon: Swords },
  { href: "/progress", label: "Progress", icon: TrendingUp },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 border-r border-zinc-800 bg-zinc-950 lg:block">
      <div className="flex h-full flex-col">
        <Link href="/dashboard" className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Pumps</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-zinc-800 p-4">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            )}
          >
            Settings
          </Link>
        </div>
      </div>
    </aside>
  )
}
