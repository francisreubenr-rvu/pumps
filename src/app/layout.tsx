import type { Metadata } from "next"
import { Barlow, Barlow_Condensed, Space_Mono } from "next/font/google"
import "./globals.css"

const barlowCondensed = Barlow_Condensed({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "Pumps — Gym Journaling",
  description: "Track workouts. Compete with friends. Dominate the leaderboard.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${barlow.variable} ${spaceMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full relative">
        {/* Ambient muscle-group blobs — from Fox */}
        <div className="blob-bg" aria-hidden="true">
          <div className="blob blob-push" />
          <div className="blob blob-pull" />
          <div className="blob blob-legs" />
          <div className="blob blob-core" />
        </div>
        <div className="grain" aria-hidden="true" />
        <div className="relative z-10 min-h-full">{children}</div>
      </body>
    </html>
  )
}
