# Compass — Architecture

> **Status:** Feature-complete for personal use. **Next:** Phase 11 — deployment (SQLite needs persistent disk or DB migration).

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| ORM | Prisma |
| Database | SQLite (local file) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React (when UI is built) |
| Runtime | Node.js (local dev; Phase 11 — production deploy) |

Principles: local-first, single user, no external APIs in MVP.

## Suggested data models

### LifeArea

Represents a tracked part of life (Health, Learning, etc.).

| Field | Type | Notes |
|-------|------|-------|
| `id` | string/uuid | Primary key |
| `name` | string | Display name |
| `slug` | string | URL-safe identifier |
| `weeklyTarget` | number | Goal for the current week |
| `targetUnit` | enum | `hours` \| `sessions` \| `count` |
| `priority` | enum | `high` \| `medium` \| `low` |
| `sortOrder` | number | Display order |
| `isActive` | boolean | Soft hide without delete |
| `createdAt` / `updatedAt` | datetime | Audit |

### ActivityLog

Manual time/activity entry tied to a life area.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string/uuid | Primary key |
| `lifeAreaId` | FK → LifeArea | Required |
| `date` | date | Calendar day of the activity |
| `durationMinutes` | number | Optional if unit is sessions/count |
| `note` | string? | Free text |
| `createdAt` / `updatedAt` | datetime | Audit |

For session/count-based areas, one log row = one session or one touchpoint (duration optional).

### FocusSession (Phase 10 — planned)

In-app timed focus on **one life area at a time**. Completed sessions produce an `ActivityLog`.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string/uuid | Primary key |
| `lifeAreaId` | FK → LifeArea | Required |
| `startedAt` | datetime | When session began |
| `endedAt` | datetime? | Set on complete/cancel |
| `plannedMinutes` | number | User-chosen target (e.g. 25) |
| `elapsedSeconds` | number | Excludes paused time |
| `status` | enum | `running` \| `paused` \| `completed` \| `cancelled` |
| `activityLogId` | FK → ActivityLog? | Set when completed and log created |
| `note` | string? | Free text; **required** non-empty when completing session; copied to `ActivityLog` |
| `createdAt` / `updatedAt` | datetime | Audit |

**Invariant:** at most one session with `status` in (`running`, `paused`) per user (single-user app → one row globally).

**Complete rule:** `completeFocusSession` fails if `note` is missing or whitespace-only.

### Task

Open work item connected to a life area.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string/uuid | Primary key |
| `lifeAreaId` | FK → LifeArea | Required |
| `title` | string | Short description |
| `dueDate` | date? | Optional |
| `isUrgent` | boolean | Surfaces in Today's Focus |
| `status` | enum | `open` \| `done` |
| `completedAt` | datetime? | Set when done |
| `createdAt` / `updatedAt` | datetime | Audit |

## Pages / routes

| Route | Purpose |
|-------|---------|
| `/` | **Unified Dashboard** — greeting, Today's Focus, life areas table, weekly summary; right panel on tablet+ |
| `/areas` | Life Areas management |
| `/areas/[slug]` | Area detail — logs, tasks, edit |
| `/activities` | Activity logging (nav: "Activities"; `/log` redirects here) |
| `/tasks` | Tasks |
| `/settings` | App preferences (stub) |
| `/focus` | **Focus timer** — one area at a time, Pomodoro-style (Phase 10) |
| `/dashboard` | Redirect → `/` (preserves `?week=`) |
| `/log` | Redirect → `/activities` |

Calendar and Insights are not in the sidebar. They stay out until those features exist, so the nav fits without scrolling.

**Legacy:** Morning view and `/dashboard` as separate pages were merged into `/` in Phase 9.

## Target layout (Phase 9 wireframe)

```
┌──────────┬─────────────────────────────────────┬──────────────────┐
│ Compass  │  Good morning · May 12              │  Urgent Tasks    │
│          │  Here's what matters today            │  ☐ Task …        │
│ Dashboard│ ┌─ Today's Focus ─────────────────┐  │  ☐ Task …        │
│ Life Areas│ │ 1 Health · No activity in 9 days │  │                  │
│ Activities│ │ 2 Learning · Behind this week   │  │  Quick Log       │
│ Tasks    │ │ 3 Creativity · High priority    │  │  [He][Le][Cr]…    │
│ Focus    │ └────────────────────────────────┘  │                  │
│ Settings │ ┌─ Life Areas Overview ──────────┐  │  Recommended     │
│          │ │ Health   ████░░  2/3  Behind    │  │  focus           │
│          │ │ Learning ██░░░░  1/5  Neglected │  │                  │
│          │ └────────────────────────────────┘  │                  │
│ ──────── │ ┌ Weekly Summary ────────────────┐  │  (quote card)    │
│ Me       │ │ 12 logged · 5 on track · …     │  │                  │
└──────────┴─────────────────────────────────────┴──────────────────┘
```

**Desktop:** the dashboard fills the viewport and does not scroll as a page. Life area rows and today's tasks scroll inside their sections. Fixed left nav (~220px) + fluid main + right panel (~320px).  
**Tablet:** main + right panel stack. **Mobile:** the dashboard page scrolls; quick log via dashboard section or FAB.

## Recommendation logic

Computed from activity logs for the **current calendar week** (Mon–Sun or configurable) and the **last 7 days** for neglect detection.

### Area status (per life area)

| Status | Condition |
|--------|-----------|
| **Neglected** | 0 logs in the last 7 days |
| **Behind** | Below 50% of weekly target by midweek (Wed 00:00 or later) |
| **On track** | At or above weekly target, OR before midweek and pace is reasonable |
| **Over-focused** | Way above target (e.g. ≥ 150% of weekly target) **while** at least one **high-priority** area is neglected |

"Way above" threshold: suggest 150% of weekly target; tune during implementation.

### Today's Focus priority order

1. High-priority **neglected** areas
2. High-priority **behind** areas
3. **Urgent** open tasks (any area)
4. Medium-priority **neglected** areas

Within each tier, sort by priority level then by how far behind / how long neglected.

Morning view shows 3–5 focus items max to avoid overwhelm.

### Helper functions (suggested)

```
getWeekBounds(date) → { start, end }
getAreaProgress(areaId, week) → { logged, target, percent }
getAreaStatus(area, logs, week, allAreas) → neglected | behind | on_track | over_focused
getTodaysFocus(areas, logs, tasks, date) → FocusItem[]
```

## Focus timer flow (Phase 10 + 13)

```
Dashboard / Today's Focus          /focus
        │                              │
        └─ "Start timer" (area) ──────►│  Pick area → Focus (25 min default)
                                       │  Pause · Resume · Reset · Complete
                                       │  Alarm at 0:00 → Complete & log
                                       ▼
                              ActivityLog created
                                       │
                                       ▼
                              Short break (5 min) or Long break (15 min after 4)
                                       │  Pause · Resume · Reset · Skip
                                       ▼
                              Alarm → Start next focus
```

**Pomodoro defaults:** 25 min focus · 5 min short break · 15 min long break every 4 focus sessions. Settings in `/settings` (localStorage). Break timers persist in localStorage; focus sessions in Postgres via `FocusSession`.

**UI sketch:**

```
┌─────────────────────────────────────┐
│  ← Back          Learning           │
│                                     │
│            ╭─────────╮              │
│            │  18:42  │              │
│            ╰─────────╯              │
│         25 min focus session        │
│                                     │
│  What did you focus on? *           │
│  ┌─────────────────────────────┐  │
│  │ Chapter 3 vocabulary…       │  │
│  └─────────────────────────────┘  │
│                                     │
│     [ Pause ]    [ Complete ]       │
│                  (needs note)       │
└─────────────────────────────────────┘
```

App shell shows a small **"Focusing: Learning"** chip when a session is active (any page).

## Component structure (suggested)

### Current

```
src/components/
├── layout/       app-nav, mobile-nav, page-shell
├── dashboard/    weekly-progress-card, area-status-badge, week-selector
├── morning/      todays-focus
├── areas/        area-card, area-form
├── logs/         log-form, activity-log-list
└── tasks/        task-form, task-list
```

### Target (Phase 9)

```
src/components/
├── layout/
│   ├── app-shell.tsx           # three-column wrapper
│   ├── app-nav.tsx             # left sidebar (updated labels + Soon badges)
│   ├── mobile-nav.tsx
│   ├── right-panel.tsx         # urgent tasks, quick log, recommended focus
│   └── page-shell.tsx
├── dashboard/
│   ├── dashboard-header.tsx    # greeting + date
│   ├── focus-cards.tsx         # ranked Today's Focus (top 3)
│   ├── life-areas-table.tsx    # overview table
│   ├── weekly-summary.tsx      # four stat tiles
│   └── quick-log-grid.tsx
├── focus/                          # Phase 10
│   ├── focus-timer.tsx             # countdown + controls
│   ├── focus-area-picker.tsx
│   ├── active-session-banner.tsx   # shell chip when running
│   └── focus-complete.tsx          # success + link to log/area
├── logs/
│   └── quick-log-dialog.tsx    # opened from grid / Other
└── lib/
    └── area-icons.ts           # slug → Lucide icon
```

## Future integrations

| Integration | Purpose | Phase |
|-------------|---------|-------|
| Focus timer | Timed sessions, one area at a time, auto-log | Phase 10 |
| Google Calendar | Auto-suggest Work hours; block focus time | Post-MVP |
| Fitbit / Apple Health | Auto-log Health and movement | Post-MVP |
| AI planning | Suggest daily focus from patterns | Post-MVP |
| Notifications | Morning reminder to open app | Post-MVP |

Do not add these until explicitly requested. See [decisions.md](./decisions.md).
