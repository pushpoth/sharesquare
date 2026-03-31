session: 1 | 2026-03-31 | completed: TASK-001

decisions:

- Migrated SPA off Next.js App Router in place: all `next/link` and `next/navigation` usage replaced with `react-router-dom`; routing centralized in `src/AppRoutes.tsx`.
- ESLint flat config uses `typescript-eslint` + React hooks; `.next`, `out`, `dist` ignored. `react-refresh/only-export-components` off (context + hook exports are intentional).
- Settings import success uses `window.location.reload()` instead of Next `router.refresh()`.

discoveries:

- api: React Router `useSearchParams` API differs from Next (tuple destructuring).
- other: `@tailwindcss/vite` requires the `tailwindcss` package for `@import "tailwindcss"` resolution.

next session:

- start with: Batch 1 remainder — TASK-002 (ESLint/Jest formal alignment per tasks.md), TASK-003 (vite-plugin-pwa)
- check first: `agentdocs/tasks.md` ### TASK-002 / TASK-003 acceptance criteria vs current `jest.config.ts` / `eslint.config.mjs`
- watch out: TASK-002 asks for Jest 29 wording; repo uses Jest 30 — confirm with design or align docs
