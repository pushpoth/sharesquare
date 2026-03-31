# Tasks: ShareSquare

> Version: 0.3 | Status: Draft | Last updated: 2026-03-31
> Implements: spec.md v0.2 | design.md v0.3

---

## Summary

| Status       | Count |
| ------------ | ----- |
| ⬜ Pending   | 60    |
| 🔄 In Progress | 0   |
| ✅ Done      | 0     |

---

## Task List

---

### INFRASTRUCTURE

---

### TASK-001: Initialize Vite project with React, TypeScript, and Tailwind CSS

**Phase:** infra
**Effort:** M
**Status:** ✅ Done
**Implements:** REQ-026, REQ-027
**Depends on:** none

**Description:**
Scaffold a **Vite 6** project with **React** and **TypeScript**. Add **Tailwind CSS 4** with the ShareSquare color palette tokens from design.md (`primary`, `primary-dark`, `primary-light`, `accent`, `surface`, `text-primary`, etc.). Create `src/styles/globals.css` with Tailwind directives. Configure `tsconfig.json` with path aliases (`@/` → `src/`). Create `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders (no secrets). Add `index.html` at repo root. Update `.gitignore` for Vite/Node.

**Acceptance Criteria:**

- [x] `npm run dev` starts the Vite dev server (default port 5173) without errors
- [x] `npm run build` produces a static `dist/` output
- [x] TypeScript strict mode is enabled
- [x] Tailwind CSS classes render correctly with custom color tokens
- [x] Path aliases `@/` resolve to `src/`

**Test Plan:**

- **Unit:** N/A (project scaffold)
- **Manual:** Verify dev server, build, Tailwind classes apply

---

### TASK-002: Configure ESLint, Prettier, and Jest testing framework

**Phase:** infra
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-024
**Depends on:** TASK-001

**Description:**
Set up **ESLint 9** with TypeScript and React (Vite-appropriate config — not Next.js plugins). Configure Prettier. Set up **Jest 30** with **React Testing Library 16**, `jest.config.ts` (e.g. `ts-jest` or `babel-jest`), `jest.setup.ts` (RTL matchers), and module name mapping for `@/` aliases. Add npm scripts: `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `test:coverage`, `typecheck`.

**Acceptance Criteria:**

- [x] `npm run lint` runs ESLint with zero errors on scaffolded code
- [x] `npm run format:check` passes
- [x] `npm test` runs Jest with zero configuration errors
- [x] A sample test file passes (`src/__tests__/setup.test.ts`)
- [x] `npm run typecheck` succeeds

**Test Plan:**

- **Unit:** Sample test `expect(true).toBe(true)` passes
- **Manual:** Run all lint/format/test commands

---

### TASK-003: Configure PWA with vite-plugin-pwa

**Phase:** infra
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-025
**Depends on:** TASK-001

**Description:**
Install **`vite-plugin-pwa`** (Workbox-based). Configure precaching of the **app shell and static assets** in `vite.config.ts`. Create `public/manifest.json` with app name "ShareSquare", theme color, background color, display `standalone`, and icon placeholders (192x192, 512x512). Register the plugin so a service worker is generated on `npm run build`. Inject manifest link and meta tags via `index.html` or Vite plugin options.

**Acceptance Criteria:**

- [x] Service worker is generated during `npm run build`
- [x] `manifest.json` is served with correct fields
- [x] App is installable as PWA over HTTPS (or localhost)
- [x] Documentation states **online-first** data (no requirement for offline expense CRUD)

**Test Plan:**

- **Manual:** Build, preview, verify SW in DevTools → Application
- **Manual:** Lighthouse PWA audit (target strong installability / PWA score)

---

### TYPES, CONSTANTS, & UTILITIES

---

### TASK-004: Define TypeScript types for all entities

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-023, REQ-024
**Depends on:** TASK-001

**Description:**
Create type definition files aligned with **design.md** (Postgres-backed domain types). Files: `src/types/user.ts`, `group.ts`, `expense.ts`, `settlement.ts`, `activity.ts`. All monetary fields use `number` (**integer cents**). **`User.id`** is **UUID** string (matches `auth.users.id`). Export barrel `src/types/index.ts`.

**Acceptance Criteria:**

- [x] Entity interfaces match the logical schema in design.md §6
- [x] `GroupMember.role` is `'admin' | 'member'`
- [x] `ActivityEntry.type` is the full union of activity types
- [x] Expense, payer, split, settlement amounts are `number` (cents)
- [x] All types export from `src/types/index.ts`

**Test Plan:**

- **Unit:** `npm run typecheck` succeeds

---

### TASK-005: Create application constants

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-027, REQ-028
**Depends on:** TASK-001

**Description:**
Create `src/constants/categories.ts` (9 categories with `value`, `label`, `icon`). Create `src/constants/routes.ts` with route paths matching **React Router** (`/`, `/home`, `/groups`, `/groups/:id`, `/expenses/new`, `/expenses/:id/edit`, `/activity`, `/settings`). Create `src/constants/colors.ts` for programmatic Tailwind token references.

**Acceptance Criteria:**

- [x] `EXPENSE_CATEGORIES` length === 9 with required fields
- [x] `ROUTES` covers all pages
- [x] Constants importable from `@/constants/...`

**Test Plan:**

- **Unit:** Category list and routes keys sanity checks

---

### TASK-006: Implement utility functions

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-013, REQ-008, REQ-009
**Depends on:** TASK-001

**Description:**
Create `src/utils/currency.ts`: `centsToDollars`, `dollarsToCents`, `formatCurrency(cents, currencyCode?)` (support multi-currency display per REQ-032). Create `src/utils/dateUtils.ts`: `formatDate`, `relativeTime`, `isToday`, `toISODate`. Create `src/utils/validation.ts`: `validateSplitsSum`, `validateAmount`, `validateRequired`. **Do not** use `nanoid` for primary keys — UUIDs come from Postgres / `auth.users`. Optional: `isValidUuid` helper. Co-located `.test.ts` files.

**Acceptance Criteria:**

- [x] `formatCurrency(12500)` works for default USD
- [x] `dollarsToCents(125.00)` returns `12500`
- [x] `validateSplitsSum` fails when splits ≠ total
- [x] Relative time strings are human-readable

**Test Plan:**

- **Unit:** Currency, dates, validation edge cases

---

### DATA LAYER (REPOSITORIES)

---

### TASK-007: Author Supabase SQL migrations and RLS policies

**Phase:** backend
**Effort:** M
**Status:** ✅ Done
**Implements:** REQ-023, REQ-029
**Depends on:** TASK-004

**Description:**
Add **`supabase/migrations`** (or project-documented migration path) defining: `profiles` (PK → `auth.users.id`), `groups` with **`invite_code TEXT UNIQUE NOT NULL`**, `group_members`, `expenses`, `expense_payers`, `expense_splits`, `settlements`, `activity_entries` — FKs and `ON DELETE CASCADE` where appropriate. Implement **RLS** policy *intent* from design.md: users read/update own profile; members read/write group-scoped data per rules; invite lookup policy for authenticated join flow. Optionally add RPCs `create_group_with_admin` and `create_expense_with_splits` for atomic writes. Document how to run migrations against the linked Supabase project.

**Acceptance Criteria:**

- [x] All tables and constraints from design.md §4 / §6 are represented in SQL
- [x] RLS is **enabled** on all public app tables
- [x] Policies allow: create group (authenticated), join by invite code (authenticated lookup + insert membership), CRUD expenses for group members subject to BR-03/BR-04
- [x] `invite_code` uniqueness enforced at DB level

**Test Plan:**

- **Manual:** Apply migrations on a dev project; verify with Supabase SQL editor / policy tests
- **Optional:** pgTAP or Supabase CLI tests if adopted

---

### TASK-008: Define repository interfaces

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-024
**Depends on:** TASK-004

**Description:**
Create `src/repositories/interfaces/*.ts` for `IUserRepository`, `IGroupRepository`, `IExpenseRepository`, `ISettlementRepository`, `IActivityRepository` per design.md §5. Add `src/repositories/errors.ts`: `NotFoundError`, `DuplicateError`, `ValidationError`.

**Acceptance Criteria:**

- [x] All five interfaces match design.md method signatures
- [x] Methods return `Promise<...>`
- [x] Error classes extend `Error` with `name` / optional `code`

**Test Plan:**

- **Unit:** `npm run typecheck`

---

### TASK-009: Implement Supabase profile / user repository

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-001, REQ-002, REQ-023, REQ-024
**Depends on:** TASK-007, TASK-008, TASK-006

**Description:**
Create `src/repositories/supabase/UserRepository.ts` (and `client.ts` singleton if not already present) implementing `IUserRepository`. Map `profiles` rows to `User` domain type (snake_case ↔ camelCase). `findById` uses `auth.users` id. `create` may be unused if profiles are created by trigger/upsert only — implement or document. Co-located tests with **mocked Supabase client**.

**Acceptance Criteria:**

- [x] `findByEmail` / `findById` query `profiles` under RLS
- [x] Duplicate or constraint errors map to `DuplicateError` where applicable
- [x] No Supabase calls outside this module except shared `client.ts`

**Test Plan:**

- **Unit:** Mock `@supabase/supabase-js` client responses

---

### TASK-010: Implement SupabaseGroupRepository

**Phase:** backend
**Effort:** M
**Status:** ✅ Done
**Implements:** REQ-003, REQ-004, REQ-005, REQ-006, REQ-023, REQ-024
**Depends on:** TASK-007, TASK-008, TASK-006

**Description:**
Create `src/repositories/supabase/GroupRepository.ts` implementing `IGroupRepository`: `findById`, `findByInviteCode` (case-normalized), `getByUserId`, `create` (group + admin member — RPC or multi-insert transaction), `update`, `delete`, `addMember`, `getMembers`, `isMember`. Handle **unique violation on `invite_code`** by surfacing `DuplicateError` for retry at service layer. Co-located tests with mocked client.

**Acceptance Criteria:**

- [x] `create` persists group and creator as admin
- [x] `findByInviteCode` is case-insensitive
- [x] `addMember` throws `DuplicateError` if already member
- [x] `delete` removes group and cascaded data per schema/RPC

**Test Plan:**

- **Unit:** Mock Supabase for each method
- **Integration:** Optional against real dev project

---

### TASK-011: Implement SupabaseExpenseRepository

**Phase:** backend
**Effort:** M
**Status:** ✅ Done
**Implements:** REQ-006, REQ-011, REQ-012, REQ-023, REQ-024
**Depends on:** TASK-007, TASK-008, TASK-006

**Description:**
Create `src/repositories/supabase/ExpenseRepository.ts` implementing `IExpenseRepository`. Use **transaction or RPC** for atomic create/update/delete of expense + payers + splits. `getByGroupId` ordered by date descending. Co-located tests.

**Acceptance Criteria:**

- [x] Create/update/delete maintain payer and split consistency
- [x] `getByGroupId` sort order is correct
- [x] Errors from PostgREST map to typed errors where useful

**Test Plan:**

- **Unit:** Mocked client for transactional behavior

---

### TASK-012: Implement SupabaseSettlementRepository

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-015, REQ-023, REQ-024
**Depends on:** TASK-007, TASK-008, TASK-006

**Description:**
Create `src/repositories/supabase/SettlementRepository.ts` implementing `ISettlementRepository`. Co-located tests.

**Acceptance Criteria:**

- [x] `getByGroupId` sorted by date descending
- [x] `create` / `delete` work under RLS

**Test Plan:**

- **Unit:** Mocked Supabase client

---

### TASK-013: Implement SupabaseActivityRepository

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-020, REQ-023, REQ-024
**Depends on:** TASK-007, TASK-008, TASK-006

**Description:**
Create `src/repositories/supabase/ActivityRepository.ts` implementing `IActivityRepository`. `getByUserId` returns entries for the user's groups, newest first, respects `limit`. Co-located tests.

**Acceptance Criteria:**

- [x] `log` inserts activity row
- [x] `getByUserId` ordering and limit correct

**Test Plan:**

- **Unit:** Mocked client

---

### TASK-014: Create Supabase client singleton and repository factory

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-024
**Depends on:** TASK-009, TASK-010, TASK-011, TASK-012, TASK-013

**Description:**
Create `src/repositories/supabase/client.ts` exporting a browser **`createClient`** instance using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Create `src/repositories/index.ts` that constructs all repositories with this client and exports a `repositories` object for `RepositoryContext`.

**Acceptance Criteria:**

- [x] `repositories` exposes `users`, `groups`, `expenses`, `settlements`, `activity`
- [x] **Service role key** is never imported in app source
- [x] Single shared client instance

**Test Plan:**

- **Unit:** Factory returns objects with expected methods (mock client)

---

### SERVICES

---

### TASK-015: Implement Supabase Auth session helpers

**Phase:** backend
**Effort:** M
**Status:** ✅ Done
**Implements:** REQ-001, REQ-002
**Depends on:** TASK-009, TASK-014

**Description:**
Create `src/services/authService.ts` (or split `supabaseAuth.ts`): `signInWithGoogle()` → `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })` (and/or magic link if enabled); `signOut()` → `supabase.auth.signOut()`; `getSession()`; `onAuthStateChange` subscription helper; **`ensureProfile(supabase, user)`** → upsert `profiles` from `user.user_metadata` / email after sign-in. **Remove** Google JWT decode in the app — Supabase handles OAuth. Co-located tests with mocked client.

**Acceptance Criteria:**

- [x] Sign-in and sign-out delegate to Supabase Auth
- [x] Profile upsert runs after first sign-in
- [x] No `@react-oauth/google` dependency

**Test Plan:**

- **Unit:** Mock `supabase.auth` methods and profile upsert

---

### TASK-016: Implement InviteCodeService

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-003, REQ-004, REQ-029
**Depends on:** TASK-010

**Description:**
Create `src/services/inviteCodeService.ts`. **`generateCode()`** → human-readable pattern (e.g. `XXXX-XXXX`, uppercase alphanumeric). **`normalizeCode(input)`** → uppercase, trim, strip spaces. **No HTTP calls to `/api/invite`.** Registration is **implicit** when `GroupRepository.create` inserts a row; on unique constraint failure on `invite_code`, caller regenerates and retries. Optional: thin `resolveGroupByCode` wrapper that calls `groupsRepository.findByInviteCode`.

**Acceptance Criteria:**

- [x] Generated codes match agreed regex pattern
- [x] `normalizeCode` handles lowercase and spaces
- [x] No Vercel KV or Next API usage

**Test Plan:**

- **Unit:** Regex and normalization tests

---

### TASK-017: Implement BalanceService

**Phase:** backend
**Effort:** M
**Status:** ✅ Done
**Implements:** REQ-013
**Depends on:** TASK-004, TASK-006

**Description:**
Same as prior spec: pure functions `calculateGroupBalances`, `calculateOverallBalances`, `calculatePairwiseBalances` — integer cents, no repo imports. Co-located tests.

**Acceptance Criteria:**

- [ ] Net balances correct including settlements
- [ ] Cross-group aggregation correct
- [ ] No floating-point money math

**Test Plan:**

- **Unit:** Matrix of expense/settlement scenarios

---

### TASK-018: Implement DebtSimplificationService

**Phase:** backend
**Effort:** M
**Status:** ✅ Done
**Implements:** REQ-014
**Depends on:** TASK-017

**Description:**
`debtSimplificationService.ts` — greedy net-balance algorithm per design.md §13. Co-located tests.

**Acceptance Criteria:**

- [ ] Chain and circular cases simplified correctly
- [ ] All-zero → empty result

**Test Plan:**

- **Unit:** Extensive edge cases

---

### TASK-019: Implement ExportService

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-021
**Depends on:** TASK-004, TASK-006

**Description:**
`exportService.ts`: `exportAllData(repos, userId)` fetches via repositories (Supabase-backed), builds JSON `{ version, exportedAt, users, groups, ... }`. `downloadJson` via Blob. Co-located tests with **mock repos**.

**Acceptance Criteria:**

- [ ] Schema includes `version` and `exportedAt`
- [ ] Empty data exports valid minimal JSON

**Test Plan:**

- **Unit:** Mock repos return fixtures; assert JSON shape

---

### TASK-020: Implement ImportService

**Phase:** backend
**Effort:** M
**Status:** ✅ Done
**Implements:** REQ-022
**Depends on:** TASK-004, TASK-006, TASK-019

**Description:**
`importService.ts`: `validateImportJson`, `importData(repos, data, strategy)` — writes through repositories to Supabase; handle conflicts per strategy. Co-located tests.

**Acceptance Criteria:**

- [ ] Invalid JSON fails with descriptive errors
- [ ] Overwrite/skip strategies respected (mock repos)

**Test Plan:**

- **Unit:** Validation and import with mocks

---

### TASK-021: Implement ActivityService

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-020
**Depends on:** TASK-013, TASK-006

**Description:**
`activityService.ts`: `logActivity`, `getActivityFeed`, `buildActivityDescription` — unchanged intent; uses `IActivityRepository`. Co-located tests.

**Acceptance Criteria:**

- [ ] Descriptions cover all activity types
- [ ] Limit honored

**Test Plan:**

- **Unit:** Mock repository

---

### CONTEXTS & HOOKS

---

### TASK-022: Implement AuthContext and useAuth hook

**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-001, REQ-002
**Depends on:** TASK-015

**Description:**
Create `src/contexts/AuthContext.tsx`: `user`, `session`, `isLoading`, `signIn`, `signOut`. Subscribe to **`supabase.auth.onAuthStateChange`**. On session, load/ensure profile via TASK-015 helpers and `UserRepository`. Create `src/hooks/useAuth.ts`. Tests with mocked Supabase.

**Acceptance Criteria:**

- [ ] On load, session restores from Supabase (persisted by client)
- [ ] `signIn` / `signOut` update context
- [ ] No `localStorage` user-id hack as sole source of truth (session from Supabase)

**Test Plan:**

- **Unit:** Mock auth state transitions

---

### TASK-023: Implement RepositoryContext

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-024
**Depends on:** TASK-014

**Description:**
`RepositoryContext.tsx` + `useRepositories()` hook providing the factory from `src/repositories/index.ts`. Tests.

**Acceptance Criteria:**

- [ ] Returns all five repositories
- [ ] Throws outside provider

**Test Plan:**

- **Unit:** Provider/hook tests

---

### TASK-024: Implement useGroups hook

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-003, REQ-004, REQ-005
**Depends on:** TASK-023, TASK-016

**Description:**
`useGroups.ts`: `groups`, `isLoading`, `error`, `refetch`, `createGroup`, `joinGroup`, `getGroupById`, `getGroupMembers`, `updateGroup`. Use **`useEffect` + `useState`** or **TanStack Query** (recommended in design) — **not** Dexie `useLiveQuery`. After mutations, refetch or invalidate queries.

**Acceptance Criteria:**

- [ ] `createGroup` generates code, inserts via repository, handles invite unique retry
- [ ] `joinGroup` uses `findByInviteCode` + `addMember`
- [ ] Errors surfaced for invalid code / duplicate member / network

**Test Plan:**

- **Unit:** Mock repositories / query client

---

### TASK-025: Implement useExpenses hook

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-006, REQ-011, REQ-012
**Depends on:** TASK-023, TASK-021

**Description:**
`useExpenses.ts`: fetch by group, `addExpense`, `updateExpense`, `deleteExpense`, activity logging. Refetch after mutations.

**Acceptance Criteria:**

- [ ] CRUD goes through repositories
- [ ] Activity logged on mutations

**Test Plan:**

- **Unit:** Mock repos

---

### TASK-026: Implement useBalances hook

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-013, REQ-014
**Depends on:** TASK-023, TASK-017, TASK-018

**Description:**
`useBalances.ts`: compute group and overall balances and simplified debts from fetched expense/settlement data + BalanceService / DebtSimplificationService.

**Acceptance Criteria:**

- [ ] Values in integer cents
- [ ] Updates when underlying data refetches

**Test Plan:**

- **Unit:** Mock data fixtures

---

### TASK-027: Implement useSettlements hook

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-015
**Depends on:** TASK-023, TASK-021

**Description:**
`useSettlements.ts`: list by group, `addSettlement`, `deleteSettlement`, activity logging.

**Acceptance Criteria:**

- [ ] Validation for amount > 0
- [ ] Refetch after write

**Test Plan:**

- **Unit:** Mock repos

---

### SHARED UI COMPONENTS

---

### TASK-028: Implement Header component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-005, REQ-027
**Depends on:** TASK-005, TASK-022

**Description:**
`Header.tsx`: logo, app name, **user avatar from AuthContext** (profile image URL or initials), search icon placeholder. `primary-dark` background. `data-testid` attributes. Tests.

**Acceptance Criteria:**

- [ ] Avatar uses profile/session data (not hardcoded Google-only copy)
- [ ] `data-testid="header"`

**Test Plan:**

- **Unit:** RTL with mock auth

---

### TASK-029: Implement BottomNav component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-019, REQ-027
**Depends on:** TASK-005

**Description:**
`BottomNav.tsx`: five items; use **`react-router-dom`** `NavLink` or `useNavigate` + `useLocation` for active state. Center FAB for Add Expense. Tests with **memory router**.

**Acceptance Criteria:**

- [ ] Navigation targets match `ROUTES`
- [ ] Active tab styling correct

**Test Plan:**

- **Unit:** RTL + `createMemoryRouter`

---

### TASK-030: Implement AppLayout with auth guard

**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-019, REQ-026
**Depends on:** TASK-028, TASK-029, TASK-022

**Description:**
`AppLayout.tsx`: Header, scrollable main, BottomNav. **`<Navigate to="/" replace />`** when unauthenticated (after loading). Loading spinner during auth init.

**Acceptance Criteria:**

- [ ] Redirect unauthenticated users to `/`
- [ ] Max-width container on desktop

**Test Plan:**

- **Unit:** Mock `useAuth`

---

### TASK-031: Implement MemberAvatar component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-002, REQ-005
**Depends on:** TASK-004

**Description:**
Same as before: image + initials fallback, `AvatarGroup`, broken image handling. Tests.

**Acceptance Criteria:**

- [ ] Fallback when `avatarUrl` missing or broken

**Test Plan:**

- **Unit:** RTL

---

### TASK-032: Implement BalanceCard component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-005, REQ-027
**Depends on:** TASK-006

**Description:**
Balance card with cents props; integrate **`useCurrency`** when TASK-059 lands (or hardcode `$` until then; update in TASK-059).

**Acceptance Criteria:**

- [ ] Correct formatting from cents

**Test Plan:**

- **Unit:** RTL

---

### TASK-033: Implement GroupCard component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-005, REQ-027
**Depends on:** TASK-031, TASK-006

**Description:**
Group list card + navigation to `/groups/:id` via React Router.

**Acceptance Criteria:**

- [ ] `data-testid` per group id

**Test Plan:**

- **Unit:** RTL + router

---

### TASK-034: Implement EmptyState component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-005, REQ-016
**Depends on:** none

**Description:**
Unchanged reusable empty state. Tests.

---

### TASK-035: Implement ConfirmDialog component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-012
**Depends on:** none

**Description:**
Unchanged modal dialog. Tests.

---

### TASK-036: Implement Toast notification component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-006, REQ-015
**Depends on:** none

**Description:**
Toast provider + `useToast`. Tests.

---

### FEATURE COMPONENTS

---

### TASK-037: Implement ExpenseForm with SplitSelector

**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-006, REQ-007, REQ-008, REQ-009, REQ-010, REQ-028
**Depends on:** TASK-031, TASK-005, TASK-006

**Description:**
Unchanged functional spec; ensure submit payloads use cents and UUID ids from server where applicable.

**Acceptance Criteria:**

- [ ] Split validation and equal-split remainder logic
- [ ] `data-testid` on interactive controls

**Test Plan:**

- **Unit:** Form and split math tests

---

### TASK-038: Implement ExpenseList component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-016
**Depends on:** TASK-031, TASK-006

**Description:**
Unchanged list/table. Tests.

---

### TASK-039: Implement ExpenseFilters component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-017
**Depends on:** TASK-005

**Description:**
Unchanged filters. Tests.

---

### TASK-040: Implement MemberBalanceList component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-016
**Depends on:** TASK-031, TASK-006

**Description:**
Unchanged. Tests.

---

### TASK-041: Implement GroupCreateForm component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-003
**Depends on:** TASK-024, TASK-036

**Description:**
Calls `createGroup` from hook; surfaces **network/Supabase errors**. Tests.

---

### TASK-042: Implement InviteCodeInput component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-004
**Depends on:** TASK-024, TASK-036

**Description:**
Join flow via `joinGroup`; show offline message when appropriate. Tests.

---

### TASK-043: Implement SettlementForm component

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-015
**Depends on:** TASK-031, TASK-027, TASK-006

**Description:**
Unchanged validation rules. Tests.

---

### PAGES

---

### TASK-044: Implement Landing / Login page

**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-001, REQ-027
**Depends on:** TASK-022, TASK-003

**Description:**
Create **`src/pages/LandingPage.tsx`**. Sign-in buttons call **`AuthContext.signIn`** (Supabase OAuth / magic link per configuration). **Remove** `@react-oauth/google` and `GoogleLogin`. If session exists, **`<Navigate to="/home" />`**. Brand styling. `data-testid="login-page"`, `data-testid="sign-in-button"` (or provider-specific ids).

**Acceptance Criteria:**

- [ ] No Google Identity Services direct integration
- [ ] Redirect authenticated users to `/home`

**Test Plan:**

- **Unit:** RTL + mock auth

---

### TASK-045: Implement Dashboard / Home page

**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-005, REQ-027
**Depends on:** TASK-030, TASK-032, TASK-033, TASK-034, TASK-026, TASK-024

**Description:**
Create **`src/pages/HomePage.tsx`**. Route `/home`. FAB links to `/expenses/new`. Uses hooks.

**Acceptance Criteria:**

- [ ] `data-testid="dashboard-page"`

**Test Plan:**

- **Unit:** RTL with mock hooks

---

### TASK-046: Implement Groups list page

**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-003, REQ-004, REQ-005
**Depends on:** TASK-033, TASK-041, TASK-042, TASK-024, TASK-030

**Description:**
**`src/pages/GroupsPage.tsx`**, route `/groups`.

**Acceptance Criteria:**

- [ ] `data-testid="groups-page"`

**Test Plan:**

- **Unit:** RTL

---

### TASK-047: Implement Group detail page

**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-016, REQ-012, REQ-015, REQ-017, REQ-030
**Depends on:** TASK-040, TASK-038, TASK-039, TASK-043, TASK-035, TASK-026, TASK-025, TASK-027

**Description:**
**`src/pages/GroupDetailPage.tsx`**, route `/groups/:id`. Use **`useParams`**. Invite section for REQ-030 (TASK-057 may extend).

**Acceptance Criteria:**

- [ ] `data-testid="group-detail-page"`

**Test Plan:**

- **Unit:** RTL + router params

---

### TASK-048: Implement Add Expense page

**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-006, REQ-007, REQ-008, REQ-009, REQ-010, REQ-028
**Depends on:** TASK-037, TASK-025, TASK-024, TASK-036

**Description:**
**`src/pages/NewExpensePage.tsx`**, route `/expenses/new`. Read **`groupId`** from `useSearchParams`.

**Acceptance Criteria:**

- [ ] Pre-select group from query; read-only when shortcut used

**Test Plan:**

- **Unit:** RTL + search params

---

### TASK-049: Implement Edit Expense page

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-011
**Depends on:** TASK-037, TASK-025

**Description:**
**`src/pages/EditExpensePage.tsx`**, route `/expenses/:id/edit`.

**Test Plan:**

- **Unit:** RTL

---

### TASK-050: Implement Activity feed page

**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-020
**Depends on:** TASK-031, TASK-034, TASK-021

**Description:**
**`src/pages/ActivityPage.tsx`**, route `/activity`.

**Test Plan:**

- **Unit:** RTL

---

### TASK-051: Implement Settings page with export/import

**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-002, REQ-021, REQ-022
**Depends on:** TASK-019, TASK-020, TASK-022, TASK-036, TASK-035

**Description:**
**`src/pages/SettingsPage.tsx`**, route `/settings`. Sign out via Supabase.

**Acceptance Criteria:**

- [ ] Sign out clears Supabase session and navigates to `/`

**Test Plan:**

- **Unit:** RTL

---

### FINAL INTEGRATION

---

### TASK-052: Wire React Router, providers, and global configuration

**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-001, REQ-024, REQ-025
**Depends on:** TASK-022, TASK-023, TASK-036, TASK-003

**Description:**
**`src/main.tsx`**: `BrowserRouter`. **`src/App.tsx`**: `Routes` / `Route` definitions for all pages; wrap public vs authenticated layouts. Providers nested: **Supabase client** (if using a thin `SupabaseProvider` optional), **`RepositoryContext`**, **`AuthContext`**, **`ToastProvider`**. Import `globals.css`. PWA meta tags in `index.html`. Title "ShareSquare". **Do not** wrap `GoogleOAuthProvider`.

**Acceptance Criteria:**

- [ ] All routes from design.md resolve to page components
- [ ] Protected routes use auth guard layout
- [ ] Env vars `VITE_SUPABASE_*` documented

**Test Plan:**

- **Unit:** Smoke render with memory router
- **Manual:** Full app load

---

### TASK-053: Implement SVG data visualizations

**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-018
**Depends on:** TASK-026

**Description:**
`CategoryChart` and `FlowDiagram` components; integrate into Group Detail. Unchanged product intent.

**Test Plan:**

- **Unit:** RTL with mock data

---

### SUPABASE AUTH & POLICY HARDENING

---

### TASK-054: Configure Supabase Auth providers and redirect URLs

**Phase:** infra
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-001
**Depends on:** TASK-007

**Description:**
In the Supabase dashboard: enable desired providers (e.g. Google OAuth with client id/secret **stored in Supabase**), set **Site URL** and **redirect allow list** for local dev and production (Vite app origins). Document steps in README. Ensure email confirmation settings match product choice (magic link on/off).

**Acceptance Criteria:**

- [x] OAuth redirect completes back to the SPA with session established
- [x] README documents env vars and dashboard steps

**Test Plan:**

- **Manual:** Sign-in flow on localhost and staging URL

---

### TASK-055: Add profile row sync on new user (trigger or documented upsert)

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-002
**Depends on:** TASK-007, TASK-015

**Description:**
Either a SQL **`on auth.users` insert trigger** to create `profiles`, or rely on app **`ensureProfile` upsert** in TASK-015 — pick one approach and document. Migrations must match.

**Acceptance Criteria:**

- [ ] Every new auth user has a readable `profiles` row before first data operation
- [ ] No duplicate profile PK violations

**Test Plan:**

- **Manual:** Sign up new test user; query `profiles` in SQL editor

---

### TASK-056: Review RLS for invite-code lookup and group join

**Phase:** backend
**Effort:** S
**Status:** ✅ Done
**Implements:** REQ-004, REQ-029
**Depends on:** TASK-007, TASK-010

**Description:**
Audit policies so an **authenticated** user can **select** minimal group fields by **`invite_code`** to join, without exposing all groups. Tighten `SELECT` on `groups` / `group_members` as needed. Document policy intent in `agentdocs` or `supabase/README.md`.

**Acceptance Criteria:**

- [x] Join flow works for valid code
- [x] Arbitrary enumeration of other users' groups is not possible

**Test Plan:**

- **Manual:** Attempt forbidden reads with second test user

---

### TASK-057: Show invite code on Group Detail page with copy button

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-030
**Depends on:** TASK-047

**Description:**
Add "Invite Members" section to **`GroupDetailPage`** (path `src/pages/GroupDetailPage.tsx`): monospace code, Copy button, 2s confirmation. Same acceptance as before.

**Test Plan:**

- **Unit:** Mock `navigator.clipboard`

---

### TASK-058: Implement Delete Group (admin only) via Supabase

**Phase:** frontend + backend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-031
**Depends on:** TASK-047, TASK-035, TASK-010, TASK-011, TASK-012, TASK-013

**Description:**
Admin-only delete with `ConfirmDialog`. Implement **`IGroupRepository.delete`** using **CASCADE** schema and/or a **`delete_group` RPC** that removes dependent rows in order. **Remove** IndexedDB cascade ordering language. Navigate to `/groups` + toast on success.

**Acceptance Criteria:**

- [ ] No orphaned rows in Postgres after delete
- [ ] Non-admins never see delete

**Test Plan:**

- **Unit:** Mock repository delete called
- **Integration:** Dev project — create group with expenses, delete, verify tables empty

---

### TASK-059: Add currency selection to Settings page

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-032
**Depends on:** TASK-051, TASK-004, TASK-005

**Description:**
Store preference in **`localStorage`** or **`profiles` column** (document choice). Implement **`useCurrency`** hook. Update **`currency.ts`** for multi-currency display. Update monetary components to use hook. **Remove** Dexie `settings` table references.

**Acceptance Criteria:**

- [ ] Persists across reloads
- [ ] JPY formatting without decimals

**Test Plan:**

- **Unit:** `formatAmount` per currency

---

### TASK-060: Add "Add Expense" shortcut button on Group Detail page

**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-033
**Depends on:** TASK-047, TASK-048

**Description:**
Button navigates to **`/expenses/new?groupId=<id>`** using React Router. Same acceptance as before.

**Test Plan:**

- **Unit:** Router navigation assertion

---
