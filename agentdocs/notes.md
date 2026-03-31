# Project Notes: sharesquare

> Append-only. Format: `[YYYY-MM-DD TASK-NNN] <fact>`

- [2026-03-31 TASK-001] App entry is Vite 6: `index.html` → `src/main.tsx` → `BrowserRouter` → `Providers` → `AppRoutes`. Legacy Next.js layout and `src/app/globals.css` removed; tokens live in `src/styles/globals.css` with `@tailwindcss/vite`.
- [2026-03-31 TASK-001] `react-router-dom` v7 `useSearchParams()` returns a tuple; use `const [searchParams] = useSearchParams()` for `.get()`.
- [2026-03-31 TASK-001] Jest + `react-router-dom` needs `TextEncoder` / `TextDecoder` on `globalThis` (`jest.setup.ts`).
- [2026-03-31 TASK-002] Global RTL matchers: `import "@testing-library/jest-dom"` in `jest.setup.ts` via `setupFilesAfterEnv`.
- [2026-03-31 TASK-003] PWA manifest is `public/manifest.json`; `vite.config.ts` parses it into `vite-plugin-pwa` so build output `dist/manifest.json` + injected `<link rel="manifest">` and `registerSW.js` stay aligned.
- [2026-03-31 TASK-006] `formatCurrency(cents, currencyCode?)` uses `Intl.NumberFormat("en-US", { style: "currency", currency })` — locale fixed to en-US; currency code is the multi-currency knob.
- [2026-03-31 TASK-006] `isValidUuid` checks 8-4-4-4-12 hex shape only (not RFC version/variant strictness).
- [2026-03-31 TASK-007] RLS: `groups` SELECT only for members; use `find_group_by_invite_code(p_code)` for authenticated join lookup. `create_group_with_admin(name, invite_code)` is SECURITY DEFINER for atomic group + admin member.
- [2026-03-31 TASK-007] Postgres columns: `expense_splits.amount_owed`, `profiles.display_name` (map to `User.name` in TS).
