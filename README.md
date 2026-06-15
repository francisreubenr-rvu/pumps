# PUMPS · KINETIC

A premium, offline-capable gym training app — log workouts, track real strength progress, fuel with nutrition, and compete with friends. Built as a disciplined modular monolith: **Next.js 16 (App Router) + Supabase + TanStack Query**, with an AI layer behind authenticated, schema-validated boundaries.

> Live: [pumps-rho.vercel.app](https://pumps-rho.vercel.app)

---

## Highlights

- **Frictionless, offline-first logging.** An in-progress workout survives a refresh or crash (local draft), and a workout finished in a gym dead zone is **queued and auto-synced** when you reconnect — a logged set is never lost.
- **One source of truth for every number.** Volume, estimated 1RM, streaks, muscle split, and training-readiness all come from one pure, **unit-tested** metrics module — so the dashboard, progress, and profile can never disagree.
- **AI that's a typed subsystem, not a prompt-on-a-button.** Free-text workout parsing, routine generation, calorie scanning, and journal insights run server-side with **Zod-validated structured output**, per-tier **quota metering**, and latency/usage observability.
- **Five motivation modes.** Standard · Monk · Revenge · Winter · Happy — each re-themes the entire UI from a single `--accent` token, no flicker.
- **Trustworthy data.** Row-Level Security on every user table, soft deletes, an audit trail, and a one-click data export (CSV + JSON).

## Features

| Area | What's there |
|---|---|
| **Workouts** | Live logger with drafts + offline sync; per-session volume; soft-deletable, recoverable history |
| **Progress** | Max-weight & estimated-1RM curves, weekly volume, muscle-group split |
| **Dashboard** | Greeting, streak, stats, volume history, **training readiness** (acute:chronic workload) |
| **Nutrition** | Macro ring + bars, meals by type, AI calorie scan |
| **Journal** | Daily/weekly entries, mood/energy, AI coaching insights |
| **Social** | Squads, competitions, global + per-exercise leaderboards (podium) |
| **Media** | Private progress photos via signed URLs |
| **Account** | Subscription tiers + AI quota, data export, admin audit panel |

## Tech stack

- **Framework** — Next.js 16 (App Router) · React 19 · TypeScript
- **Data** — Supabase (Postgres, Auth, Storage) · Row-Level Security · TanStack Query (client cache, optimistic mutations, offline queue)
- **AI** — DeepSeek via a server-side, Zod-validated orchestration layer
- **UI** — Tailwind CSS 4 · a CSS-variable design system (`globals.css` + `components/ui/kinetic.tsx`) · shadcn/ui · Recharts · three.js / R3F (landing hero) · Lucide
- **Validation / tooling** — Zod · Bun · ESLint
- **Ops** — Vercel (Git-deploy) · Vercel Analytics + Speed Insights · structured logging with a Sentry-ready error seam

## Getting started

Requires [Bun](https://bun.sh).

```bash
bun install
bun dev          # http://localhost:3000
```

Other scripts:

```bash
bun run build    # production build
bun run lint     # eslint
bun test         # unit tests (metrics module)
```

### Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-only (AI insight persistence, ops)
DEEPSEEK_API_KEY=<key>                          # AI features; routes 503 cleanly without it
# DEEPSEEK_VISION_MODEL=<model>                 # optional — calorie scan vision model
# NEXT_PUBLIC_SITE_URL=https://your-domain      # optional — OG/metadata base
```

### Database

SQL migrations live in [`supabase/migrations/`](supabase/migrations) and apply in order:

```bash
supabase link --project-ref <ref>
supabase db push
```

If the project predates CLI management, mark the already-applied migrations first:
`supabase migration repair --status applied 00001 … 0000N`. Database tests (pgTAP) run with `supabase test db` (requires the local stack).

## Architecture

A **modular monolith** — boundaries by domain, not microservices:

- **Data layer.** Reads flow through cached TanStack Query hooks (`src/lib/queries/`); writes through mutation hooks with optimistic updates and a persistent offline queue (`src/lib/offline-queue.ts`).
- **Canonical metrics.** `src/lib/metrics.ts` owns every derived number (pure, unit-tested) — screens never recompute ad hoc.
- **Trust.** RLS on all user data; soft deletes (`deleted_at`) hidden at the policy layer; an `audit_events` trail; admin role via a non-recursive `SECURITY DEFINER` check.
- **AI.** `src/lib/deepseek.ts` wraps the model in JSON mode + Zod validation + a repair retry; routes are auth-gated and quota-metered (`src/lib/entitlements.ts`).
- **Observability.** Structured logger (`src/lib/log.ts`) feeding client + server error capture, with a drop-in seam for Sentry.

The full build history and forward roadmap — Stage 0 (foundation) → Stage 3 (mid-scale SaaS rigor) — is in [`docs/WORLD_CLASS_ROADMAP.md`](docs/WORLD_CLASS_ROADMAP.md). The `/rebuild` route renders the design-system reference.

## Deployment

Auto-deploys to Vercel on push to `main`. Set the environment variables above in the Vercel project, and apply pending Supabase migrations with each release.
