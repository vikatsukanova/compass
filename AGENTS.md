# AGENTS.md — Compass

Instructions for AI agents. **Read the docs before coding.**

## 1. Required reading (in order)

1. [docs/context.md](./docs/context.md) — product vision, life areas, scope
2. [docs/architecture.md](./docs/architecture.md) — data models, routes, recommendation logic
3. [docs/tasks.md](./docs/tasks.md) — **do the next unchecked Phase 9 task** unless the user specifies otherwise
4. [docs/decisions.md](./docs/decisions.md) — locked-in choices

## 2. Project purpose

Compass is a personal focus and life-balance app. The user opens it first thing in the morning and knows what to focus on today. It tracks life areas (Health, Learning, Creativity, Work, etc.) with weekly targets and surfaces when one area gets too much attention while others are neglected.

**This is not a generic todo app.** The core value is balance awareness — showing over-focus and neglect across life areas, not maximizing task throughput.

## 3. How the AI agent should work

1. Check [docs/tasks.md](./docs/tasks.md) for the current phase and next unchecked item.
2. Build **vertical slices** — one feature end-to-end (schema → logic → UI) before moving on.
3. Keep diffs minimal; match existing patterns once code exists.
4. After every major change, update [docs/tasks.md](./docs/tasks.md) and, if architecture shifts, [docs/architecture.md](./docs/architecture.md) and [docs/decisions.md](./docs/decisions.md).
5. Run the project's build/lint commands before finishing. Do not commit unless asked.

## 4. Rules

| Rule | Detail |
|------|--------|
| **Keep MVP small** | Ship manual logging, weekly progress, morning focus, and simple recommendations first. No scope creep. |
| **Update docs when architecture changes** | Models, routes, or recommendation logic changes → update `docs/architecture.md`. |
| **No external integrations unless requested** | No Fitbit, Google Calendar, AI planning, or push notifications in MVP. |
| **Prefer simple readable code** | Straightforward functions over clever abstractions. One obvious way to do things. |
| **Build vertical slices** | Complete one phase (e.g. activity logging) before starting the next. |
| **Update tasks after major changes** | Check off completed items; add new tasks if scope emerges. |

## 5. When to ask the user

- Tech stack choice (still a placeholder)
- Changing life areas, targets, or recommendation rules
- Adding integrations or notifications
- Destructive migrations, git commit/PR
