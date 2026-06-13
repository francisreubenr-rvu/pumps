"use client"

import { useEffect, useRef, useState } from "react"

interface HeroVideoProps {
  src: string
  poster: string
}

export function HeroVideo({ src, poster }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const onLoaded = () => setReady(true)
    const onError = () => setFailed(true)

    el.addEventListener("loadeddata", onLoaded)
    el.addEventListener("error", onError)

    el.play().catch(() => {
      // autoplay was blocked — still show the poster via CSS fallback
    })

    return () => {
      el.removeEventListener("loadeddata", onLoaded)
      el.removeEventListener("error", onError)
    }
  }, [])

  return (
    <>
      {/* Static poster — always visible as fallback */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${poster})`,
          backgroundSize: "cover", backgroundPosition: "center 30%",
          opacity: ready && !failed ? 0 : 0.5,
          transition: "opacity 800ms ease",
        }}
      />

      {/* Video layer — fades in over poster once loaded */}
      {!failed && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="hero-video"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            opacity: ready ? 0.52 : 0,
            transition: "opacity 1200ms ease",
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </>
  )
}
