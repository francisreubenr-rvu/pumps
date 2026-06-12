import type { Metadata } from "next"
import { Saira, Teko } from "next/font/google"
import "./globals.css"

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Pumps — Track. Compete. Dominate.",
  description: "The gym journal built for lifters who keep score.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${saira.variable} ${teko.variable} dark h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
