session: 15 | 2026-03-31 | completed: TASK-041, TASK-042, TASK-043

decisions:
  - GroupCreateForm / InviteCodeInput: duplicate user-visible errors via inline `role="alert"` plus `showToast(..., "error")` so TASK-036 feedback applies alongside form copy.
  - InviteCodeInput: short-circuit submit when `navigator.onLine === false` (no `joinGroup` call).

next session:
  - start with: Batch 15 — TASK-044, TASK-045 (Landing/Login page + Dashboard/Home per tasks paths vs existing `src/app/page.tsx` + `src/app/home/page.tsx`)
  - check first: tasks.md still references `src/pages/*` — repo uses `src/app/` routes; align implementation or task text in evolve if needed
  - watch out: TASK-044 AC (no Google Identity Services; redirect if session)
