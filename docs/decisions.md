# Compass — Decisions

## Decision log format

Each decision follows this structure:

| Field | Description |
|-------|-------------|
| **Title** | Short name |
| **Decision** | What we chose |
| **Rationale** | Why |
| **Implications** | What this means for build and docs |
| **Date** | When decided (optional) |

---

## Manual logging first

**Decision:** All activity is logged manually through the app UI. No automatic imports in MVP.

**Rationale:** Manual logging keeps the MVP simple, avoids integration complexity, and forces intentional tracking. The user knows exactly what was recorded.

**Implications:** Log form is a core screen. Duration and date are required fields; note is optional. Fitbit and calendar sync are explicitly deferred.

---

## Google Calendar later

**Decision:** No Google Calendar integration in MVP.

**Rationale:** Calendar sync adds OAuth, API quotas, and mapping complexity. Work time can be logged manually until the balance model is proven useful.

**Implications:** Career is a normal life area with manual logs. Architecture doc lists calendar as Phase 8 / future.

---

## Fitbit later

**Decision:** No Fitbit or health tracker integration in MVP.

**Rationale:** Same as calendar — integration effort doesn't belong in the first vertical slice. Health logs are manual sessions or durations.

**Implications:** Health weekly target uses sessions or hours from manual entry only.

---

## Keep MVP local and simple

**Decision:** Single-user, local-first app. No cloud, auth, or multi-device sync in MVP.

**Rationale:** Compass is a personal tool. Local SQLite (or similar) matches privacy expectations and keeps deployment out of scope.

**Implications:** Tech stack should favor local DB file, no env secrets for external services. README setup stays `npm run dev` on localhost.

---

## Focus on life balance, not productivity guilt

**Decision:** Copy, status labels, and UI tone emphasize balance awareness — not shame, streaks, or "you failed" messaging.

**Rationale:** The user problem is neglect and over-focus, not insufficient task completion. Harsh productivity apps increase anxiety; Compass should feel calm and honest.

**Implications:**

- Use neutral labels: "Neglected", "Behind", "On track", "Over-focused"
- Today's Focus suggests where to spend attention — not a punitive backlog
- No streak counters or red-alert guilt patterns in MVP
- Recommendation logic prioritizes high-priority neglected areas, not longest todo list

---

## App name: Compass

**Decision:** The app is called **Compass**.

**Rationale:** Captures the morning ritual ("know where to point today") without implying a todo-only product. Short and memorable.

**Implications:** Repo folder `compass`.

---

## Default life areas (seed list)

**Decision:** MVP ships with six predefined areas: Health, Career, Learning, Creativity, Home, Social.

**Rationale:** Broad categories give people a starting point for tracking life areas and weekly goals; seed data makes the app usable on day one.

**Implications:** Phase 1 seed script creates these rows. Editing targets/priorities is in scope; adding brand-new area types can wait until post-MVP unless needed during build.

---

## Unified dashboard UI (Phase 9)

**Decision:** Merge Morning + Dashboard into a single home screen (`/`) using the three-column wireframe layout (nav | main | right panel).

**Rationale:** The wireframe matches the product ritual — open Compass once and see focus, balance, tasks, and quick log in one place. Separate Morning/Dashboard pages split that experience.

**Implications:**

- `/dashboard` redirects to `/` after Phase 9
- `/log` becomes `/activities` (Activities in nav)
- Calendar and Insights appear in nav with "Soon" badges — no implementation in Phase 9
- Right panel is dashboard-only; other pages use two-column shell (nav + main)
- No new backend models required for Phase 9

---

## Focus timer: one thing at a time (Phase 10)

**Decision:** Add an in-app focus timer (Pomodoro-style) that ties timed work to a single life area and auto-creates activity logs on completion.

**Rationale:** Manual logging captures what happened after the fact; a timer keeps the user focused during the activity and reduces friction (no need to remember duration). Enforcing one active session at a time matches the product goal — balance through intentional attention, not multitasking.

**Implications:**

- New route `/focus` (or equivalent) and nav entry
- Likely new `FocusSession` model for pause/resume and refresh survival; completed time flows into existing `ActivityLog`
- Dashboard Today's Focus and Quick Log become entry points to start a session
- Every focus session **requires a note to complete** (same 500-char limit as activity logs); draft may be empty while running; saved on the session and copied to `ActivityLog` on complete
- Tone stays calm: pausing/cancelling is fine; no streaks or failure messaging
- Phase 8 integrations (Calendar, Fitbit) remain separate — timer is manual/intentional like current logging

---

## Deployment approach (Phase 11)

**Decision:** **Vercel** for the Next.js app + **Neon** for PostgreSQL. Use the **deployed Vercel URL** for daily tracking while developing locally.

**Architecture (important):** Compass is not a separate React SPA + API. It uses **Server Components and server actions** with Prisma. On Vercel, the “frontend” and server logic ship together as one Next.js deployment. Neon hosts **PostgreSQL only** — no separate backend service.

**Rationale:**

- **Vercel** — excellent Next.js hosting: Git deploy, HTTPS, preview URLs.
- **Neon** — serverless Postgres with a generous free tier; connection pooling built-in (good fit for Vercel serverless). Create a project and paste connection strings into `.env` — no local database install.
- **Stable prod URL** — no dev HMR while you track focus sessions; code on `localhost:3000` with a separate dev branch/DB on Neon (or same DB for solo v1).
- Cloud Postgres supports persistent tracking data with access restricted by the authentication gate.

**Implications:**

- Prisma: `provider = "postgresql"` with `url` + `directUrl`.
- **Neon env vars:**
  - `DATABASE_URL` — **pooled** connection (`-pooler` host) for the running app (local + Vercel).
  - `DIRECT_URL` — **direct** connection for `prisma migrate` / `migrate deploy` (migrations do not work through the pooler).
- **Vercel build:** `vercel-build` runs `prisma migrate deploy && next build`; set both env vars in Vercel project settings.
- **Dynamic rendering:** root layout uses `force-dynamic` so builds do not require a live DB at compile time.
- Single-user data in v1; **auth gate live in Phase 12** before public Vercel deploy.
- **Dev workflow:** daily use → Vercel URL; coding → `localhost:3000`. Use a Neon **dev branch** or separate project for dev data when you want isolation from prod.

**Rejected for this project:** Render Postgres for Compass (user chose Neon); Render Web Service for the app; SQLite on a volume; splitting into a separate API service; deploying without auth.

---

## Authentication (Phase 12)

**Decision:** **Auth.js (next-auth v5)** with **Credentials** provider — single-user private gate before public Vercel deploy.

**Rationale:**

- Only the account owner should access Compass on a public URL.
- Credentials in env (`AUTH_EMAIL`, `AUTH_PASSWORD`) — no OAuth app setup, no extra vendor.
- Middleware redirects unauthenticated visitors to `/login`.
- Server actions call `requireAuth()` so data cannot be mutated without a session.
- Multi-user (`userId` on models, sign-up) deferred until the product opens to others.

**Implications:**

- Env: `AUTH_SECRET` (session signing), `AUTH_EMAIL`, `AUTH_PASSWORD` — set locally and on Vercel.
- Routes: `/login` public; all other app routes protected.
- Sign out in app nav; session uses JWT strategy.
- A **public demo** is a separate deployment signed in as `demo@compass.app` / `compass-demo`, shown as **John Smith**. It is not a second user on the personal database. The demo keeps six areas, and Today's Focus is Health, Creativity, and Career so the cards are not the same hue. On that host, `/login` redirects to automatic entry, and the profile row is not a sign-out control. `npm run db:seed:demo` only writes sample logs when that demo email is set and the database is `compass_demo`.

---

## Appearance

**Decision:** Dark mode is a client preference: Light, Dark, or System. It is stored in `localStorage` (`compass-theme`) and applied with a `dark` class on `<html>`.

**Rationale:** The app is used morning and night. System follows the device; an explicit choice stays put across visits. No account setting, because there is still one user per database.

**Implications:** A Day / Night toggle sits in the sidebar (and the mobile nav). Settings still offers System. Focus cards use a deep tint of each area color at night. Native date fields follow `color-scheme`.
