# ShareSquare v1.0 — release handoff

**Released:** 2026-03-31 · **Version:** 1.0.0 (`context.json` `product_version`, `release`)

## What shipped

- **60/60 tasks** from `tasks.md` v1.0 are done; `context.json` phase **`RELEASE`**, status **`complete`**.
- Living documentation is aligned at **v1.0**: `spec.md`, `design.md`, `tasks.md`, `requirements.md` (linked to spec v1.0).
- MVP scope: Vite/React PWA, Supabase Auth + Postgres + RLS, groups/expenses/settlements/activity, export/import, display currency (localStorage, no FX), admin group delete, group detail invite + add-expense shortcut.

## Next (post–v1.0)

- Production QA on a real Supabase project (OAuth redirects, RLS smoke tests, PWA install).
- Optional backlog: clipboard fallback for invite copy (REQ-030 edge case); TanStack Query; offline sync (out of MVP spec).

## Git

- Push **`main`** to **`origin`** after the v1.0 documentation commit so the tag matches published history.
