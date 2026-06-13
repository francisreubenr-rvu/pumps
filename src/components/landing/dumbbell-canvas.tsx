"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float } from "@react-three/drei"
import * as THREE from "three"

/* ─── Dumbbell built entirely from primitives ─── */
function DumbbellModel({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  // Y axis stays constant — scroll only drives the X (tumble) and Z (barbell spin) axes.
  const targetRot = useRef({ x: 0, z: Math.PI / 2 })

  useFrame(() => {
    if (!groupRef.current) return
    // Primary tumble around X, secondary spin around Z (base Math.PI/2 keeps the bar horizontal).
    targetRot.current.x = progress * Math.PI * 3.5
    targetRot.current.z = Math.PI / 2 + progress * Math.PI * 2

    groupRef.current.rotation.x +=
      (targetRot.current.x - groupRef.current.rotation.x) * 0.06
    groupRef.current.rotation.z +=
      (targetRot.current.z - groupRef.current.rotation.z) * 0.06
    groupRef.current.rotation.y = 0 // locked — no vertical-axis spin
  })

  // Materials
  const chrome = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d4d4d4",
        metalness: 1.0,
        roughness: 0.04,
        envMapIntensity: 2.5,
      }),
    []
  )
  const iron = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#181818",
        metalness: 0.85,
        roughness: 0.35,
        envMapIntensity: 1.5,
      }),
    []
  )
  const collar = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#bdbdbd",
        metalness: 0.95,
        roughness: 0.08,
        envMapIntensity: 2.0,
      }),
    []
  )
  const accentMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ccff00",
        metalness: 0.3,
        roughness: 0.5,
        emissive: "#446600",
        emissiveIntensity: 0.3,
      }),
    []
  )

  // Plate configuration (per side) — [radius, thickness, zOffset]
  const plates: [number, number, number][] = [
    [0.54, 0.16, 1.52],
    [0.48, 0.13, 1.73],
    [0.41, 0.10, 1.90],
  ]

  const sides = [-1, 1]

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 2]}>

      {/* ── Central handle bar ── */}
      <mesh material={chrome} castShadow>
        <cylinderGeometry args={[0.056, 0.056, 3.4, 48]} />
      </mesh>

      {/* ── Knurling ridges on grip section ── */}
      {Array.from({ length: 22 }).map((_, i) => (
        <mesh
          key={`knurl-${i}`}
          position={[0, -1.05 + i * 0.1, 0]}
          rotation={[0, (i % 2) * 0.4, 0]}
          material={iron}
        >
          <torusGeometry args={[0.062, 0.006, 4, 20]} />
        </mesh>
      ))}

      {sides.map((s) => {
        const sign = s as 1 | -1
        return (
          <group key={`side-${s}`}>
            {/* ── Collar ── */}
            <mesh position={[0, sign * 1.3, 0]} material={collar} castShadow>
              <cylinderGeometry args={[0.10, 0.10, 0.14, 32]} />
            </mesh>

            {/* ── Collar accent ring ── */}
            <mesh position={[0, sign * 1.3, 0]} material={accentMat}>
              <torusGeometry args={[0.098, 0.009, 8, 32]} />
            </mesh>

            {/* ── Weight plates ── */}
            {plates.map(([r, t, z], pi) => (
              <group key={`plate-${pi}`} position={[0, sign * z, 0]}>
                {/* Plate body */}
                <mesh material={iron} castShadow>
                  <cylinderGeometry args={[r, r, t, 48]} />
                </mesh>
                {/* Outer rim highlight */}
                <mesh material={chrome}>
                  <torusGeometry args={[r * 0.97, 0.008, 6, 48]} />
                </mesh>
                {/* Centre hole ring */}
                <mesh material={collar}>
                  <torusGeometry args={[0.072, 0.012, 8, 32]} />
                </mesh>
              </group>
            ))}

            {/* ── End cap ── */}
            <mesh position={[0, sign * 2.08, 0]} material={collar} castShadow>
              <cylinderGeometry args={[0.10, 0.10, 0.10, 32]} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/* ─── Lighting ─── */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.15} />
      {/* Key — warm top-right */}
      <pointLight position={[4, 6, 3]}  intensity={60} color="#fffbe8" castShadow />
      {/* Fill — cool left */}
      <pointLight position={[-5, 3, 2]} intensity={18} color="#aab4ff" />
      {/* Rim — accent green from below-back */}
      <pointLight position={[0, -4, -4]} intensity={30} color="#ccff00" />
      {/* Top fill */}
      <directionalLight position={[0, 10, 5]} intensity={0.5} color="#ffffff" />
    </>
  )
}

/* ─── Scroll text overlay ─── */
function textOpacity(progress: number, inAt: number, outAt: number) {
  if (progress < inAt) return 0
  if (progress < inAt + 0.08) return (progress - inAt) / 0.08
  if (progress < outAt) return 1
  if (progress < outAt + 0.08) return 1 - (progress - outAt) / 0.08
  return 0
}

/* ─── Exported scene ─── */
interface DumbbellCanvasProps {
  progress: number
}

export function DumbbellCanvas({ progress }: DumbbellCanvasProps) {
  const messages = [
    { text: "TRACK.", sub: "Every rep. Every set. Every PR.", inAt: 0.15, outAt: 0.42 },
    { text: "COMPETE.", sub: "Live duels. Real-time boards.", inAt: 0.45, outAt: 0.70 },
    { text: "DOMINATE.", sub: "Own the leaderboard.", inAt: 0.73, outAt: 1.0 },
  ]

  const heroOpacity = progress < 0.08 ? 1 : progress < 0.15 ? 1 - (progress - 0.08) / 0.07 : 0

  // Dumbbell smoothly vanishes as the scroll approaches the bottom of the section,
  // so it never sits frozen — it shrinks + fades out right as DOMINATE lands.
  const sceneFade = progress > 0.86 ? Math.max(0, 1 - (progress - 0.86) / 0.14) : 1

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Three.js canvas — fades + scales down toward the end of the scroll */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: sceneFade,
        transform: `scale(${0.92 + sceneFade * 0.08})`,
        transition: "opacity 120ms linear, transform 120ms linear",
        willChange: "opacity, transform",
      }}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 40 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}
          dpr={[1, 2]}
          style={{ background: "transparent" }}
          shadows
        >
          <Lighting />
          <Environment preset="studio" environmentIntensity={0.4} />
          <Float
            speed={1.4}
            rotationIntensity={0}
            floatIntensity={progress < 0.05 ? 0.6 : 0}
          >
            <DumbbellModel progress={progress} />
          </Float>
        </Canvas>
      </div>

      {/* Hero title — fades out as scroll begins */}
      <div
        aria-hidden={heroOpacity === 0}
        style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          pointerEvents: "none", userSelect: "none",
          opacity: heroOpacity,
          transition: "opacity 200ms ease",
          paddingTop: "42%",  // push below dumbbell
        }}
      >
        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(11px, 1.6vw, 16px)",
          fontWeight: 500,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: 6,
        }}>
          SCROLL TO EXPLORE
        </p>
      </div>

      {/* Scroll-driven messages */}
      {messages.map((m, i) => {
        const op = textOpacity(progress, m.inAt, m.outAt)
        const ty = op < 1 ? `translateY(${(1 - op) * 20}px)` : "translateY(0)"
        return (
          <div
            key={i}
            aria-hidden={op === 0}
            style={{
              position: "absolute",
              bottom: "clamp(60px, 10vh, 100px)",
              left: 0, right: 0,
              textAlign: "center",
              pointerEvents: "none",
              userSelect: "none",
              opacity: op,
              transform: ty,
              transition: "opacity 80ms, transform 80ms",
            }}
          >
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(52px, 9vw, 96px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              lineHeight: 1,
              margin: 0,
              background: "linear-gradient(135deg, #f5f5f7 30%, var(--accent) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {m.text}
            </h2>
            <p style={{
              fontFamily: "var(--font-heading-stack)",
              fontSize: "clamp(12px, 1.6vw, 16px)",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              marginTop: 10,
            }}>
              {m.sub}
            </p>
          </div>
        )
      })}
    </div>
  )
}
