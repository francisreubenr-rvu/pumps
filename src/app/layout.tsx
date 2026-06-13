import type { Metadata } from "next"
import { Saira, Teko } from "next/font/google"
import { ModeProvider } from "@/lib/mode-context"
import "./globals.css"

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
})

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Pumps — Gym Journaling",
  description: "Track workouts. Compete with friends. Dominate the leaderboard.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Pumps — Track. Compete. Dominate.",
    description: "The gym journal built for lifters who keep score.",
    siteName: "Pumps",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${saira.variable} ${teko.variable} dark h-full antialiased`} >
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#050505" />
        <link rel="preconnect" href="https://jchfbpzucylthmgthktj.supabase.co" />
      </head>
      <body className="min-h-full"><ModeProvider>{children}</ModeProvider></body>
    </html>
  )
}
