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
- [2026-03-31 TASK-011] Expense payer/split writes use RPCs `create_expense_with_lines` / `update_expense_with_lines`; apply migration `20260331150000_expense_write_rpcs.sql` after the initial schema migration.
- [2026-04-01 TASK-014] Browser reads `VITE_*` for repos via `src/env-shim.ts` (imported from `main.tsx`); Jest uses `process.env` only — do not put `import.meta` in `readEnv.ts`.
- [2026-04-01 TASK-056] RLS invite/join audit: `agentdocs/rls-invite-join.md` + `supabase/README.md` — non-members cannot `SELECT` `groups`; join uses RPC + controlled `group_members` inserts.
- [2026-04-01 TASK-015] Supabase Auth UI only when `isSupabaseAuthConfigured()` is true (not the Jest default `https://test.supabase.co` URL).
- [2026-04-01 TASK-016] `normalizeCode` inserts a hyphen for exactly 8 alphanumeric characters so `ABCD1234` matches stored `ABCD-1234`.
- [2026-04-01 TASK-055] `on_auth_user_created` + `handle_new_user()` inserts into `public.profiles` with `ON CONFLICT (id) DO NOTHING`; client `ensureProfile()` remains the idempotent upsert for OAuth name/avatar refresh.
- [2026-04-01 TASK-019] Settings **export** uses `exportAllData(repositories, currentUser.id)` so Supabase mode exports RLS-visible data, not a raw Dexie dump.
- [2026-04-01 TASK-020] **Import** uses `ImportDataWriter`; `createDexieImportWriter(db)` backs the Settings page — a Supabase-backed writer is not wired yet when `VITE_USE_SUPABASE_REPOS=true`.
- [2026-04-01 TASK-022] With Supabase Auth, `AuthContext.session` tracks `Session | null` from `getSupabaseSession` / `onAuthStateChange`; `authService` still mirrors user id to `localStorage` for the demo/offline path, not as the only source when Supabase is active.
- [2026-04-01 TASK-024] `useGroups` uses `useEffect` + `refetch` (not `useLiveQuery`) per tasks.md; `createGroup` retries on `DuplicateError` or Postgres-style unique messages after `generateUniqueCode`.
- [2026-04-01 TASK-026] `useBalances` / `useOverallBalances` load expenses/settlements/payers/splits through `RepositoryBundle`, not `db`, so Supabase-backed repos work; list hooks still use `useLiveQuery` for Dexie reactivity.
- [2026-04-01 TASK-025-T027] Hook tests that mock only repositories jest-mock `dexie-react-hooks` `useLiveQuery` to resolve async callbacks (real hook waits on Dexie observation).
- [2026-04-02 TASK-029] BottomNav uses `NavLink` with `end={false}` only for `ROUTES.GROUPS` so `/groups/:id` keeps Groups active; other tabs use `end` for exact segment match.
- [2026-03-31 TASK-031] RTL tests for `<img onError>` should use `fireEvent.error(img)` inside `act(...)` so the fallback-to-initials state update is flushed (raw `dispatchEvent` does not run React’s `onError` the same way).
- [2026-03-31 TASK-037] `SplitSelector` `readOnly` must not disable the “Split equally” checkbox when `ExpenseForm` passes `readOnly={splitEqually}` — otherwise users cannot switch to custom splits (amount inputs stay read-only only while equal mode is on).
- [2026-03-31 TASK-042] `InviteCodeInput` checks `navigator.onLine` before `joinGroup`; in Jest restore `navigator.onLine` after tests that set it to `false`.
- [2026-03-31 TASK-044] Unauthenticated landing is `src/app/page.tsx` (`/`); when `isAuthenticated`, render `<Navigate to={ROUTES.HOME} replace />` instead of an empty fragment after `useEffect` redirect.
- [2026-03-31 TASK-047] For Jest + a client page under test: avoid top-level `import` of the SUT if mocks need stable objects defined in the same file — use post-mock `require("./Component").default` and self-contained `jest.mock` factories; for `navigator.clipboard.writeText`, prefer `jest.spyOn(navigator.clipboard, "writeText")` when jsdom exposes it.
