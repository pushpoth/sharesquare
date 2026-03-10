# Tasks: ShareSquare
> Version: 0.1 | Status: Draft | Last updated: 2026-03-10
> Implements: spec.md v0.1 | design.md v0.1

---

## Summary

| Status | Count |
|--------|-------|
| ⬜ Pending | 49 |
| 🔄 In Progress | 0 |
| ✅ Done | 0 |

---

## Task List

---

### INFRASTRUCTURE

---

### TASK-001: Initialize Next.js project with TypeScript and Tailwind CSS
**Phase:** infra
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-026, REQ-027
**Depends on:** none

**Description:**
Create a new Next.js 15 project with App Router, TypeScript, and Tailwind CSS 4. Configure `next.config.ts` for static export (`output: 'export'`). Set up the Tailwind config with the ShareSquare color palette tokens from the design doc (primary, primary-dark, primary-light, accent, surface, text-primary, etc.). Create `src/styles/globals.css` with Tailwind directives and base styles. Set up `tsconfig.json` with path aliases (`@/` → `src/`). Create `.env.example` with `NEXT_PUBLIC_GOOGLE_CLIENT_ID` placeholder. Update `.gitignore` for Next.js.

**Acceptance Criteria:**
- [ ] `npm run dev` starts the Next.js dev server without errors
- [ ] `npm run build` produces a static export in `out/` directory
- [ ] TypeScript strict mode is enabled
- [ ] Tailwind CSS classes render correctly with custom color tokens
- [ ] Path aliases `@/` resolve to `src/` directory

**Test Plan:**
- **Unit:** N/A (project scaffold)
- **Manual:** Verify dev server starts, build succeeds, Tailwind classes apply

---

### TASK-002: Configure ESLint, Prettier, and Jest testing framework
**Phase:** infra
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-024
**Depends on:** TASK-001

**Description:**
Set up ESLint 9 with Next.js and TypeScript rules. Configure Prettier for consistent formatting. Set up Jest 29 with React Testing Library 16, including `jest.config.ts` (with `ts-jest` or SWC transform), `jest.setup.ts` (RTL matchers), and module name mapping for path aliases. Add npm scripts: `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `test:coverage`, `typecheck`.

**Acceptance Criteria:**
- [ ] `npm run lint` runs ESLint with zero errors on scaffolded code
- [ ] `npm run format:check` passes
- [ ] `npm test` runs Jest with zero configuration errors
- [ ] A sample test file passes (`src/__tests__/setup.test.ts` — trivial assertion)
- [ ] `npm run typecheck` succeeds

**Test Plan:**
- **Unit:** Sample test `expect(true).toBe(true)` passes
- **Manual:** Run all lint/format/test commands

---

### TASK-003: Configure PWA with Serwist
**Phase:** infra
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-025
**Depends on:** TASK-001

**Description:**
Install `@serwist/next` and `serwist`. Configure the Next.js plugin for service worker generation with precaching of static assets. Create `public/manifest.json` with app name "ShareSquare", theme color, background color, display "standalone", and icon placeholders (192x192, 512x512). Create placeholder PWA icons. Add `<link rel="manifest">` and meta tags to the root layout.

**Acceptance Criteria:**
- [ ] Service worker is generated during `npm run build`
- [ ] `manifest.json` is served at `/manifest.json` with correct fields
- [ ] App is installable as PWA when served over HTTPS (or localhost)
- [ ] Offline access to previously cached pages works

**Test Plan:**
- **Manual:** Build, serve, verify service worker registers in DevTools → Application tab
- **Manual:** Lighthouse PWA audit scores > 90

---

### TYPES, CONSTANTS, & UTILITIES

---

### TASK-004: Define TypeScript types for all entities
**Phase:** backend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-023, REQ-024
**Depends on:** TASK-001

**Description:**
Create type definition files following the data schema in design.md. All monetary fields use `number` (integer cents). Files: `src/types/user.ts`, `src/types/group.ts`, `src/types/expense.ts`, `src/types/settlement.ts`, `src/types/activity.ts`. Export barrel file `src/types/index.ts`.

**Acceptance Criteria:**
- [ ] All entity interfaces match the Dexie schema in design.md
- [ ] `GroupMember.role` is typed as `'admin' | 'member'`
- [ ] `ActivityEntry.type` is a union of all activity types
- [ ] `Expense.amount`, `ExpensePayer.amount`, `ExpenseSplit.amountOwed`, `Settlement.amount` are `number` (cents)
- [ ] All types export from `src/types/index.ts`

**Test Plan:**
- **Unit:** TypeScript compilation succeeds (covered by `npm run typecheck`)

---

### TASK-005: Create application constants
**Phase:** backend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-027, REQ-028
**Depends on:** TASK-001

**Description:**
Create `src/constants/categories.ts` with the predefined expense categories (Food, Rent, Utilities, Transport, Entertainment, Shopping, Health, Travel, Other) including display labels and icons. Create `src/constants/routes.ts` with all route paths. Create `src/constants/colors.ts` with Tailwind token references for programmatic use.

**Acceptance Criteria:**
- [ ] `EXPENSE_CATEGORIES` array contains all 9 categories with `value`, `label`, and `icon` fields
- [ ] `ROUTES` object maps all page paths
- [ ] Constants are importable from `@/constants/...`

**Test Plan:**
- **Unit:** Verify category list length === 9, all have required fields
- **Unit:** Verify routes object has all expected keys

---

### TASK-006: Implement utility functions
**Phase:** backend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-013, REQ-008, REQ-009
**Depends on:** TASK-001

**Description:**
Create `src/utils/currency.ts`: `centsToDollars(cents)`, `dollarsToCents(dollars)`, `formatCurrency(cents)` → "$125.00". Create `src/utils/dateUtils.ts`: `formatDate(iso)`, `relativeTime(iso)` → "2h ago", `isToday(iso)`, `toISODate(date)`. Create `src/utils/validation.ts`: `validateSplitsSum(splits, totalCents)`, `validateAmount(cents)`, `validateRequired(value, fieldName)`. Create `src/utils/idGenerator.ts`: wrapper around `nanoid` for consistent 21-char IDs. Each file has a co-located `.test.ts`.

**Acceptance Criteria:**
- [ ] `formatCurrency(12500)` returns `"$125.00"`
- [ ] `dollarsToCents(125.00)` returns `12500`
- [ ] `relativeTime` produces human-readable strings ("2h ago", "just now")
- [ ] `validateSplitsSum` returns error when splits don't equal total
- [ ] `idGenerator` produces unique 21-char strings

**Test Plan:**
- **Unit:** Test currency conversions with edge cases (0, 1, 999999, rounding)
- **Unit:** Test date formatting and relative time calculations
- **Unit:** Test validation pass/fail cases
- **Unit:** Test ID uniqueness (generate 1000, assert all unique)

---

### DATA LAYER (REPOSITORIES)

---

### TASK-007: Set up Dexie.js database schema
**Phase:** backend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-023
**Depends on:** TASK-004

**Description:**
Install `dexie` and `dexie-react-hooks`. Create `src/repositories/indexeddb/database.ts` with the `ShareSquareDB` class extending Dexie. Define version 1 schema with all 8 tables and their indices as specified in the design doc. Export a singleton `db` instance.

**Acceptance Criteria:**
- [ ] `ShareSquareDB` class defines all 8 tables with correct index strings
- [ ] Singleton `db` instance is exported for use by repositories
- [ ] `&email` unique index on users, `&inviteCode` on groups
- [ ] Compound index `[groupId+userId]` on groupMembers

**Test Plan:**
- **Unit:** Mock Dexie, verify schema definition matches expected tables and indices
- **Integration:** (Deferred to repo tests) Open DB in fake-indexeddb, verify tables exist

---

### TASK-008: Define repository interfaces
**Phase:** backend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-024
**Depends on:** TASK-004

**Description:**
Create interface files: `src/repositories/interfaces/IUserRepository.ts`, `IGroupRepository.ts`, `IExpenseRepository.ts`, `ISettlementRepository.ts`, `IActivityRepository.ts`. Each interface declares async methods matching the contracts in design.md section 4. Create custom error classes in `src/repositories/errors.ts`: `NotFoundError`, `DuplicateError`, `ValidationError`.

**Acceptance Criteria:**
- [ ] All 5 repository interfaces are defined with full method signatures
- [ ] All methods return `Promise<...>` (async contract)
- [ ] Error classes extend `Error` with appropriate `name` and `code` properties
- [ ] Interfaces use entity types from `src/types/`

**Test Plan:**
- **Unit:** TypeScript compilation succeeds (`npm run typecheck`)

---

### TASK-009: Implement DexieUserRepository
**Phase:** backend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-001, REQ-002, REQ-023, REQ-024
**Depends on:** TASK-007, TASK-008, TASK-006

**Description:**
Create `src/repositories/indexeddb/UserRepository.ts` implementing `IUserRepository`. Methods: `findById`, `findByEmail`, `create` (auto-generates ID via idGenerator, sets createdAt), `getAll`. Use `fake-indexeddb` for tests. Create co-located test file.

**Acceptance Criteria:**
- [ ] `create()` generates a nanoid and sets createdAt timestamp
- [ ] `findByEmail()` returns undefined when no user exists with that email
- [ ] `findByEmail()` returns the user when found
- [ ] `create()` with duplicate email throws `DuplicateError`

**Test Plan:**
- **Unit:** Test all CRUD methods against fake-indexeddb
- **Unit:** Test duplicate email handling

---

### TASK-010: Implement DexieGroupRepository
**Phase:** backend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-003, REQ-004, REQ-005, REQ-006, REQ-023, REQ-024
**Depends on:** TASK-007, TASK-008, TASK-006

**Description:**
Create `src/repositories/indexeddb/GroupRepository.ts` implementing `IGroupRepository`. Methods: `findById`, `findByInviteCode`, `getByUserId` (join through groupMembers), `create` (auto-generates ID, createdAt), `update`, `delete` (cascade: remove groupMembers), `addMember`, `getMembers`, `isMember`. Create co-located test file.

**Acceptance Criteria:**
- [ ] `create()` inserts both a Group and a GroupMember (creator as admin)
- [ ] `getByUserId()` returns all groups where user is a member
- [ ] `addMember()` throws `DuplicateError` if user already in group
- [ ] `findByInviteCode()` is case-insensitive (uppercases input)
- [ ] `delete()` removes group and all associated groupMembers

**Test Plan:**
- **Unit:** Test all CRUD methods against fake-indexeddb
- **Unit:** Test duplicate member check, cascade delete
- **Unit:** Test case-insensitive invite code lookup

---

### TASK-011: Implement DexieExpenseRepository
**Phase:** backend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-006, REQ-011, REQ-012, REQ-023, REQ-024
**Depends on:** TASK-007, TASK-008, TASK-006

**Description:**
Create `src/repositories/indexeddb/ExpenseRepository.ts` implementing `IExpenseRepository`. Methods: `findById`, `getByGroupId`, `create` (transactional: insert expense + payers + splits), `update` (transactional: update expense, replace payers + splits), `delete` (transactional: remove expense + payers + splits), `getPayers`, `getSplits`. Use Dexie transactions for atomicity. Create co-located test file.

**Acceptance Criteria:**
- [ ] `create()` inserts expense, payer, and split records in one transaction
- [ ] `update()` replaces payer and split records atomically
- [ ] `delete()` removes expense and all related payer/split records
- [ ] `getByGroupId()` returns expenses sorted by date descending

**Test Plan:**
- **Unit:** Test transactional create/update/delete against fake-indexeddb
- **Unit:** Test cascade delete removes payers and splits
- **Unit:** Test sort order of getByGroupId

---

### TASK-012: Implement DexieSettlementRepository
**Phase:** backend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-015, REQ-023, REQ-024
**Depends on:** TASK-007, TASK-008, TASK-006

**Description:**
Create `src/repositories/indexeddb/SettlementRepository.ts` implementing `ISettlementRepository`. Methods: `findById`, `getByGroupId`, `create` (auto-generates ID, sets createdAt), `delete`. Create co-located test file.

**Acceptance Criteria:**
- [ ] `create()` generates ID and sets createdAt
- [ ] `getByGroupId()` returns settlements sorted by date descending
- [ ] `delete()` removes the settlement record

**Test Plan:**
- **Unit:** Test all CRUD methods against fake-indexeddb

---

### TASK-013: Implement DexieActivityRepository
**Phase:** backend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-020, REQ-023, REQ-024
**Depends on:** TASK-007, TASK-008, TASK-006

**Description:**
Create `src/repositories/indexeddb/ActivityRepository.ts` implementing `IActivityRepository`. Methods: `getByUserId(userId, limit?)` sorted by timestamp descending, `log(entry)` auto-generates ID and timestamp. Create co-located test file.

**Acceptance Criteria:**
- [ ] `log()` generates ID and sets timestamp
- [ ] `getByUserId()` returns entries for groups the user belongs to, sorted newest first
- [ ] `getByUserId()` respects the optional `limit` parameter

**Test Plan:**
- **Unit:** Test log and retrieval against fake-indexeddb
- **Unit:** Test limit parameter

---

### TASK-014: Create repository provider and factory
**Phase:** backend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-024
**Depends on:** TASK-009, TASK-010, TASK-011, TASK-012, TASK-013

**Description:**
Create `src/repositories/index.ts` that instantiates all Dexie repositories with the singleton DB instance and exports them as a `repositories` object. This is the single entry point used by the RepositoryContext. Structure allows future swap to different implementations.

**Acceptance Criteria:**
- [ ] `repositories` object exposes `users`, `groups`, `expenses`, `settlements`, `activity` properties
- [ ] Each property is an instance of the corresponding Dexie repository
- [ ] Changing the import in `index.ts` is the only change needed to swap implementations

**Test Plan:**
- **Unit:** Verify factory returns objects implementing all interface methods

---

### SERVICES

---

### TASK-015: Implement AuthService
**Phase:** backend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-001, REQ-002
**Depends on:** TASK-009, TASK-006

**Description:**
Create `src/services/authService.ts`. Functions: `decodeGoogleCredential(credential: string)` → decode the Google ID token JWT to extract `{email, name, picture}` (base64 decode, no server-side verification needed for client-only MVP), `loginOrCreateUser(repos, googleProfile)` → find or create user in repository, `getSession()` / `setSession(user)` / `clearSession()` → manage auth state in localStorage. Create co-located test file.

**Acceptance Criteria:**
- [ ] `decodeGoogleCredential` extracts email, name, and picture from a Google ID token
- [ ] `loginOrCreateUser` creates a new user on first login, returns existing on subsequent
- [ ] `setSession` persists user ID to localStorage
- [ ] `getSession` retrieves persisted user ID
- [ ] `clearSession` removes the session

**Test Plan:**
- **Unit:** Test JWT decode with a mock token payload
- **Unit:** Test loginOrCreateUser with mock repository (new user + returning user)
- **Unit:** Test session get/set/clear with mock localStorage

---

### TASK-016: Implement InviteCodeService
**Phase:** backend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-003, REQ-004
**Depends on:** TASK-010

**Description:**
Create `src/services/inviteCodeService.ts`. Function: `generateUniqueCode(groupRepo)` → generate a human-readable alphanumeric code (format: `XXXX-XXXX`, 8 chars + hyphen), check uniqueness against repository, retry on collision (max 10 attempts). `normalizeCode(input)` → uppercase, trim, strip spaces. Create co-located test file.

**Acceptance Criteria:**
- [ ] Generated codes match pattern `/^[A-Z0-9]{4}-[A-Z0-9]{4}$/`
- [ ] Codes are checked for uniqueness against the group repository
- [ ] Collisions trigger regeneration (up to 10 attempts)
- [ ] `normalizeCode` uppercases and trims input

**Test Plan:**
- **Unit:** Test code format validation (regex match)
- **Unit:** Test collision handling with mock repo returning existing code
- **Unit:** Test normalizeCode with various inputs (lowercase, spaces, mixed)

---

### TASK-017: Implement BalanceService
**Phase:** backend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-013
**Depends on:** TASK-004, TASK-006

**Description:**
Create `src/services/balanceService.ts`. Pure functions (no repo dependency — receive data as arguments): `calculateGroupBalances(expenses, payers, splits, settlements)` → returns `Map<userId, netBalanceCents>` where positive = owed to user, negative = user owes. `calculateOverallBalances(groupBalanceMaps[])` → aggregate cross-group. `calculatePairwiseBalances(expenses, payers, splits, settlements)` → returns array of `{fromUserId, toUserId, amount}` raw debts. All calculations use integer cents. Create co-located test file.

**Acceptance Criteria:**
- [ ] Given expenses with payers and splits, net balances are correct (paid - owed)
- [ ] Settlements reduce the balance between the two involved users
- [ ] Cross-group aggregation sums balances per user across multiple groups
- [ ] Pairwise balances correctly track who owes whom
- [ ] All calculations use integer arithmetic (no floating point)

**Test Plan:**
- **Unit:** Test with single expense, single payer, equal split
- **Unit:** Test with multiple expenses and settlements
- **Unit:** Test cross-group aggregation
- **Unit:** Test edge cases: zero expenses, self-payment, single member group

---

### TASK-018: Implement DebtSimplificationService
**Phase:** backend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-014
**Depends on:** TASK-017

**Description:**
Create `src/services/debtSimplificationService.ts`. Function: `simplifyDebts(netBalances: Map<string, number>)` → returns minimal `Array<{from, to, amount}>` using the greedy net-balance algorithm from design.md section 12. Separate into creditors/debtors, sort, match largest pairs, emit settlements until all balanced. Create co-located test file with extensive edge cases.

**Acceptance Criteria:**
- [ ] A→B $10, B→C $10 simplifies to A→C $10 (1 transaction instead of 2)
- [ ] Circular debts (A→B→C→A) resolve to net transfers
- [ ] All-zero balances produce empty result
- [ ] Sum of simplified settlements equals sum of input balances
- [ ] Result has fewer or equal transactions compared to pairwise debts

**Test Plan:**
- **Unit:** Test trivial case (2 users, 1 debt)
- **Unit:** Test chain simplification (A→B→C)
- **Unit:** Test circular debts
- **Unit:** Test large group (10 members with random balances)
- **Unit:** Test all-zero / already-settled scenarios

---

### TASK-019: Implement ExportService
**Phase:** backend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-021
**Depends on:** TASK-004, TASK-006

**Description:**
Create `src/services/exportService.ts`. Function: `exportAllData(repos)` → read all data from all repositories, assemble into the JSON export schema `{version, exportedAt, users, groups, groupMembers, expenses, expensePayers, expenseSplits, settlements}`, return as a JSON string. `downloadJson(jsonString, filename)` → trigger browser download using Blob + anchor click. Create co-located test file.

**Acceptance Criteria:**
- [ ] Exported JSON includes all entities from all tables
- [ ] Export includes a `version` field (e.g., "1.0") and `exportedAt` timestamp
- [ ] Empty database exports valid JSON with empty arrays
- [ ] `downloadJson` creates and clicks a download link

**Test Plan:**
- **Unit:** Test export with mock repos returning sample data, verify JSON structure
- **Unit:** Test export with empty repos
- **Unit:** Test downloadJson creates blob URL (mock DOM)

---

### TASK-020: Implement ImportService
**Phase:** backend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-022
**Depends on:** TASK-004, TASK-006, TASK-019

**Description:**
Create `src/services/importService.ts`. Functions: `validateImportJson(jsonString)` → parse JSON, validate against expected schema (check version, required fields, type checks), return typed data or list of validation errors. `importData(repos, data, strategy: 'overwrite' | 'skip')` → write all entities to repositories, handling ID conflicts per strategy. Create co-located test file.

**Acceptance Criteria:**
- [ ] Valid JSON passes validation and returns typed data
- [ ] Invalid JSON returns descriptive error messages
- [ ] Missing required fields are caught with field-specific errors
- [ ] 'overwrite' strategy replaces existing records with matching IDs
- [ ] 'skip' strategy ignores records with matching IDs

**Test Plan:**
- **Unit:** Test validation with valid export JSON
- **Unit:** Test validation with malformed JSON, missing fields, wrong types
- **Unit:** Test import with overwrite strategy (mock repos)
- **Unit:** Test import with skip strategy (mock repos)

---

### TASK-021: Implement ActivityService
**Phase:** backend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-020
**Depends on:** TASK-013, TASK-006

**Description:**
Create `src/services/activityService.ts`. Functions: `logActivity(activityRepo, entry)` → log an activity entry. `getActivityFeed(activityRepo, userId, limit?)` → retrieve recent activity for the user. Helper: `buildActivityDescription(type, metadata)` → generate human-readable descriptions like "Alice added 'Dinner' ($50.00) in Weekend Trip". Create co-located test file.

**Acceptance Criteria:**
- [ ] `logActivity` creates an entry with auto-generated ID and timestamp
- [ ] `getActivityFeed` returns entries sorted by timestamp descending
- [ ] Activity descriptions are human-readable for all 6 activity types
- [ ] Limit parameter restricts result count

**Test Plan:**
- **Unit:** Test log and retrieval with mock repository
- **Unit:** Test description generation for each activity type

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
Create `src/contexts/AuthContext.tsx` providing: `currentUser: User | null`, `isAuthenticated: boolean`, `isLoading: boolean`, `login(credential: string)`, `logout()`. On mount, check localStorage session and hydrate user from repository. Create `src/hooks/useAuth.ts` as convenience hook wrapping `useContext(AuthContext)`. Create test files for both.

**Acceptance Criteria:**
- [ ] On app load, if session exists in localStorage, user is hydrated from IndexedDB
- [ ] `login()` calls AuthService, sets session, updates context
- [ ] `logout()` clears session, resets user to null
- [ ] `isLoading` is true during initial hydration, false after
- [ ] Components re-render when auth state changes

**Test Plan:**
- **Unit:** Test AuthContext with mock AuthService and mock repo
- **Unit:** Test useAuth hook returns context values
- **Unit:** Test login/logout flow state transitions

---

### TASK-023: Implement RepositoryContext
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-024
**Depends on:** TASK-014

**Description:**
Create `src/contexts/RepositoryContext.tsx` that provides the repository instances to the component tree via React Context. Create `useRepositories()` hook. The provider initializes the repository factory from `src/repositories/index.ts`. Create test file.

**Acceptance Criteria:**
- [ ] `useRepositories()` returns all 5 repository instances
- [ ] Throws helpful error if used outside provider
- [ ] Provider initializes once on mount

**Test Plan:**
- **Unit:** Test hook returns repositories when inside provider
- **Unit:** Test hook throws when outside provider

---

### TASK-024: Implement useGroups hook
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-003, REQ-004, REQ-005
**Depends on:** TASK-023, TASK-016

**Description:**
Create `src/hooks/useGroups.ts`. Provides: `groups` (live query of user's groups), `createGroup(name)`, `joinGroup(inviteCode)`, `getGroupById(id)`, `getGroupMembers(groupId)`, `updateGroup(id, updates)`. Uses Dexie's `useLiveQuery` for reactive data. Create test file.

**Acceptance Criteria:**
- [ ] `groups` updates reactively when groups change in IndexedDB
- [ ] `createGroup` generates invite code and adds creator as admin
- [ ] `joinGroup` validates code, adds user as member
- [ ] Error states are returned (invalid code, already member)

**Test Plan:**
- **Unit:** Test with mock repositories, verify CRUD operations
- **Unit:** Test error handling for invalid invite code, duplicate join

---

### TASK-025: Implement useExpenses hook
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-006, REQ-011, REQ-012
**Depends on:** TASK-023, TASK-021

**Description:**
Create `src/hooks/useExpenses.ts`. Provides: `getExpensesByGroup(groupId)` (live query), `addExpense(expense, payers, splits)`, `updateExpense(id, expense, payers, splits)`, `deleteExpense(id)`. All mutations also log an activity entry. Create test file.

**Acceptance Criteria:**
- [ ] Expense list updates reactively when expenses change
- [ ] `addExpense` creates expense + payers + splits and logs activity
- [ ] `deleteExpense` removes expense and logs activity
- [ ] `updateExpense` replaces payers/splits and logs activity

**Test Plan:**
- **Unit:** Test CRUD operations with mock repositories
- **Unit:** Verify activity logging on each mutation

---

### TASK-026: Implement useBalances hook
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-013, REQ-014
**Depends on:** TASK-023, TASK-017, TASK-018

**Description:**
Create `src/hooks/useBalances.ts`. Provides: `getGroupBalances(groupId)` → computed per-member net balances, `getOverallBalances()` → cross-group "You Owe" / "Owed to You", `getSimplifiedDebts(groupId)` → minimal settlement list. Uses live queries on expenses and settlements, recomputes via BalanceService/DebtSimplificationService. Create test file.

**Acceptance Criteria:**
- [ ] Group balances recompute when expenses or settlements change
- [ ] Overall balances aggregate across all user's groups
- [ ] Simplified debts reflect the minimized transaction set
- [ ] All values are in integer cents

**Test Plan:**
- **Unit:** Test with mock data, verify balance calculations
- **Unit:** Test reactivity on data change

---

### TASK-027: Implement useSettlements hook
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-015
**Depends on:** TASK-023, TASK-021

**Description:**
Create `src/hooks/useSettlements.ts`. Provides: `getSettlementsByGroup(groupId)` (live query), `addSettlement(groupId, fromUserId, toUserId, amount, date)`, `deleteSettlement(id)`. Mutations log activity. Create test file.

**Acceptance Criteria:**
- [ ] Settlement list updates reactively
- [ ] `addSettlement` validates amount > 0, creates record, logs activity
- [ ] `deleteSettlement` removes record and logs activity

**Test Plan:**
- **Unit:** Test CRUD with mock repositories
- **Unit:** Test validation (zero/negative amount)

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
Create `src/components/Header/Header.tsx`. Displays: ShareSquare logo/icon, app name, Google avatar of current user (from AuthContext), and a search icon button. Uses `primary-dark` background. Mobile-first layout. Add `data-testid` attributes. Create `types.ts` and test file.

**Acceptance Criteria:**
- [ ] Header renders logo, app name, user avatar, and search icon
- [ ] User avatar shows Google profile picture or initials fallback
- [ ] Responsive: full width, fixed height ~56px
- [ ] `data-testid="header"` is present

**Test Plan:**
- **Unit:** Renders with mock auth context (with avatar, without avatar)
- **Unit:** Verify testid attributes

---

### TASK-029: Implement BottomNav component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-019, REQ-027
**Depends on:** TASK-005

**Description:**
Create `src/components/BottomNav/BottomNav.tsx`. Five tabs: Dashboard, Groups, Add Expense (+), Activity, Settings. Center button is a prominent green circle (56px). Active tab highlighted with white icon/text, inactive muted. Uses `primary-dark` background. Reads current route to set active state. Create `constants.ts` with nav items, `types.ts`, and test file.

**Acceptance Criteria:**
- [ ] Renders 5 nav items with icons and labels
- [ ] Center "Add Expense" button is visually elevated green circle
- [ ] Active tab is highlighted (white icon + label)
- [ ] Tapping a tab navigates to the correct route
- [ ] `data-testid="bottom-nav"` and per-item testids present

**Test Plan:**
- **Unit:** Renders all 5 items
- **Unit:** Active state matches mock route
- **Unit:** Click triggers navigation (mock router)

---

### TASK-030: Implement AppLayout with auth guard
**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-019, REQ-026
**Depends on:** TASK-028, TASK-029, TASK-022

**Description:**
Create `src/layouts/AppLayout/AppLayout.tsx`. Wraps authenticated pages with: Header (top), main content area (scrollable, padded, with bottom margin for nav), BottomNav (fixed bottom). Includes auth guard: if `!isAuthenticated && !isLoading`, redirect to `/`. Show loading spinner during `isLoading`. Create test file.

**Acceptance Criteria:**
- [ ] Authenticated user sees Header + content + BottomNav
- [ ] Unauthenticated user is redirected to `/` (login page)
- [ ] Loading state shows a spinner
- [ ] Content area scrolls independently with bottom padding for nav
- [ ] Max-width container centers content on desktop viewports

**Test Plan:**
- **Unit:** Test redirect when unauthenticated (mock useAuth)
- **Unit:** Test loading state renders spinner
- **Unit:** Test authenticated state renders children with Header + BottomNav

---

### TASK-031: Implement MemberAvatar component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-002, REQ-005
**Depends on:** TASK-004

**Description:**
Create `src/components/MemberAvatar/MemberAvatar.tsx`. Renders a circular avatar with: Google profile image if available, initials fallback (first letter of name on a green-tinted background), optional green border. Supports sizes: sm (24px), md (32px), lg (48px). Also create an `AvatarGroup` variant that renders overlapping avatars for group cards. Create `types.ts` and test file.

**Acceptance Criteria:**
- [ ] Shows profile image when `avatarUrl` is provided
- [ ] Shows initials on green background when no image
- [ ] Handles broken image URLs (falls back to initials)
- [ ] `AvatarGroup` renders up to 4 avatars overlapping, with "+N" overflow
- [ ] `data-testid="member-avatar-{userId}"` present

**Test Plan:**
- **Unit:** Renders image when URL provided
- **Unit:** Renders initials when no URL
- **Unit:** AvatarGroup shows overflow count for >4 members

---

### TASK-032: Implement BalanceCard component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-005, REQ-027
**Depends on:** TASK-006

**Description:**
Create `src/components/BalanceCard/BalanceCard.tsx`. Renders the green dashboard balance card showing: "Overall Balance" label, large dollar amount, "OWED" sub-label, and "You Owe" / "Owed to You" sub-sections with amounts. Uses `primary` green background with white text. Accepts `overallBalance`, `youOwe`, `owedToYou` props (all in cents). Create `types.ts` and test file.

**Acceptance Criteria:**
- [ ] Displays formatted dollar amounts from cent values
- [ ] Large central balance amount is prominent (text-3xl+)
- [ ] "You Owe" and "Owed to You" sub-sections show correct values
- [ ] Green background with white text matches design
- [ ] `data-testid="balance-card"` present

**Test Plan:**
- **Unit:** Renders correct dollar formatting from cent inputs
- **Unit:** Handles zero balance (shows "$0.00")
- **Unit:** Handles large amounts

---

### TASK-033: Implement GroupCard component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-005, REQ-027
**Depends on:** TASK-031, TASK-006

**Description:**
Create `src/components/GroupCard/GroupCard.tsx`. Renders a group list item card showing: group icon (based on category/name), group name, member avatar row (AvatarGroup), member count, total expenses, user's balance badge ("YOU OWE $X" or "YOU ARE OWED $X" with appropriate styling), and last activity relative time. White card with subtle border/shadow. Create `types.ts` and test file.

**Acceptance Criteria:**
- [ ] Displays group name, member avatars, total expenses, and user balance
- [ ] Balance badge uses distinct styling for "owe" vs "owed" states
- [ ] Relative time shows "Active 2h ago" format
- [ ] Card is clickable, navigating to group detail
- [ ] `data-testid="group-card-{groupId}"` present

**Test Plan:**
- **Unit:** Renders all group info correctly
- **Unit:** "Owe" vs "owed" badge styling distinction
- **Unit:** Click handler fires with correct group ID

---

### TASK-034: Implement EmptyState component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-005, REQ-016
**Depends on:** none

**Description:**
Create `src/components/EmptyState/EmptyState.tsx`. Reusable component accepting: `icon` (React node), `title`, `description`, and optional `actionLabel` + `onAction` for a CTA button. Used on Dashboard (no groups), Group Detail (no expenses), Activity (no activity). Create test file.

**Acceptance Criteria:**
- [ ] Renders icon, title, and description centered
- [ ] CTA button renders only when `actionLabel` and `onAction` provided
- [ ] `data-testid="empty-state"` present

**Test Plan:**
- **Unit:** Renders with and without CTA
- **Unit:** CTA click fires onAction

---

### TASK-035: Implement ConfirmDialog component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-012
**Depends on:** none

**Description:**
Create `src/components/ConfirmDialog/ConfirmDialog.tsx`. Modal dialog with: title, message, "Cancel" button, and "Confirm" button (destructive styling for delete actions). Uses backdrop overlay. Props: `isOpen`, `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `variant: 'default' | 'destructive'`. Create test file.

**Acceptance Criteria:**
- [ ] Dialog renders when `isOpen` is true, hidden when false
- [ ] "Confirm" button calls `onConfirm`, "Cancel" calls `onCancel`
- [ ] Destructive variant shows red confirm button
- [ ] Clicking backdrop calls `onCancel`
- [ ] `data-testid="confirm-dialog"` present

**Test Plan:**
- **Unit:** Open/close state rendering
- **Unit:** Button click handlers
- **Unit:** Backdrop click fires onCancel

---

### TASK-036: Implement Toast notification component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-006, REQ-015
**Depends on:** none

**Description:**
Create `src/components/Toast/Toast.tsx` and a `ToastProvider` context. Supports: `success`, `error`, `info` variants. Auto-dismisses after 4 seconds. Positioned at top center of screen. Provides `useToast()` hook with `showToast(message, variant)`. Create test file.

**Acceptance Criteria:**
- [ ] Toast appears with correct variant styling (green/red/blue)
- [ ] Auto-dismisses after 4 seconds
- [ ] Multiple toasts stack
- [ ] `showToast` is callable from any component via hook
- [ ] `data-testid="toast"` present

**Test Plan:**
- **Unit:** Toast renders with message and variant
- **Unit:** Auto-dismiss timer (use fake timers)
- **Unit:** useToast hook works within provider

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
Create `src/components/ExpenseForm/ExpenseForm.tsx` and `src/components/SplitSelector/SplitSelector.tsx`. The form includes: Description input, Date picker (defaults to today), Amount input (dollar format with $ prefix, converts to cents on submit), Category dropdown (from constants), "Who Paid" selector (group members + "Group" option), and the split section. SplitSelector provides: "Split Equally" checkbox (checked = auto-calculate equal shares, unchecked = manual), per-member row with avatar, name, amount input, and % toggle. Real-time validation: splits must sum to total. Create `constants.ts`, `types.ts`, and test files for both components.

**Acceptance Criteria:**
- [ ] All form fields render with correct defaults (date = today)
- [ ] Category dropdown shows all 9 categories
- [ ] "Split Equally" auto-distributes amount with remainder-cent handling
- [ ] Unchecking "Split Equally" enables manual amount editing
- [ ] "%" toggle switches between dollar and percentage input mode
- [ ] Validation error shown when splits don't sum to total
- [ ] "Save Expense" disabled until form is valid
- [ ] Form calls `onSubmit` with correctly structured data (cents)
- [ ] `data-testid` attributes on all interactive elements

**Test Plan:**
- **Unit:** Default values (date = today, empty fields)
- **Unit:** Equal split calculation with various member counts and amounts
- **Unit:** Remainder cent distribution (e.g., $100 / 3)
- **Unit:** Validation: splits sum mismatch, missing required fields
- **Unit:** Percentage mode calculation
- **Unit:** Form submission data structure

---

### TASK-038: Implement ExpenseList component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-016
**Depends on:** TASK-031, TASK-006

**Description:**
Create `src/components/ExpenseList/ExpenseList.tsx`. Renders a table/list of expenses with columns: Date, Payer description, Total, and current user's Split amount. Each row shows formatted date, "Paid by [Name] ([total])" description, total amount, and the user's share. Sorted by date descending. Create `types.ts` and test file.

**Acceptance Criteria:**
- [ ] Renders expense rows with date, payer, total, and user split
- [ ] Dates formatted as "Jan 10" short format
- [ ] Amounts formatted as dollars from cents
- [ ] Sorted by date descending
- [ ] `data-testid="expense-list"` and per-row testids

**Test Plan:**
- **Unit:** Renders correct number of rows
- **Unit:** Date and amount formatting
- **Unit:** Sort order verification

---

### TASK-039: Implement ExpenseFilters component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-017
**Depends on:** TASK-005

**Description:**
Create `src/components/ExpenseFilters/ExpenseFilters.tsx`. Filter bar with: category dropdown (multi-select), date range picker (from/to), sort selector (date asc/desc, amount asc/desc). Emits `onFilterChange` with current filter state. "Clear filters" button resets all. Create `types.ts` and test file.

**Acceptance Criteria:**
- [ ] Category filter shows all categories as checkable options
- [ ] Date range filter accepts from/to dates
- [ ] Sort selector offers date and amount in both directions
- [ ] "Clear filters" resets to default state
- [ ] `onFilterChange` emits on every change

**Test Plan:**
- **Unit:** Filter state changes on selection
- **Unit:** Clear filters resets all values
- **Unit:** onFilterChange called with correct filter object

---

### TASK-040: Implement MemberBalanceList component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-016
**Depends on:** TASK-031, TASK-006

**Description:**
Create `src/components/MemberBalanceList/MemberBalanceList.tsx`. Renders a vertical list of group members with: avatar, name, and balance status ("Owed $50.00" in green for positive, "Owes $70.00" in warm/red for negative, "Owed $0" in neutral for zero). Create `types.ts` and test file.

**Acceptance Criteria:**
- [ ] Each member row shows avatar, name, and formatted balance
- [ ] Positive balance styled green ("Owed $X")
- [ ] Negative balance styled warm/red ("Owes $X")
- [ ] Zero balance shows "Owed $0" in neutral
- [ ] `data-testid="member-balance-{userId}"` per row

**Test Plan:**
- **Unit:** Correct styling for positive, negative, zero balances
- **Unit:** Correct dollar formatting

---

### TASK-041: Implement GroupCreateForm component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-003
**Depends on:** TASK-024, TASK-036

**Description:**
Create `src/components/GroupCreateForm/GroupCreateForm.tsx`. Simple form with: group name input (required, max 100 chars), "Create Group" button. On success, shows the generated invite code with a "Copy" button and navigates to the new group. Can be rendered as a modal or inline section. Create test file.

**Acceptance Criteria:**
- [ ] Name input with validation (required, max 100 chars)
- [ ] Submit calls `createGroup` and shows the invite code on success
- [ ] "Copy" button copies invite code to clipboard
- [ ] Error state displayed on failure
- [ ] `data-testid="group-create-form"` present

**Test Plan:**
- **Unit:** Validation: empty name, too-long name
- **Unit:** Success flow renders invite code
- **Unit:** Copy button interaction

---

### TASK-042: Implement InviteCodeInput component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-004
**Depends on:** TASK-024, TASK-036

**Description:**
Create `src/components/InviteCodeInput/InviteCodeInput.tsx`. Input field for entering an invite code with auto-uppercase formatting and a "Join" button. Shows success (redirect to group) or error ("Code not found" / "Already a member"). Create test file.

**Acceptance Criteria:**
- [ ] Input auto-uppercases as user types
- [ ] "Join" button calls `joinGroup` with normalized code
- [ ] Success navigates to the group detail page
- [ ] Error messages display inline for invalid/duplicate codes
- [ ] `data-testid="invite-code-input"` present

**Test Plan:**
- **Unit:** Auto-uppercase behavior
- **Unit:** Success and error state rendering
- **Unit:** Join button calls handler with correct code

---

### TASK-043: Implement SettlementForm component
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-015
**Depends on:** TASK-031, TASK-027, TASK-006

**Description:**
Create `src/components/SettlementForm/SettlementForm.tsx`. Form for recording a settlement: "From" member dropdown, "To" member dropdown, amount input, date picker. Validates: from !== to, amount > 0, amount <= outstanding balance. On submit, calls `addSettlement`. Create `types.ts` and test file.

**Acceptance Criteria:**
- [ ] "From" and "To" dropdowns list group members
- [ ] Cannot select same member for both from and to
- [ ] Amount validates > 0
- [ ] Submit creates settlement and shows success toast
- [ ] `data-testid="settlement-form"` present

**Test Plan:**
- **Unit:** Validation: same from/to, zero amount
- **Unit:** Submit calls handler with correct data
- **Unit:** Success toast shown after submission

---

### PAGES

---

### TASK-044: Implement Landing/Login page
**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-001, REQ-027
**Depends on:** TASK-022, TASK-003

**Description:**
Create `src/app/page.tsx`. The unauthenticated landing page with: ShareSquare logo and name, tagline, "Sign in with Google" button using `@react-oauth/google`'s `GoogleLogin` component. On successful credential callback, call `login()` from AuthContext. If already authenticated, redirect to `/home`. Mint-green and white aesthetic matching the brand. Install and configure `@react-oauth/google` with `GoogleOAuthProvider` in root layout.

**Acceptance Criteria:**
- [ ] Google Sign-In button renders and initiates OAuth flow
- [ ] Successful sign-in redirects to `/home`
- [ ] Already authenticated users are redirected to `/home` immediately
- [ ] Error state shows retry message
- [ ] Page is visually appealing with ShareSquare branding
- [ ] `data-testid="login-page"` and `data-testid="google-signin-button"` present

**Test Plan:**
- **Unit:** Renders sign-in button when unauthenticated
- **Unit:** Redirects when authenticated (mock useAuth)
- **Unit:** Calls login on credential callback

---

### TASK-045: Implement Dashboard/Home page
**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-005, REQ-027
**Depends on:** TASK-030, TASK-032, TASK-033, TASK-034, TASK-026, TASK-024

**Description:**
Create `src/app/home/page.tsx`. Wrapped in AppLayout. Displays: BalanceCard (overall balance, you owe, owed to you), "+" FAB button (links to /expenses/new), "Recent Groups" heading, and list of GroupCards. Uses `useGroups` and `useBalances` hooks. Empty state when no groups. FAB is a green circular button floating above the group list.

**Acceptance Criteria:**
- [ ] BalanceCard shows correct aggregated balances
- [ ] Recent Groups list renders GroupCards with correct data
- [ ] FAB button navigates to /expenses/new
- [ ] Empty state shown when user has no groups
- [ ] Page layout matches the Home screen design
- [ ] `data-testid="dashboard-page"` present

**Test Plan:**
- **Unit:** Renders balance card with mock balance data
- **Unit:** Renders group cards list with mock groups
- **Unit:** Empty state when no groups
- **Unit:** FAB click navigates to /expenses/new

---

### TASK-046: Implement Groups list page
**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-003, REQ-004, REQ-005
**Depends on:** TASK-033, TASK-041, TASK-042, TASK-024, TASK-030

**Description:**
Create `src/app/groups/page.tsx`. Wrapped in AppLayout. Two sections: "Create Group" (GroupCreateForm) and "Join Group" (InviteCodeInput), followed by a list of all user's groups (GroupCards). Accessible from bottom nav "Groups" tab.

**Acceptance Criteria:**
- [ ] Create Group section allows creating a new group
- [ ] Join Group section allows joining via invite code
- [ ] Groups list shows all user's groups
- [ ] After creating/joining, group appears in list reactively
- [ ] `data-testid="groups-page"` present

**Test Plan:**
- **Unit:** Renders create and join sections
- **Unit:** Renders groups list with mock data
- **Unit:** Empty state when no groups

---

### TASK-047: Implement Group detail page
**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-016, REQ-012, REQ-015, REQ-017
**Depends on:** TASK-040, TASK-038, TASK-039, TASK-043, TASK-035, TASK-026, TASK-025, TASK-027

**Description:**
Create `src/app/groups/[id]/page.tsx`. Wrapped in AppLayout. Displays: back arrow, group name with edit pencil (admin only), group total expenses card, member balances summary, member balance list, "Record Settlement" button (opens SettlementForm), "Recent Expenses" section with ExpenseList and ExpenseFilters. Expense rows are clickable to edit. Delete button on expenses (with ConfirmDialog) for creator/admin.

**Acceptance Criteria:**
- [ ] Back arrow navigates to /groups or /home
- [ ] Group name is editable by admin (inline edit with pencil icon)
- [ ] Total expenses card shows sum of all group expenses
- [ ] Member balances show each member's net owed/owing
- [ ] Expense list shows recent expenses with filter/sort support
- [ ] Settlement button opens form and records settlements
- [ ] Delete expense shows confirmation dialog
- [ ] `data-testid="group-detail-page"` present

**Test Plan:**
- **Unit:** Renders group info with mock data
- **Unit:** Admin can edit group name, non-admin cannot
- **Unit:** Expense delete flow with confirmation
- **Unit:** Settlement recording flow

---

### TASK-048: Implement Add Expense page
**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-006, REQ-007, REQ-008, REQ-009, REQ-010, REQ-028
**Depends on:** TASK-037, TASK-025, TASK-024, TASK-036

**Description:**
Create `src/app/expenses/new/page.tsx`. Top bar with back arrow and "Cancel" button. Renders ExpenseForm. Accepts optional `groupId` query parameter to pre-select the group. On save, calls `addExpense` from useExpenses hook, shows success toast, navigates to the group detail page. If no groupId, shows a group selector as the first step.

**Acceptance Criteria:**
- [ ] ExpenseForm renders with all fields
- [ ] Pre-selects group when `groupId` query param is present
- [ ] Group selector shown when no groupId
- [ ] On save, expense is created and user navigates to group detail
- [ ] Cancel navigates back without saving
- [ ] `data-testid="add-expense-page"` present

**Test Plan:**
- **Unit:** Renders form with default values
- **Unit:** Pre-selects group from query param
- **Unit:** Save flow: create + navigate
- **Unit:** Cancel flow: navigate back

---

### TASK-049: Implement Edit Expense page
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-011
**Depends on:** TASK-037, TASK-025

**Description:**
Create `src/app/expenses/[id]/edit/page.tsx`. Loads the existing expense data and renders ExpenseForm pre-populated. On save, calls `updateExpense`. Only accessible by expense creator or group admin (redirect others to group detail). Top bar with back arrow and "Cancel".

**Acceptance Criteria:**
- [ ] Form loads pre-populated with existing expense data
- [ ] On save, expense is updated and user navigates to group detail
- [ ] Non-creator/non-admin is redirected away
- [ ] Cancel navigates back without saving
- [ ] `data-testid="edit-expense-page"` present

**Test Plan:**
- **Unit:** Form pre-populates with mock expense data
- **Unit:** Save calls updateExpense with correct data
- **Unit:** Access control redirect for unauthorized users

---

### TASK-050: Implement Activity feed page
**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-020
**Depends on:** TASK-031, TASK-034, TASK-021

**Description:**
Create `src/app/activity/page.tsx`. Wrapped in AppLayout. Displays a chronological feed of activity entries across all user's groups. Each entry shows: timestamp (relative), activity type icon, description (e.g., "Alice added 'Dinner' ($50.00) in Weekend Trip"), and group name badge. Empty state when no activity. Uses `useActivity` or direct repository queries.

**Acceptance Criteria:**
- [ ] Activity entries render in reverse chronological order
- [ ] Each entry shows timestamp, type icon, description, and group
- [ ] Empty state shown when no activity exists
- [ ] Scrollable list handles many entries
- [ ] `data-testid="activity-page"` present

**Test Plan:**
- **Unit:** Renders entries from mock data
- **Unit:** Empty state rendering
- **Unit:** Correct chronological ordering

---

### TASK-051: Implement Settings page with export/import
**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-002, REQ-021, REQ-022
**Depends on:** TASK-019, TASK-020, TASK-022, TASK-036, TASK-035

**Description:**
Create `src/app/settings/page.tsx`. Wrapped in AppLayout. Sections: Profile display (name, email, avatar from auth context), "Export Data" button (calls ExportService, downloads JSON), "Import Data" file picker (calls ImportService with validation + conflict handling), "Sign Out" button (calls logout). Shows import progress/results. Conflict handling UI: radio for "Overwrite" vs "Skip".

**Acceptance Criteria:**
- [ ] Profile section shows user name, email, and avatar
- [ ] "Export Data" downloads a valid JSON file
- [ ] "Import Data" accepts a file, validates, and shows results/errors
- [ ] Import conflict UI shows overwrite/skip options
- [ ] "Sign Out" clears session and redirects to login
- [ ] `data-testid="settings-page"` present

**Test Plan:**
- **Unit:** Profile renders from mock auth context
- **Unit:** Export button triggers download (mock ExportService)
- **Unit:** Import flow: valid file, invalid file, conflict handling
- **Unit:** Sign out calls logout

---

### FINAL INTEGRATION

---

### TASK-052: Wire root layout with providers and global configuration
**Phase:** frontend
**Effort:** S
**Status:** ⬜ Pending
**Implements:** REQ-001, REQ-024, REQ-025
**Depends on:** TASK-022, TASK-023, TASK-036, TASK-003

**Description:**
Create `src/app/layout.tsx`. Wrap the entire app with: `GoogleOAuthProvider` (with client ID from env), `RepositoryContext.Provider`, `AuthContext.Provider`, `ToastProvider`. Import globals.css. Add PWA meta tags, viewport meta, theme-color meta. Set page title "ShareSquare".

**Acceptance Criteria:**
- [ ] All providers are correctly nested in root layout
- [ ] Google OAuth provider has client ID from environment variable
- [ ] Global CSS is imported and Tailwind classes work
- [ ] PWA meta tags are present in the HTML head
- [ ] `<title>` is "ShareSquare"

**Test Plan:**
- **Unit:** Verify providers render around children (shallow render)
- **Manual:** Full app loads without provider errors

---

### TASK-053: Implement SVG data visualizations
**Phase:** frontend
**Effort:** M
**Status:** ⬜ Pending
**Implements:** REQ-018
**Depends on:** TASK-026

**Description:**
Create `src/components/CategoryChart/CategoryChart.tsx` — segmented bar chart showing expense breakdown by category using raw SVG elements. Create `src/components/FlowDiagram/FlowDiagram.tsx` — flow diagram mapping payment distribution between members using SVG paths. Both are interactive (hover shows details). Integrated into the Group Detail page as an optional visualization tab.

**Acceptance Criteria:**
- [ ] Bar chart segments are proportional to category spend
- [ ] Flow diagram shows directional arrows between members with amounts
- [ ] Hover/tap on segments shows category name and amount
- [ ] Empty state when no data
- [ ] Responsive: scales to container width

**Test Plan:**
- **Unit:** Chart renders correct number of segments for mock data
- **Unit:** Flow diagram renders arrows between correct member pairs
- **Unit:** Empty state when no expenses

---
