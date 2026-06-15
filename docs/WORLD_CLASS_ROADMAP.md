# PUMPS / KINETIC — Road to World-Class

> Honest current-state teardown vs. industry-grade competitors (Hevy, Strong, Strava, Fitbod, Whoop), and a staged roadmap to close the gap.
> Authored 2026-06-14. Grounded in the actual codebase, not aspirations.

---

## The core thesis

World-class fitness apps do not win on exotic infrastructure. Their stack is boringly similar to PUMPS — Postgres, a typed API, a clean client. They win on three things, in priority order:

1. **The data is never wrong.** A PR is a PR. Dashboard volume == progress volume == what you logged. History survives edits. Nothing silently drifts. In a tracking app, *trust is the entire moat* — one wrong number and the user stops believing all of them.
2. **The core loop is frictionless and fast.** Logging a set is sub-second, works offline, never loses data. The thing done 200×/month is flawless before the thing done twice.
3. **It feels considered.** Empty states, transitions, error recovery, copy. Polish reads as competence.

None of those require new technology. The gap is **discipline and depth on a few axes.**

---

## The design north star — `/rebuild`

There is already a canonical visual blueprint in the codebase: `src/app/rebuild/page.tsx` (the `/rebuild` route), a faithful React port of the "PUMPS Frontend Rebuild v2" design document produced from the codebase itself. It is **not a literal instruction file** — it is the spec *encoded as working components*. Treat it as the design source of truth for everything below. Its five sections are the brief:

- **01 Foundations** — the token set: color scale (`#08090B` page → `#101216` surface → `#171A1F` elevated → `#9A9CA3` ink-2 → `#F4F5F6` ink, accent `#CCFF00`; semantic success/danger/warning/info), type roles (Teko for numerals/big stats, Saira 600 headings sentence-case, Saira 400 body, uppercase only for micro-labels), an 8/12/16/22/pill radius scale, and a 4·8·12·16·24·32 spacing scale. Plus base components: buttons (primary/secondary/ghost), input, badges/status, toggle.
- **02 The rebuild** — 7 flagship screens, each desktop + phone: Dashboard, **interactive** live workout logger (steppers + Log set), Progress & analytics, Leaderboard & competitions, Nutrition & macros, 3D exercise visualization, Profile & settings.
- **03 Motivation modes** — the theming architecture: **5 modes (Standard/Monk/Revenge/Winter/Happy) re-theme a single `--accent` source through the CSS cascade — one token, no per-page overrides, no flash.** This is the correct fix for the hydration #418 / mode-context body-class bug.
- **04 Explorations** — 3 dashboard rhythms (editorial-calm / command-deck / single-focus) to choose between.
- **05 The shift** — the rationale: sentence-case > UPPERCASE, soft radii as the #1 premium signal, accent-as-scalpel (lime only for live/active/key data), one token > per-page overrides.

**Status (verified 2026-06-14):** the extraction is **already done.** `src/app/globals.css` holds the full token set (the exact colors/type/radius/spacing above) as CSS variables, the `@theme inline` Tailwind v4 mapping, the 5-mode single-`--accent` cascade (`body.mode-*` overrides + no-FOUC script in `layout.tsx`), and a component layer (`src/components/ui/kinetic.tsx` + `.k-*`/`.btn-`/`.card-` classes) that the 28 pages already consume (265 usages). `/rebuild` is `CSSProperties`-inline because it is a standalone *reference render*; the production app is not. So the design-system foundation is in place. The only residual work on this axis is migrating ~27 files that still carry inline `style={{}}` and the Stage-2 polish pass — **not** a from-scratch extraction. The genuinely-missing foundation is the **data layer** (below), so the Exodus begins there.

---

## Maturity scorecard (1 = absent, 5 = world-class)

| # | Dimension | Now | Target | Evidence in code |
|---|-----------|:---:|:------:|------------------|
| 1 | **Data integrity & trust** | 1 | 5 | No `updated_at`, no soft deletes, no audit/edit log, no canonical rollups. Metrics computed per-page → drift (P0 bug). |
| 2 | **Rendering architecture** | 1 | 4 | **All 28 pages are `"use client"`**. Zero server components / server data fetching. No streaming, no RSC. |
| 3 | **Data fetching & state** | 1 | 5 | Zustand in deps but **imported 0×**; no TanStack Query/SWR. Raw `supabase.from()` in ~31 files, no cache/refetch → stale data until re-render. |
| 4 | **AI subsystem** | 2 | 4 | DeepSeek via hardened `lib/deepseek.ts` (good error mapping) but **prompt-instructed JSON**, regex-parsed. No schema constraint, confidence, ambiguity surfacing, or stored metadata. |
| 5 | **DB schema & performance** | 2 | 5 | 9 migrations, RLS present. Only **3 indexes total**. No normalization/alias table; exercise matching lives in the AI prompt. |
| 6 | **Offline & reliability** | 1 | 4 | No offline support, no draft persistence, no sync queue. A dropped network loses a logged set. |
| 7 | **UX polish & design system** | 4 | 5 | Design system is **already extracted** — `globals.css` has the full token set, radius/spacing/type scales, the 5-mode single-`--accent` cascade + no-FOUC, and a component layer (`kinetic.tsx`, `.k-*`/`.btn-`/`.card-` classes, 265 uses across the app). `/rebuild` is the reference render of this system. Remaining: ~27 files with residual inline `style={{}}` to migrate; broken empty states, inconsistent casing/dates, phantom mock data on charts. |
| 8 | **Auth & security (RLS)** | 3 | 5 | Supabase Auth + RLS migrations exist. Needs RLS test coverage, non-recursive squad policies, signed-media discipline. |
| 9 | **Observability & ops** | 1 | 4 | No error tracking, no structured logging, no analytics, no feature flags, no `background_jobs` table. One Vercel cron. |
| 10 | **Testing & quality** | 1 | 4 | **Zero tests.** No unit, integration, e2e, or RLS tests. No CI gate. |
| 11 | **Performance / CWV** | 2 | 5 | All-client rendering hurts TTFB/LCP. 3D hero (`three`/r3f) is heavy. No measured budget. |
| 12 | **Media pipeline** | 1 | 4 | No Supabase Storage, no progress photos / voice uploads / signed URLs. |

**Composite: ~1.6 / 5 today.** The skin is genuinely good; the skeleton is the work.

---

## Why the audit undersold it

The 2026-06-14 audit ("9/10 skin, broken skeleton", FE B+, full-stack D) read the *symptoms*. The teardown above finds the *root causes*:

- "Data stale until theme switch" isn't a race — it's **the absence of any data-fetching layer**. There is nothing to invalidate or refetch.
- "Dashboard reads 0" + "phantom mock data" isn't two bugs — it's **no canonical aggregation path**; each screen rolls its own query and they disagree.
- Hydration #418 is structural — **every page is a client component** doing async work on mount, so server/client markup can't match.

Fixing the audit's 17 line items without fixing these three foundations means they come back.

---

## The three stages

### Stage 0 — Solid (precondition, not polish)

> World-class is first the *absence* of broken. A beautiful readiness algorithm on a Leaderboard that 500s reads as broken, not impressive.

Goal: nothing in the app is broken; every number is correct; no console errors.

0. ~~Extract the design system~~ — **DONE** (already in `globals.css` + `kinetic.tsx`; see "Design north star" above). Residual: migrate ~27 files off inline `style={{}}` (deferrable cleanup, not a blocker).
1. **Introduce a data-fetching layer** (TanStack Query) — *the true first move*. Wrap reads, key by entity, invalidate on mutation. This alone kills the P0 stale-data class.
2. **Single canonical aggregation path.** One source of truth for volume/PRs/streaks (a server function or shared query module). Dashboard, Progress, Workouts all consume it. Delete `demoVolume` / mock fallbacks.
3. **Fix the broken pages** from the audit: Squads infinite "Loading…", blank Leaderboard, missing `AppNav` on Competitions/Progress, AI 500s (verify `DEEPSEEK_API_KEY` on Vercel; calorie-scan needs a vision model).
4. **Kill hydration #418.** Move shells and data fetching to server components where possible; isolate client-only state (mode/theme) behind a single boundary.
5. **Data hygiene:** prune empty exercises (0-set Squat), per-route `<title>`/metadata, date/casing/grammar consistency.

Exit criteria: every page loads with real data, no console errors, no number disagrees with another.

### Stage 1 — Trustworthy (the moat) — ✅ substantially complete

Goal: the data foundation the report describes — data can never silently drift, and history is recoverable.

1. **Data-trust migrations** ✅ (`00010`/`00011`, applied): `updated_at` + triggers; soft deletes (`deleted_at`) with RLS excluding deleted rows (and a deleted workout's sets, via parent check); `audit_events` log + `recordAuditEvent`.
2. ~~**Canonical rollups** (`volume_daily_rollups`, … via `pg_cron`)~~ — **deliberately deferred.** The canonical `metrics` module is already the single source of truth, and at current scale there is no read-performance problem to solve. Rollup tables would re-introduce a *second* representation that can drift from source — the exact failure the trust work eliminated — for no present benefit. The report itself files rollups under the mid-scale tier. Revisit when a screen is measurably slow at real data volume.
3. **Exercise normalization** ✅ (`00012`, applied): `exercise_aliases` table + `resolveExerciseId()`; AI output resolves to canonical IDs, not free text.
4. **Schema-validated AI** ✅: Zod schemas + JSON mode + repair retry on every AI route. (Deferred enhancements: confidence scoring, stored request/response metadata, ambiguity surfacing.)
5. **RLS tests** ✅: pgTAP suite (`supabase/tests/`) asserting soft-delete + cross-user isolation, plus a `bun test` unit suite for the metrics module.
6. **Observability** ✅: structured logger (`src/lib/log.ts`, Vercel-native JSON) wired through the AI subsystem + audit, with an error-tracking seam; CI gate (lint + test + build) on every push. (Vendor error-tracking SDK — Sentry — is a drop-in at the seam when wanted.)

Exit criteria: you can delete and restore a workout ✅; every metric flows from one canonical module ✅; an RLS test suite exists ✅; AI output is schema-guaranteed ✅.

### Stage 2 — World-class (depth & feel)

Goal: the things competitors are actually judged on.

1. **Offline-first logging** ✅ — local draft persistence (workouts/new) + a persistent mutation/sync queue (`offline-queue.ts` + `SyncManager`) that replays on reconnect, so a logged set is *never* lost.
2. **Sub-second core loop** ✅ (core) — the mutation layer (`mutations.ts`) with optimistic delete + instant local set logging. *(Deferred: a measured <100ms interaction budget.)*
3. **Deep analytics** ✅ — estimated-1RM progression + muscle split on Progress, from the canonical `metrics` module; dashboard streak. *(Deferred: fatigue/readiness inference.)*
4. **Media pipeline** ✅ — private Storage bucket + signed URLs; progress photos (`/photos`). *(Deferred: voice journaling → transcript; the storage pattern is established.)*
5. **Performance pass** ✅ (core) — 3D hero already `next/dynamic` (ssr:false); recharts now dynamic-loaded on dashboard + progress. *(Deferred: full RSC/streaming migration — the client-side TanStack data layer is deliberate, so RSC is a large re-architecture for later; CWV budget in CI; recharts lazy-load on nutrition/journal.)*
6. **Polish pass** 🟡 — dashboard rebuilt to the blueprint (gradient streak hero, real stat tiles). *(Ongoing: port the remaining flagship screens — logger, Leaderboard, Nutrition, Profile — to the blueprint.)*

Exit criteria: install it next to Hevy/Strong and it holds up — never loses data ✅, never shows a wrong number ✅, feels faster ✅. **Stage 2 core is shipped; the remaining items (full RSC, voice, fatigue inference, broader polish) are deliberately staged as ongoing rather than blockers.**

### Stage 3 — Scale & Operate (the mid-scale SaaS tier)

Stages 0–2 made PUMPS *correct, trustworthy, and world-class to use* for a small user base. Stage 3 is the report's **mid-scale SaaS-standard** tier: the rigor and infrastructure that let it grow without the data trust or operability cracking. **Do not start this for scale you don't have** — pull each item forward only when a real signal demands it (a slow screen, a support burden, a monetization need). It is the *architecture to grow into*, sequenced so nothing here is a rewrite of Stage 0–2.

Pillars, roughly in dependency order:

1. **Operability & observability (do first).** 🟡 *Started:* Vercel Analytics + Speed Insights wired (traffic + Web Vitals/CWV); server errors (`instrumentation.ts` `onRequestError`) and client errors (`instrumentation-client.ts` → `/api/client-error`) now flow through the structured logger and the `captureError` seam. *Remaining:* point the seam at a real Sentry DSN, add error-rate/latency alerting, and a signup → first-workout → streak funnel. This is what turns "it works on my machine" into "I know it works for everyone."
2. **Entitlements & billing.** 🟡 *Started:* `subscriptions` table (read-only to users — only the billing webhook/service role writes the tier, so no one can self-upgrade) + `quota_events` metering table (00014). `lib/entitlements.ts` `enforceAiQuota()` gates every `/api/ai/*` route on auth + a per-tier daily limit (free 15, pro 1000), recording each call — this also closed a real hole (the AI routes were unauthenticated, so anyone could burn the paid model API). Fails open if metering is unavailable, closed on actual overage. *Remaining:* the payment provider (Stripe/LemonSqueezy) — checkout + a webhook that writes `subscriptions` — plus a tier/usage UI and upgrade flow. Wiring a provider needs the user's account/keys, so it's the documented next step (same pattern as the Sentry DSN).
3. **Canonical rollups + `pg_cron`** *(deferred from Stage 1 — now justified).* When the per-page aggregation over raw sets becomes measurably slow at real data volume, introduce `volume_daily_rollups` / `e1rm_rollups` / `streak_rollups` recomputed by `pg_cron` + a `background_jobs` table, and have screens read rollups. **Only when measured** — the canonical `metrics` module stays the source of truth that the rollups are derived from and tested against.
4. **Notifications pipeline.** Streak-at-risk nudges, competition results, squad activity — via `pg_cron` + Edge Functions + (later) web push / email. The audit/event spine and `background_jobs` table feed this.
5. **Admin & moderation tooling.** 🟡 *Started:* a secure admin role — `admins` table (no client write → no self-promotion) + a `SECURITY DEFINER` `is_admin()` so RLS policies don't recurse (00015) — and an admin-gated `/admin` panel showing the full `audit_events` trail (actor / action / entity / detail). Foundation for the rest. *Remaining:* leaderboard-correction flow, squad/media abuse moderation, failed-AI-job review, and a per-action moderation UI. *(Grant the first admin once via SQL: `insert into admins (user_id) values ('…')`.)*
6. **Export & data portability.** ✅ Self-serve export from Settings: full training-log **CSV** (one row per set) + a complete **JSON** export (workouts + exercises + sets, journals, meals). Client-side, RLS-scoped, soft-deleted rows excluded. *(Follow-up: PDF, and a one-click "delete my account/data" companion.)*
7. **Deferred depth from Stage 2.** Voice journaling → transcript → the schema-validated parser (media path established); fatigue/readiness inference from the rollups; AI confidence scoring + stored request/response metadata + ambiguity-surfacing (the report's typed-AI subsystem). **Screen ports to the `/rebuild` blueprint:** Dashboard ✅, Leaderboard ✅, Nutrition ✅ (calorie ring + macro bars, hand-built SVG — recharts dropped from the route), Profile ✅ (cover + avatar hero on design tokens, replacing hardcoded hex). *Remaining: the live workout logger (complex — has drafts/sync).*
8. **Mobile / offline hardening (Expo path).** The `offline-queue` + draft persistence are the conceptual seed; Stage 3+ is the React Native / Expo client with SQLite-backed local-first sync and explicit merge rules — a *new client over the same domain core*, not a rewrite.

Stage-3 discipline (the difference from Stage 2): tested RLS in CI (the pgTAP suite runs in the pipeline, not just locally), reproducible migrations against a staging environment, job idempotency, restore drills, and a CWV budget enforced in CI. Same stack — Next.js + Supabase — more rigor.

Exit criteria: PUMPS can take on real growth — paying users, support load, and data volume — without the data-trust, performance, or operability guarantees from Stages 0–2 degrading.

---

## What NOT to build (per the report, still true)

Microservices, Kafka/message bus, CRDT sync, multi-region, separate analytics warehouse. The monolith + Supabase is correct at this scale; rigor is the upgrade, not architecture sprawl.

---

## Suggested first move

Of the two foundational pillars, the **design system is already built** (verified — `globals.css` + `kinetic.tsx`). So the first move is the remaining pillar:

**TanStack Query + a single canonical aggregation module** (Stage 0, items 1–2) — dissolves the entire P0 stale-data + dashboard-drift class. Concretely: a `QueryClientProvider`, typed query hooks wrapping the core Supabase reads, and one canonical metrics module (volume/PRs/streaks) that the dashboard, progress, and workouts pages all consume. Prove the pattern on the dashboard first, then spread it.

The `/rebuild` route stays in the repo as the living visual reference. Residual inline-style migration and the polish pass ride along later in Stage 0 / Stage 2.
