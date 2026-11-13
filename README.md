# Compass

**[Live demo](https://compass-demo-tau.vercel.app)**: no sign-in needed; it opens as the sample user John Smith.

A personal focus and life-balance app. Open it first thing in the morning and know what to focus on today — not because you have the most tasks, but because some parts of your life need attention.

**Not a generic todo app.** Compass shows when you are over-focusing on one area and neglecting others.

## MVP features

- **Life areas** — weekly targets and priorities; add custom areas beyond the six defaults
- **Activity logging** — log time by area, date, duration, and note (manual entry only)
- **Focus timer** — Pomodoro flow (25/5/15 min): focus tied to a life area, short/long breaks, alarm on complete, auto-log + note
- **Dashboard** — unified home: Today's Focus, life-area overview, weekly stats, right panel (desktop)
- **Balance signals** — neglected, behind, on track, over-focused

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL on **Neon** |
| Hosting | **Vercel** (Next.js app, Phase 11) |
| Styling | Tailwind CSS v4 |

## Setup

**Requirements:** Node.js 18+

**Database (Neon — recommended):**

1. Create a project at [neon.tech](https://neon.tech)
2. Copy **pooled** and **direct** connection strings into `.env` (see `.env.example`)
3. Then:

```bash
cd compass
npm install
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

First visit: the **Dashboard** (`/`) shows Today's Focus, weekly balance, and quick-log shortcuts.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — focus cards, life areas, weekly summary, right panel (tablet+) |
| `/areas`, `/areas/[slug]` | Life areas list and detail |
| `/activities` | Activity logging (form + this week's logs) |
| `/tasks` | Tasks |
| `/focus` | Pomodoro timer — focus + breaks, alarm, one life area at a time |
| `/settings` | Pomodoro timer settings (durations, alarm, auto-start) |
| `/log` | Redirect → `/activities` |
| `/dashboard` | Redirect → `/` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run vercel-build` | Migrate + build (used by Vercel deploy) |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:migrate:deploy` | Apply migrations (Neon / production) |
| `npm run db:seed` | Seed default life areas |
| `npm run db:studio` | Open Prisma Studio |
| `npm test` | Run recommendation unit tests |

## Data & deployment

| Environment | Database |
|-------------|----------|
| Local dev | Neon (same project or dev branch) |
| Production | Neon + Vercel (`DATABASE_URL` + `DIRECT_URL` in Vercel env) |

**Deploy order:** Neon project → migrate + seed → auth env vars → Vercel. See [docs/tasks.md](./docs/tasks.md) Phase 11.

**Vercel env vars (all required for Production):** `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_EMAIL`, `AUTH_PASSWORD`. Redeploy after adding or changing them.

## Public demo

The app can be shown publicly as **John Smith**, a sample profile with a week of logs and two tasks. Use a **separate database** from your personal Compass data. GitHub can host the source; the running app stays on Vercel (this is not a static site).

1. Publish the Git repo. `.env` stays gitignored — never commit real credentials.
2. Create a new Neon database named `compass_demo`.
3. Point that deployment at it: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and its own auth env vars. Keep those off the personal deployment.
4. Apply the schema and sample data:

```bash
npm run db:migrate:deploy
npm run db:seed:demo
```

`db:seed:demo` refuses to run unless that demo auth is set and the database name is `compass_demo`. When it runs, it replaces the demo logs and tasks so the sample week stays on the current dates.

5. Deploy that environment to Vercel.

Visitors open the site root — there is no separate demo URL and no sign-in form. `/login` on that host redirects into the John Smith session. The sidebar name and greeting are labeled as a public demo.

## Current status

**MVP complete (Phases 0–7).** Phase 9 dashboard UI largely complete. Phase 10 focus timer + Phase 13 Pomodoro flow shipped.

| Phase | Status |
|-------|--------|
| Phases 0–7 | Done |
| Phase 8 — Future integrations | Not started (by design) |
| Phase 9 — Dashboard UI redesign | Largely done (cleanup optional) |
| Phase 10 — Focus timer | Done (settings moved to Phase 13) |
| Phase 13 — Pomodoro timer | Done |
| Phase 11 — Deployment | In progress |

See [docs/tasks.md](./docs/tasks.md) for the full checklist — **Phase 11** covers Vercel, Neon, and CI.

## Documentation

**Agents:** read [AGENTS.md](./AGENTS.md) first.

| Doc | Description |
|-----|-------------|
| [docs/context.md](./docs/context.md) | Product vision, life areas, scope |
| [docs/architecture.md](./docs/architecture.md) | Data models, routes, recommendation logic |
| [docs/tasks.md](./docs/tasks.md) | Implementation phases |
| [docs/decisions.md](./docs/decisions.md) | Decision log |

## Future ideas (Phase 8)

- Fitbit / health tracker integration
- Google Calendar integration
- AI-assisted daily planning
- Push notifications / morning reminders
- JSON export / backup
- Streaks and historical trends
