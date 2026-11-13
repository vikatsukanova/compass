# Compass — Tasks

Implementation phases for the MVP defined in [context.md](./context.md). Check off items as they ship.

**Legend:** ✅ done · 🔲 not started · 🟡 in progress

---

## Phase 0 — Project setup & docs

- [x] Create `AGENTS.md`
- [x] Create `README.md`
- [x] Create `docs/context.md`
- [x] Create `docs/architecture.md`
- [x] Create `docs/tasks.md`
- [x] Create `docs/decisions.md`
- [x] User review of docs before implementation
- [x] Choose tech stack (Next.js 15 + Prisma + SQLite + Tailwind)
- [x] Initialize app scaffold (repo, dependencies, gitignore)
- [x] Confirm default life areas seed data

---

## Phase 1 — Data models

- [x] Define Prisma schema for `LifeArea`, `ActivityLog`, `Task`
- [x] Run initial migration
- [x] Seed default life areas (Health, Career, Learning, Creativity, Home, Social)
- [x] DB client singleton (`src/lib/db.ts`)
- [x] Server actions: `src/actions/life-area.ts`, `activity-log.ts`, `task.ts`

---

## Phase 2 — Life areas

- [x] List all life areas with weekly target and priority (`/areas`)
- [x] Create / edit life area (name, target, unit, priority)
- [x] Area detail page — target and current week summary (`/areas/[slug]`)
- [x] Deactivate areas via Active checkbox on edit (reorder skipped for MVP)

---

## Phase 3 — Activity logging

- [x] Quick log form — area, date, duration, note (`/log` and area detail)
- [x] List logs for current week (global on `/log`, per area on `/areas/[slug]`)
- [x] Edit and delete log entries (inline edit + confirm delete)
- [x] Compute weekly logged total per area (`src/lib/area-progress.ts`)
- [x] Fix hours duration inputs — hours + minutes fields for hour-based areas (`HoursMinutesDurationFields`)

---

## Phase 4 — Tasks

- [x] Create task linked to life area (title, due date, urgent flag)
- [x] Task list — filter by area, show open vs done
- [x] Mark task complete (checkbox toggle, reopen supported)
- [x] Edit and delete tasks
- [x] Show open urgent tasks on morning view (stub until Phase 6)

---

## Phase 5 — Dashboard

- [x] Weekly progress view — all areas with logged vs target (`/dashboard`)
- [x] Visual indicator per area (progress bar, green when at target)
- [x] Week selector (prev/next + Today, via `?week=` param)
- [x] Empty states when no logs yet

---

## Phase 6 — Recommendation logic

- [x] Week boundary helpers (`src/lib/week.ts` — rolling 7-day, midweek check)
- [x] `getAreaStatus` — neglected, behind, on track, over-focused (`src/lib/recommendations.ts`)
- [x] `getTodaysFocus` — priority ordering per architecture doc
- [x] Morning view (`/`) — Today's Focus list (3–5 items)
- [x] Status badges on dashboard per area (current week only)
- [x] Unit tests for recommendation edge cases (`npm test`)

---

## Phase 7 — UI polish

- [x] Consistent layout and navigation (`PageShell`, sidebar + mobile bottom nav)
- [x] Calm morning-friendly styling (warm stone palette, shared component classes)
- [x] Mobile-tolerant layout (bottom tab bar on small screens)
- [x] Empty states and loading states (`EmptyState`, `app/loading.tsx`)
- [x] Form validation (required fields, max lengths, positive durations)
- [x] Update README with setup instructions and MVP status

---

## Phase 8 — Future integrations (not MVP)

Track ideas only — do not implement unless requested.

- [ ] Google Calendar sync
- [ ] Fitbit / health tracker sync
- [ ] AI daily planning
- [ ] Push notifications / morning reminders
- [ ] Custom life areas UI (beyond seed list) — **done** via `/areas` → Add custom life area
- [ ] JSON export / backup
- [ ] Streaks and historical trends

---

## Phase 9 — Dashboard UI redesign (wireframe)

**Goal:** One unified home screen inspired by the dashboard wireframe — greeting, Today's Focus, life-area overview, weekly stats, and a right-side panel for tasks + quick actions. Reuse existing data/recommendation logic; this phase is layout and presentation, not new backend features.

**Visual reference:** Dashboard wireframe (Jun 2026) — three columns: nav | main | right panel.

**Legend:** 🔲 not started · 🟡 in progress

### 9.1 — App shell (three-column layout)

- [x] Root layout: left sidebar + main content + right panel (desktop `lg+`)
- [x] Right panel stacks under main on tablet; hidden on mobile (quick actions live elsewhere)
- [x] Shared max-width and card spacing tokens aligned with wireframe
- [x] `RightPanel` component — only rendered on dashboard route at first

### 9.2 — Navigation restructure

- [x] Sidebar items: **Dashboard**, **Life Areas**, **Activities**, **Focus**, **Tasks**, **Settings**
- [x] Calendar and Insights stay out of the sidebar until those features exist
- [x] Profile footer stub ("Me" · Stay aligned)
- [x] Update mobile nav to match primary routes (Dashboard, Life Areas, Activities, Tasks)
- [x] Route aliases: `/log` → `/activities`; `/dashboard` → `/`

### 9.3 — Unified Dashboard (`/`)

- [x] **Header** — time-aware greeting + today's date (no weather in v1)
- [x] **Today's Focus** — top 3 ranked cards with number badge, area icon, status line, priority pill
- [x] **Life Areas Overview** — compact table: icon + name + target subtitle | progress bar + fraction | status pill + chevron → area detail
- [x] **Weekly Summary** — four stat tiles: activities logged, on track, behind, neglected
- [x] Wire existing recommendation logic — no changes to `getTodaysFocus` / `getAreaStatus` rules
- [x] Week navigation via `?week=` on unified dashboard

### 9.4 — Right panel (dashboard only)

- [x] **Urgent Tasks** — compact list with checkbox complete + "View all tasks" link
- [x] **Quick Log** — grid of shortcut buttons for top areas (Health, Career, Learning, Creativity, Home, + Other) → opens log dialog pre-filled with area
- [x] **Recent Activities** — removed from the dashboard; full history stays on `/activities`
- [x] Optional static quote card at bottom (wireframe copy OK for v1)

### 9.5 — Area icons & visual language

- [x] `getAreaIcon(slug)` mapping (`src/lib/area-icons.ts`)
- [x] Status colors: green (on track), amber (behind), rose (neglected), violet (over-focused)
- [x] Priority pills match wireframe (High / Medium / Low Priority)
- [x] Table row hover + click → `/areas/[slug]`

### 9.6 — Secondary pages in new shell

- [x] Life Areas page — same sidebar shell, no right panel
- [x] Activities page — full log list + form (evolve current `/log`)
- [x] Tasks page — same shell
- [x] Settings page stub (`/settings`) — placeholder for future prefs
- [ ] Remove duplicate empty/placeholder pages after merge

### 9.7 — Responsive & polish

- [x] Dashboard readable on mobile (stacked sections, no cramped table — cards on `sm`)
- [x] Quick Log grid available on mobile (section on dashboard)
- [x] Loading skeleton for unified dashboard
- [x] Update README + architecture with new route map when done

**Out of scope for Phase 9:** Calendar sync, Insights analytics, weather, user name/auth, AI quotes.

---

## Phase 10 — Focus timer (Pomodoro-style)

**Goal:** Time activities in-app so you work on **one life area at a time** — like a calm Pomodoro, not a gamified productivity app. Starting a session should feel intentional; finishing should auto-log duration to the correct area.

**Product principles:**

- **One session at a time** — starting Learning while Health is running is blocked (or prompts to stop the current session first).
- **Area-first** — pick a life area (optionally pre-filled from Today's Focus or Quick Log).
- **Auto-log on complete** — completed focus time becomes an `ActivityLog` row (no duplicate manual entry).
- **Session notes** — every timed session requires a note before you can complete it; add while running or at the finish step; note is saved on the session and copied to the activity log.
- **Calm tone** — no streaks, no "failed session" shame; pausing and stopping are OK.

**Legend:** 🔲 not started · 🟡 in progress · ✅ done (partial — see sub-items)

### 10.1 — Session model & persistence

- [x] `FocusSession` Prisma model (pause/resume survives refresh)
- [x] Fields: `lifeAreaId`, `startedAt`, `endedAt`, `plannedMinutes`, `elapsedSeconds`, `lastResumedAt`, `status`, `note`, `activityLogId`
- [x] Enforce single active session (app-level guard on start)
- [x] Server actions: `startFocusSession`, `pauseFocusSession`, `resumeFocusSession`, `updateFocusSessionNote`, `completeFocusSession`, `cancelFocusSession`
- [x] On `complete`: reject blank note; create `ActivityLog` with duration + note
- [x] Debounced note draft save while session is running

### 10.2 — Timer UI (`/focus`)

- [x] **Focus screen** — countdown ring, area name + icon, elapsed vs planned
- [x] **Session note** — required field; Complete disabled until non-empty
- [x] **Controls** — Pause, Resume, Complete, Cancel (with confirm)
- [x] **Area picker** — before start; default from `?area=` slug
- [x] **Presets** — 15 / 25 / 45 min + custom length
- [x] `beforeunload` warning when session is running

### 10.3 — Dashboard & nav entry points

- [x] **Start timer** on Today's Focus area cards
- [x] **Quick Log grid** — area shortcuts open the log dialog; start a timer from Today's Focus
- [x] Nav item **Focus** → `/focus`
- [x] **Active session banner** in app shell (click → return to timer)
- [x] Mobile: full-viewport focus screen; Focus in bottom nav

### 10.4 — Settings & defaults

- [x] ~~Settings (`/settings`): default focus length, break length, sound on complete~~ → **Phase 13.5**
- [x] ~~Store prefs in localStorage for v1~~ → **Phase 13.5**
- [ ] Per-area default duration override (optional — defer unless needed)

### 10.5 — Polish & edge cases

- [x] Browser tab title shows remaining time while running
- [x] Gentle completion state — logged duration + note preview + links
- [x] Empty state when no life areas
- [x] Unit tests for elapsed math and note validation (`src/lib/focus-session.test.ts`)
- [ ] Update README + architecture with focus flow (implemented; docs pass optional)

**Out of scope for Phase 10:** Push notifications, background timer when app closed, multi-user, social/accountability, strict Pomodoro cycles (4 sessions → long break), Apple Watch / system timers. → **Phase 13** for full Pomodoro flow, alarm, and break cycles.

**Suggested build order:** 10.1 → 10.2 (minimal timer) → 10.3 (entry from dashboard) → 10.4 (partial — see Phase 13.5) → 10.5.

---

## Phase 11 — Deployment

**Goal:** Run Compass on **Vercel** with **Neon Postgres** so you can use it daily while developing locally without hot-reload killing the focus timer UX.

**Chosen stack:** Vercel (Next.js app) + Neon (see [decisions.md](./decisions.md)).

**Dev vs prod:** Use the **Vercel production URL** for tracking; use **local dev** only for coding (Neon dev branch or separate DB when you want isolation).

**Deploy order (do not skip):**

1. **11.2** — Postgres in code ✅
2. **11.3** — Neon project + migrate/seed ✅ (local)
3. **Phase 12 — Auth** — **required before public Vercel deploy** (see below)
4. **11.3** — Connect **Vercel** with `DATABASE_URL` + `DIRECT_URL` + auth secrets, then deploy
5. **11.5** — Smoke test on Vercel URL (must require login)
6. **11.4 / 11.6** — CI and domain (optional polish)

**Blocked:** Do **not** deploy a public Vercel URL until Phase 12 auth is done. Auth protects access to deployed tracking data.

**Legend:** 🔲 not started · 🟡 in progress

### 11.1 — Hosting & database decision

- [x] **Vercel** for Next.js (Server Components + server actions)
- [x] **Neon** for PostgreSQL (`DATABASE_URL` pooled + `DIRECT_URL` for migrations)
- [x] Document choice in `docs/decisions.md`
- [x] Single-user data model for v1 (auth gate added in Phase 12 before public deploy)

### 11.2 — Postgres migration & production scripts

- [x] Prisma: `provider = "postgresql"` + `directUrl` in `schema.prisma`
- [x] Fresh Postgres baseline migration (replace SQLite history)
- [x] `postinstall`: `prisma generate`
- [x] `vercel-build`: `prisma migrate deploy && next build`
- [x] `db:migrate:deploy` script for manual prod migrations
- [x] Seed once on first deploy: `npx prisma db seed` (run after Neon project created)
- [x] `.env.example` (Neon pooled + direct URLs)
- [ ] Local dev: set `.env` from Neon → `db:migrate:deploy` → `db:seed` → `npm run dev` (or `db:import-sqlite` once)
- [x] Verify: `npm run build` + `npm test`

### 11.3 — Vercel & Neon config

- [x] Create **Neon** project; enable connection pooling
- [x] Copy **pooled** URL → `DATABASE_URL` and **direct** URL → `DIRECT_URL`
- [ ] **Phase 12 auth complete** (prerequisite for public deploy)
- [ ] Create **Vercel** project; connect GitHub repo
- [ ] Vercel env: `DATABASE_URL` + `DIRECT_URL` + auth secrets
- [ ] Framework preset: Next.js; Node version via `engines` in `package.json`
- [ ] Smoke: production deploy loads `/` only after login; can write to DB

### 11.4 — CI/CD & repo

- [ ] GitHub → Vercel auto-deploy on `main` (preview deploys on PRs)
- [ ] CI workflow: `npm test` + `npm run build` on push (GitHub Actions)
- [ ] Never commit `.env` with production credentials

### 11.5 — Data safety & ops

- [ ] Rely on Neon backups / branching (per plan)
- [ ] Smoke test after deploy: dashboard, log activity, focus timer + note, tasks
- [ ] Document live URL + deploy steps in README

### 11.6 — Domain & polish (optional)

- [ ] Custom domain + HTTPS on Vercel
- [ ] (Optional) Improve focus timer dev UX — recover session after hard refresh; flush note on `beforeunload`

**Out of scope for Phase 11:** Multi-user sign-up (deferred to Phase 12+ if going public).

**Suggested build order:** 11.2 ✅ → Neon ✅ → **Phase 12 auth** → Vercel → 11.5 smoke test → 11.4 CI → 11.6 domain.

---

## Phase 12 — Authentication (before public deploy)

**Goal:** No one can read or write Compass data without logging in. Safe to deploy on a public Vercel URL.

**Legend:** 🔲 not started · 🟡 in progress

### 12.1 — Auth approach & decision

- [x] **Auth.js** + Credentials (email/password from env)
- [x] Scope: **private gate** — only your account; no `userId` migration yet
- [x] Document in `docs/decisions.md`

### 12.2 — Login & session

- [x] Sign-in page (`/login`)
- [x] Session middleware — protect all app routes; allow `/login` + auth API routes
- [x] Sign-out control in app shell
- [x] Env vars documented in `.env.example`

### 12.3 — Server-side enforcement

- [x] Guard server actions (`requireAuth()`)
- [x] Middleware redirects unauthenticated users from pages

### 12.4 — Multi-user prep (only if going public soon)

- [ ] `User` model + `userId` on all models
- [ ] Migrate existing Neon rows to the deployment owner’s user account
- [ ] Scope all Prisma queries by `userId`

### 12.5 — Public demo profile

- [x] Demo identity **John Smith** (`demo@compass.app` / `compass-demo`) for a public deployment
- [x] Demo deployment opens `/` with no sign-in form (automatic entry at `/demo/enter`)
- [x] Demo host has no login page — `/login` redirects to `/demo/enter`
- [x] `npm run db:seed:demo` — six sample areas (Health, Career, Learning, Creativity, Home, Social); Today's Focus is Health, Creativity, and Career; only writes to `compass_demo`

### 12.6 — Deploy gate

- [ ] Set `AUTH_SECRET`, `AUTH_EMAIL`, `AUTH_PASSWORD` in local `.env` and verify login
- [ ] Unauthenticated visit to `/` redirects to login
- [ ] Ready for Vercel deploy (Phase 11.3 resume)

---

## Phase 13 — Pomodoro timer (Pomofocus-style)

**Goal:** Evolve the Phase 10 focus timer into a proper **Pomodoro workflow** — like [Pomofocus](https://pomofocus.io): alternating focus and break intervals, an audible alarm when time is up, and familiar start / pause / resume / reset controls. Focus sessions stay **area-linked** and still auto-log on complete; breaks are timer-only (no activity log).

**Reference flow (defaults):**

| Phase | Default duration | Notes |
|-------|------------------|-------|
| **Focus** | 25 min | Tied to a life area; note required to log |
| **Short break** | 5 min | After each focus session except every 4th |
| **Long break** | 15 min | After every 4 completed focus sessions (user-configurable 15–30 min) |

**Product principles (unchanged from Phase 10):**

- **One timer at a time** — focus or break, never both.
- **Area-first for focus** — pick a life area before a focus interval; breaks have no area.
- **Calm tone** — skipping a break or resetting mid-interval is fine; no streaks or shame.
- **Alarm is helpful, not punishing** — rings when time is up; user dismisses or starts the next phase.

**Legend:** 🔲 not started · 🟡 in progress · ✅ done

### 13.1 — Pomodoro cycle logic

- [x] `PomodoroPhase` type: `focus` | `short_break` | `long_break`
- [x] Cycle counter: track focus sessions completed in current cycle (1–4); reset after long break
- [x] `getNextPhase(completedFocusCount, settings)` — short break vs long break after focus
- [x] Default durations: focus 25, short break 5, long break 15; long break after every 4 focus sessions
- [x] Unit tests for phase transitions and edge cases (`src/lib/pomodoro.test.ts`)

### 13.2 — Timer controls (start, pause, resume, reset)

- [x] **Start** — begin countdown for current phase (focus requires area + optional preset; breaks auto-use break duration)
- [x] **Pause / Resume** — extend existing focus pause/resume to all phases; elapsed time survives refresh (focus stays in DB; break state in localStorage or lightweight client store for v1)
- [x] **Reset** — restart **current interval** from full duration without ending the Pomodoro run or losing area/note draft
- [x] **Skip break** / **Start focus early** — optional calm shortcuts to jump to next focus phase
- [x] Disable Start on a new focus session while another focus session is active (existing guard)

### 13.3 — Alarm when timer ends

- [x] Detect `remaining === 0` while running; transition to **alarm ringing** state (do not auto-pause elapsed past target silently)
- [x] Play alarm sound via Web Audio API or bundled audio file (works after user gesture / Start)
- [x] Repeat alarm until user taps **Dismiss** or **Start next** (Pomofocus-style)
- [x] Visual “Time’s up” state on timer ring + clear CTA (Start break / Start focus / Dismiss alarm)
- [x] Optional: flash document title when alarm is ringing (tab in background)
- [x] Respect **Sound on complete** setting (Phase 13.5); off = visual-only completion

### 13.4 — Timer UI (`/focus`)

- [x] Phase indicator — pill or label: **Focus** · **Short break** · **Long break** + “Pomodoro 2 of 4” during focus cycles
- [x] Distinct ring colors: focus (indigo) vs break (green/teal) — calm palette, not gamified
- [x] Control bar: **Start** | **Pause** | **Resume** | **Reset** (contextual — e.g. Reset only when paused or after alarm)
- [x] Focus phase: keep area picker, session note, Complete → logs activity (Phase 10 behavior)
- [x] Break phase: minimal UI — countdown, Pause/Resume/Reset, Skip break; no note required
- [x] After focus alarm: prompt to **Complete & log** (note) before or while offering break
- [x] Update **Active session banner** — show break vs focus and remaining time

### 13.5 — Settings (`/settings`)

- [x] **Focus length** — default 25 min (15 / 25 / 45 / custom)
- [x] **Short break** — default 5 min
- [x] **Long break** — default 15 min (range 15–30)
- [x] **Long break interval** — default every 4 focus sessions
- [x] **Alarm sound** — on/off (default **on** for Pomodoro; differs from Phase 10 draft default)
- [x] **Auto-start next phase** — off by default; when on, start break/focus automatically after alarm dismiss
- [x] Store prefs in `localStorage` for v1 (`src/lib/pomodoro-settings.ts`)
- [x] **Appearance** — Day / Night toggle in the sidebar and mobile nav; Settings still offers System (`localStorage` key `compass-theme`)

### 13.6 — Persistence & integration

- [x] Persist Pomodoro run state client-side: current phase, cycle count, break elapsed (localStorage) so refresh mid-break recovers
- [x] Focus sessions continue using `FocusSession` + server actions for pause/resume/complete
- [x] Only **completed focus** intervals create `ActivityLog` rows (breaks never log)
- [x] Completing focus increments cycle counter; starting long break resets counter to 0

### 13.7 — Polish & docs

- [x] Unit tests for alarm trigger timing and reset math
- [x] Empty / first-visit hint on `/focus` explaining Pomodoro flow
- [x] Update README + `docs/architecture.md` with Pomodoro state diagram
- [ ] Smoke test: 4 focus → long break cycle, alarm fires, pause/resume/reset on focus and break

**Out of scope for Phase 13:** Task lists with estimated pomodoros (Pomofocus tasks), background timer when browser closed, push notifications, custom alarm sound library, yearly reports, webhook integrations.

**Suggested build order:** 13.1 (logic) → 13.5 (settings) → 13.2 + 13.3 (controls + alarm) → 13.4 (UI) → 13.6 (persistence) → 13.7 (polish).

**Depends on:** Phase 10 focus timer (10.1–10.3) ✅. Can ship before or after Phase 11 deploy / Phase 12 auth.
