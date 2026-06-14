import type { Metadata, Viewport } from "next"
import { Saira, Teko } from "next/font/google"
import { ModeProvider } from "@/lib/mode-context"
import { QueryProvider } from "@/lib/query-provider"
import { ThemeEnvironment } from "@/components/theme/theme-environment"
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
  // `template` applies to child route segments (each route's layout.tsx sets a
  // plain `title` that gets composed as "<route> · Pumps"). `default` is used for
  // routes that don't set their own title.
  title: {
    template: "%s · Pumps",
    default: "Pumps — Gym Journaling",
  },
  description: "Track workouts. Compete with friends. Dominate the leaderboard.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Pumps — Track. Compete. Dominate.",
    description: "The gym journal built for lifters who keep score.",
    siteName: "Pumps",
  },
}

// Next 16: themeColor / colorScheme / viewport belong in the `viewport` export,
// not hand-rolled <meta> tags. theme-color matches the real --bg (#08090B).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#08090B",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${saira.variable} ${teko.variable} dark h-full antialiased`} >
      <head>
        <link rel="preconnect" href="https://jchfbpzucylthmgthktj.supabase.co" />
      </head>
      <body className="min-h-full">
        <script
          // No-FOUC: synchronously apply the stored mode class to <body> before
          // first paint, so the correct CSS variables (--bg, --accent, etc.) are
          // in effect on the very first render instead of flashing the default theme.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem("kinetic_mode");var allowed=["monk","revenge","winter","happy"];var b=document.body;b.classList.remove("mode-monk","mode-revenge","mode-winter","mode-happy");if(allowed.indexOf(m)!==-1){b.classList.add("mode-"+m);}}catch(e){}})();`,
          }}
        />
        <QueryProvider>
          <ModeProvider><ThemeEnvironment />{children}</ModeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
