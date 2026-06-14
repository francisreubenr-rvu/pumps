"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AppNav } from "@/components/layout/nav"
import { ExternalLink } from "lucide-react"

type Playlist = {
  title: string
  vibe: string
  listId: string
  search: string
  // Representative video for the mix — used to render real YouTube artwork as the
  // card thumbnail (img.youtube.com/vi/<videoId>/hqdefault.jpg). A playlist ID
  // alone has no thumbnail endpoint, so each mix carries a poster video id.
  videoId: string
}

// Curated public YouTube playlists for gym / training motivation.
// `listId` is a public playlist ID embedded via the privacy-friendly nocookie host.
// `search` powers the "Open on YouTube" fallback button beneath each embed.
const PLAYLISTS: Playlist[] = [
  {
    title: "Gym Phonk — Aggressive Workout",
    vibe: "Hardcore",
    listId: "PLfP6i5T0vCF_DKaVc6Bz3DC54M9eo3-uF",
    search: "phonk gym workout motivation mix",
    videoId: "RVHGN0V4ECk",
  },
  {
    title: "Rap & Hip-Hop Workout Hype",
    vibe: "Hype / Rap",
    listId: "PLF4yhAuJ3l5Ks7KZ_K3DxDvqQ8x-XO0gE",
    search: "rap hip hop gym workout playlist",
    videoId: "0_jU5If0Ujg",
  },
  {
    title: "Hard Rock & Metal Lifting",
    vibe: "Heavy / Metal",
    listId: "PLk0nzEPzg2c-CmdG_8RB8t_F2J3w0bN3o",
    search: "rock metal gym workout motivation playlist",
    videoId: "CD-E-LDc384",
  },
  {
    title: "EDM Pump-Up Energy",
    vibe: "Electronic / Hype",
    listId: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5",
    search: "edm workout gym energy mix",
    videoId: "fLexgOxsZu0",
  },
  {
    title: "Lo-Fi Grind Focus",
    vibe: "Lo-fi grind",
    listId: "PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo",
    search: "lofi hip hop study workout focus playlist",
    videoId: "jfKfPfyJRdk",
  },
  {
    title: "Calm Focus Deep Work",
    vibe: "Calm focus",
    listId: "PLRBp0Fe2GpgmsW46rJyudVFlY6IYjFnIY",
    search: "deep focus calm study music playlist",
    videoId: "lTRiuFIWV54",
  },
  {
    title: "Trap & Bass Workout Bangers",
    vibe: "Trap / Bass",
    listId: "PLAgRwfDEcmcoILDFmZd-iQ7g-Df-4Gf0H",
    search: "trap bass workout gym motivation mix",
    videoId: "5dmQ3QWpy1Q",
  },
  {
    title: "Top Hits Cardio Mix",
    vibe: "Pop / Cardio",
    listId: "PLFgquLnL59alW3xmYiWRaoz0oM3H17Lth",
    search: "top hits pop cardio workout playlist",
    videoId: "gCYcHz2k5x0",
  },
]

export default function PlaylistsPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/auth/login")
    })
  }, [router])

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <AppNav />
      <main className="page-container" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: "var(--fg)",
              lineHeight: 1,
            }}
          >
            Playlists
          </h1>
          <p
            style={{
              fontFamily: "var(--font-heading-stack)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginTop: 4,
            }}
          >
            Motivational Gym Mixes
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {PLAYLISTS.map((p) => (
            <div key={p.listId} className="card-surface" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* 16:9 responsive embed wrapper */}
              <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "var(--surface)" }}>
                {/* Real YouTube artwork shown behind the lazy iframe so the card
                    never displays an empty grey thumbnail before/while it loads. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${p.videoId}/hqdefault.jpg`}
                  alt={`${p.title} — playlist artwork`}
                  loading="lazy"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
                <iframe
                  title={`${p.title} — YouTube playlist`}
                  src={`https://www.youtube-nocookie.com/embed/videoseries?list=${p.listId}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                />
              </div>

              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-heading-stack)",
                      fontSize: 15,
                      fontWeight: 700,
                      letterSpacing: "0.01em",
                      textTransform: "uppercase",
                      color: "var(--fg)",
                      lineHeight: 1.2,
                    }}
                  >
                    {p.title}
                  </h2>
                  <span
                    className="label-sm"
                    style={{
                      display: "inline-block",
                      marginTop: 8,
                      padding: "3px 8px",
                      border: "1px solid var(--accent)",
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    {p.vibe}
                  </span>
                </div>

                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(p.search)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{
                    marginTop: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 11,
                    padding: "10px 14px",
                  }}
                >
                  <ExternalLink size={12} aria-hidden="true" /> Open on YouTube
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
