session: 19 | 2026-04-01 | completed: TASK-051, TASK-052, TASK-053

decisions:
  - Settings sign-out awaits `logout()` (Supabase `signOut` + local clear) before `navigate(ROUTES.LANDING, { replace: true })` to satisfy REQ-002 ordering.
  - `AppRoutes` smoke tests mock page modules with `{ __esModule: true, default: Stub }` so Jest ESM interop does not pass a plain object as `element.type`.

discoveries:
  - other: `CategoryChart` must compute all `useMemo` hooks before any early return (empty state) to satisfy `react-hooks/rules-of-hooks`.
  - other: `FlowDiagram` uses `useId()` for SVG `marker` fragment ids so multiple instances do not clash.

next session:
  - start with: Batch 19 — TASK-058 (delete group admin)
  - check first: `batch-plan.md` · `GroupDetailClient` + `ConfirmDialog` + group repo delete semantics
  - watch out: RLS + TASK-010–013 assumptions in `tasks.md`
