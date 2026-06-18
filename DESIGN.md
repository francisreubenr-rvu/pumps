# PUMPS — DESIGN.md

Design language for the PUMPS / KINETIC rebuild, distilled from 6 reference UIs
(NUORBIT, Verdant, AgentAI, S'Watch, Stoicism + one Pinterest pin) and mapped
onto the **existing** token system. Nothing here throws away the current
foundation — it extends it. Lime-on-near-black is already our identity (Verdant
confirms it), so this is about *framing, depth, glow, motion, and type drama*.

> Hard rule: **reuse existing tokens & primitives**. New work composes
> `globals.css` vars + `kinetic.tsx` / `motion.tsx` / `interactive.tsx`. Do not
> hardcode hex or duplicate primitives.

---

## 1. Aesthetic Direction

**"Underground iron, premium glass, kinetic glow."**
Near-black depth · surgical lime accent · glassmorphic surfaces that *glow from
within* · oversized confident type · cinematic framing (rings, orbits, numbered
rails) · motion that feels weighted and intentional.

Mode system stays: every new surface must read across monk/revenge/winter/happy
because it cascades from `--accent` / `--bg`.

---

## 2. Color & Light

Keep all current tokens (`--bg #08090B`, `--fg #F4F5F6`, `--accent #CCFF00`,
`--accent-red`, `--accent-blue`, semantic set, surfaces, radii). **Add a glow
layer** — the single biggest visual upgrade from the refs (Verdant/NUORBIT/AgentAI
all glow):

```
--glow-accent:  0 0 40px color-mix(in oklch, var(--accent) 35%, transparent);
--glow-soft:    0 0 80px color-mix(in oklch, var(--accent) 18%, transparent);
--ring-glow:    drop-shadow(0 0 24px color-mix(in oklch, var(--accent) 45%, transparent));
--glass:        rgba(255,255,255,0.04);
--glass-brd:    color-mix(in oklch, var(--accent) 14%, rgba(255,255,255,0.08));
```

Imagery: swap nature/jellyfish refs for **iron/chalk/barbell** photography (already
in `/public/images`), always behind a `radial-gradient` accent wash + dark scrim.

---

## 3. Typography

Saira (sans) + Teko (display) stay. **Add one elegant accent face** for emphasis
words — the Verdant italic *"grows"* / Stoicism serif move. Proposed: a serif
italic via `next/font` (e.g. **Newsreader** or **Fraunces**) exposed as
`--font-accent`, used *only* on 1–2 emphasis words per hero/section.

Type drama from refs:
- **Letter-spaced wordmark** (NUORBIT `N U O R B I T`): `.k-wordmark` — Teko/Saira, `letter-spacing: 0.18em–0.34em`, clamp huge.
- **Keyword highlighting** (AgentAI): `.k-hl` wraps a word in `--accent` (or serif-italic) inside an otherwise plain large statement.
- **Numbered index** (S'Watch `01 02 03 04`): tabular Teko, active one accent + struck rule.

---

## 4. Component Catalog

Each entry: **ref → PUMPS adaptation → where → motion**. Items marked `NEW`
become files; others extend existing primitives.

| # | Component | Ref | PUMPS use | Motion | Owner file |
|---|-----------|-----|-----------|--------|-----------|
| C1 | `GlowRing` `NEW` | NUORBIT portal | Hero: rotating glow ring framing wordmark / a lifter silhouette | slow rotate + breathe; reduced-motion static | `components/landing/glow-ring.tsx` |
| C2 | `StatBar` `NEW` | NUORBIT / AgentAI | Landing hero stat strip + reuse on dashboard | count-up (reuse `AnimatedNumber`) on reveal | `components/ui/stat-bar.tsx` |
| C3 | `GlassFeatureCard` `NEW` | Verdant | Features grid: glow icon + body, optional inner viz | spotlight (reuse `SpotlightCard`) + reveal | `components/landing/glass-feature-card.tsx` |
| C4 | `NodeDiagram` / `GlowChart` / `Radar` `NEW` | Verdant card internals | Inner art for 3 feature cards | path draw-in on reveal | `components/landing/feature-visuals.tsx` |
| C5 | `Statement` `NEW` | AgentAI | Big paragraph with `<Hl>` accent keywords | word-by-word reveal (stagger) | `components/ui/statement.tsx` |
| C6 | `NumberedSteps` `NEW` | S'Watch index | Onboarding stepper + "How it works" | active slide indicator | `components/ui/numbered-steps.tsx` |
| C7 | `OrbitNav` `NEW` | Stoicism orbit | Modes page: arrange 5 modes on an arc | hover lift; active glow | `components/modes/orbit.tsx` |
| C8 | `Testimonial` `NEW` | AgentAI | Landing social proof | reveal + quote mark | `components/landing/testimonial.tsx` |
| C9 | `PillNav` (extend) | Verdant | Landing top nav → floating glass pill | shrink-on-scroll | `app/page.tsx` nav block |
| C10 | `RailLabel` `NEW` | Stoicism/S'Watch | Rotated section labels on page edges | fade-in | `components/ui/rail-label.tsx` |
| C11 | Wordmark + Hl utils | NUORBIT/AgentAI | `.k-wordmark`, `<Hl>` | — | `globals.css` + `statement.tsx` |

Existing primitives already cover: tabs (`SegmentedTabs`), reveals (`Reveal`/`Stagger`),
sliders (`Slider`), spotlight (`SpotlightCard`), shine button (`.btn-shine`),
skeletons, marquee, hero-aurora.

---

## 5. Motion Language

- Curve: `--ease-expo` for entrances, `--ease-apple` for ambient loops.
- Entrances: `Reveal` variants (up/scale/blur/directional) — vary per section.
- Ambient: glow ring rotate (20–30s), aurora drift, marquee — all paused under `prefers-reduced-motion`.
- Hover: spotlight glow, shine sweep, lift `translateY(-2px)`.
- Page→page: `.page-container`/`.k-enter` fade-lift (already global).
- Hero choreography: aurora → wordmark (up) → ring (scale/draw) → sub (up) → stat bar (count-up) → CTA (up), staggered 100–150ms.
- **Budget:** no WebGL, no framer-motion. CSS transforms/opacity/filter + IntersectionObserver only. Respect reduced-motion everywhere.

---

## 6. Page Briefs (creative)

- **Landing hero:** near-black + accent aurora; `GlowRing` behind a letter-spaced `PUMPS` wordmark; one serif-italic emphasis word in the sub; `StatBar` (PRs logged / lifters / live comps); shine CTA. Rail labels on edges.
- **Onboarding:** `NumberedSteps` rail (01 Identity · 02 Body · 03 Lifts · 04 Mode); each step a glass card; existing `Slider`s for body metrics; final step = mode pick (mini `OrbitNav`); celebratory glow on save.
- **Features:** 3 `GlassFeatureCard`s with `NodeDiagram` / `GlowChart` / `Radar` internals (Verdant).
- **Modes:** `OrbitNav` arc of 5 modes, each glowing in its own color.
- **Statement band:** AgentAI-style big sentence with accent keywords.
- **Social proof:** `Testimonial` + trust marquee.

---

## 7. Implementation Partition (zero-overlap parallelism)

**Foundation first (single-threaded, owner = main):** glow/glass tokens + `--font-accent`
wiring in `layout.tsx` + base classes (`.k-wordmark`, `.k-glass`, `.k-rail`,
`.glow-ring`, `.k-hl`) in `globals.css`. Everything below builds on these.

Then fan out — **each agent owns ONE new file, no shared writes:**
- A: `glow-ring.tsx` (C1)
- B: `stat-bar.tsx` (C2)
- C: `glass-feature-card.tsx` + `feature-visuals.tsx` (C3,C4)
- D: `statement.tsx` + `<Hl>` (C5)
- E: `numbered-steps.tsx` (C6)
- F: `testimonial.tsx` (C8) + `rail-label.tsx` (C10)
- G: `orbit.tsx` (C7)

Page wiring (`app/page.tsx`, `onboarding`, `modes`) is done by main **after**
components land, to avoid two writers on one page file. CSS lives only in the
foundation pass — components consume classes, never append to `globals.css`.

---

## 7b. Review decisions (self-reviewed — parallel agents were unavailable)

**Feasibility**
- `--glass` is just the existing `.card-surface` bg — don't add a token; reuse `.card-surface`/`.card-elevated`. Keep only the genuinely-new **glow** tokens.
- `StatBar` composes existing `AnimatedNumber`; `GlassFeatureCard` composes `SpotlightCard`; `OrbitNav`/numbered tabs can lean on `SegmentedTabs` where a strip suffices.
- `--font-accent` via next/font is clean alongside Saira/Teko — add one variable, expose in `@theme`.
- Partition holds: components = distinct new files; **only main writes `globals.css` + page files**.

**Gym-fit (cut the forced bits)**
- Drop "orbit of philosophers" literal → reframe C7 as a **weight-collar ring**: modes arranged around a glowing plate/collar. Optional/last priority.
- Circular framing (S'Watch) → frame the glow ring around the **wordmark**, not a bust.
- Serif-italic accent used only on visceral words: *stronger*, *relentless*, *live*.

**Motion/perf/a11y budget**
- Max **2** simultaneous looped glows on a screen; `GlowRing` uses radial-gradient + `box-shadow`, NOT large `filter: blur` (blur only on the small aurora already present).
- Hero choreography delays: aurora 0 · wordmark 120ms · ring scale-in 200ms · sub 300ms · statbar 420ms · CTA 520ms; durations 800–900ms, `--ease-expo`.
- reduced-motion fallbacks required on: glow-ring rotate→static, aurora drift→static, marquee→paused, count-up→final value, all `Reveal`→shown.
- `Statement` word reveal: wrap full sentence with real text + `aria-label`; per-word spans `aria-hidden` so SRs read the whole sentence.
- CLS: hero reveals animate **transform/opacity only** (no layout props) → no shift.

**Cuts / defer:** none outstanding — see §9.

---

## 9. Status — COMPLETE ✅

Every catalog item (C1–C11) plus all page briefs (§6) shipped and verified
(`tsc` clean · lint 0 errors · build 36/36 routes).

- **Foundation:** glow tokens (`--glow-accent/-soft`, `--ring-glow`), serif accent (`--font-accent` Newsreader), classes `.k-wordmark` / `.k-hl(-serif)` / `.k-rail` / `.glow-ring` / `.k-glow(-text)`.
- **Components:** `GlowRing`, `StatBar`, `Statement`+`Hl`, `NumberedSteps`, `GlassFeatureCard`, `feature-visuals` (`NodeDiagram`/`GlowChart`/`Radar`), `OrbitNav`, `Testimonial`.
- **Pages:** landing hero (ring + glowing wordmark + serif accent + count-up StatBar + rails) → Statement band → glass feature trio + supporting trio → split showcases → Testimonial → CTA; **floating pill nav that shrinks on scroll** (C9); modes = `OrbitNav` collar-ring picker + detail panel; **onboarding = 4-step `NumberedSteps` wizard** (Identity · Body · Lifts · Finish) with review step.
- **Cleanup:** removed dead `@react-three/fiber` + `@react-three/drei` + `three` deps (both lockfiles synced) after the WebGL dumbbell was retired.

This document is closed. Future visual work extends the tokens/primitives above.

---

## 8. Guardrails

- Reuse tokens/primitives; no hex, no dup primitives, no new deps (except the
  one `next/font` accent face).
- Mode-safe: cascade from `--accent`/`--bg`.
- A11y: reduced-motion, focus-visible, `aria-hidden` on decorative glow/rings.
- Mobile-first: clamp() sizing; rings/orbits degrade gracefully.
- Verify: `tsc --noEmit`, `bun run lint`, `bun run build` green before done.
