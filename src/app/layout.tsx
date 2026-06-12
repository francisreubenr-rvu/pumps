import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { UserMenu } from "@/components/layout/user-menu"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Pumps — Gym Journaling",
  description: "Track workouts, compete with friends, and see your progress on the leaderboard.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100">
        <div className="flex min-h-full">
          <SidebarNav />
          <div className="flex flex-1 flex-col lg:pl-64">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur-sm lg:px-6">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                  <span className="text-sm font-bold text-white">P</span>
                </div>
                <span className="text-lg font-bold text-white">Pumps</span>
              </div>
              <div className="ml-auto">
                <UserMenu />
              </div>
            </header>
            <main className="flex-1 p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
