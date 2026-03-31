session: 18 | 2026-03-31 | completed: TASK-048, TASK-049, TASK-050

decisions:
  - Closed Batch 17 in one session: add/edit expense routes were already wired in AppRoutes; TASK-048 gap was explicit read-only group context when `?groupId=` preselects; TASK-049/050 verified + RTL tests added.

discoveries:
  - other: `AddExpenseClient.test.tsx` dexie `useLiveQuery` shim can trigger React `act` console warnings when promises resolve after mount; tests still pass; can tighten shim with `startTransition` or extra `waitFor` if noise matters.

next session:
  - start with: Batch 18 — TASK-051, TASK-052, TASK-053 (settings export/import, router/providers hardening, charts)
  - check first: `src/app/settings/page.tsx` vs tasks.md sign-out AC for TASK-051
  - watch out: Session touched many files (budget F≥8); next batch may deserve a fresh session if context is heavy
