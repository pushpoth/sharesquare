# Requirements: ShareSquare

> Linked to: spec.md v0.2 | Last updated: 2026-03-31

---

## Authentication & User Profiles

### REQ-001: Authenticate users via Supabase Auth

**Type:** Functional
**Priority:** Must
**Feature:** F-01
**Description:**
Users must sign in through **Supabase Auth**. Which methods are available (e.g. Google OAuth, email magic link, other OAuth providers) is configured in the **Supabase project dashboard** — not via a separate client-only Google Identity Services integration. On successful authentication, the app establishes a Supabase session (JWT managed by the Supabase client).

**Acceptance Criteria:**

- [ ] Given an unauthenticated user, when they choose a configured sign-in method (e.g. "Continue with Google" or magic link), then the Supabase Auth flow runs and completes in the browser
- [ ] Given a successful sign-in, when the session is established, then the user is redirected to the Dashboard (`/home`)
- [ ] Given a first-time sign-in, when authentication succeeds, then a **profile** row (or equivalent) exists for `auth.users.id` with display name, email, and avatar from Auth user metadata
- [ ] Given a returning user, when authentication succeeds, then the session is restored and profile data loads from Supabase
- [ ] Given the user cancels or denies the auth flow, when an error is returned, then an error message is displayed with a retry option

**Edge Cases:**

- Auth provider unavailable → show a retry message and suggest checking network or provider status
- Session expired → user is prompted to sign in again
- Multiple accounts (e.g. different emails) → each `auth.users` identity is distinct; profile keyed by user id

---

### REQ-002: Display user profile from Supabase

**Type:** Functional
**Priority:** Must
**Feature:** F-02
**Description:**
The user's profile (display name, avatar image, email) must be shown from **Supabase Auth user metadata and/or the `profiles` table** (or equivalent). No separate manual profile editor is required for MVP.

**Acceptance Criteria:**

- [ ] Given an authenticated user, when the profile is rendered, then it displays name, avatar, and email from the session/profile source of truth
- [ ] Given a user with no avatar URL, when the profile is rendered, then a default avatar (initials-based) is shown

**Edge Cases:**

- Profile picture URL broken or blocked → fall back to initials avatar
- Very long display names → truncate with ellipsis at 30 characters

---

## Group Management

### REQ-003: Create a new expense group

**Type:** Functional
**Priority:** Must
**Feature:** F-03
**Description:**
An authenticated user can create a new group by providing a group name. The system generates a unique alphanumeric invite code and persists the group in **Supabase Postgres**. The creator is automatically added as a member with the "admin" role.

**Acceptance Criteria:**

- [ ] Given an authenticated user, when they submit a group name, then a new Group is created with a unique invite code stored in the database
- [ ] Given a new group, when created, then the creator is added as a GroupMember with role "admin"
- [ ] Given a group creation, when the invite code is generated, then it is a human-readable alphanumeric string (e.g., "APT4B-2026")
- [ ] Given a group name, when it is empty or whitespace-only, then validation prevents creation

**Edge Cases:**

- Invite code collision on insert → regenerate and retry (database unique constraint on `invite_code`)
- Group name at max length (100 chars) → accept; beyond → reject with error
- **No network** → creation cannot complete; show that connection is required (MVP is online-first)

---

### REQ-004: Join a group via invite code

**Type:** Functional
**Priority:** Must
**Feature:** F-04
**Description:**
An authenticated user can join an existing group by entering the group's alphanumeric invite code. The client resolves the code against **Postgres** (via Supabase client under RLS). On success, the user is added as a member with the "member" role.

**Acceptance Criteria:**

- [ ] Given a valid invite code, when submitted, then the user is added to the group as a "member"
- [ ] Given an invalid invite code, when submitted, then an error "Code not found, check and try again" is displayed
- [ ] Given a user already in the group, when they enter the same invite code, then an error "You're already a member of this group" is displayed
- [ ] Given the code input, when it contains spaces or special characters, then they are stripped/normalized before validation

**Edge Cases:**

- Case sensitivity → invite codes are case-insensitive (normalize to uppercase)
- Invite code for a deleted group → show "This group no longer exists" or same as invalid code per product copy
- User offline when joining → surface that an internet connection is required

---

### REQ-005: Display groups directory on dashboard

**Type:** Functional
**Priority:** Must
**Feature:** F-05
**Description:**
The Dashboard/Home screen must display the user's overall balance summary (total owed, total owed to them) and a list of all groups they belong to, showing group name, member count, member avatars, total expenses, the user's balance in that group, and last activity timestamp.

**Acceptance Criteria:**

- [ ] Given an authenticated user with groups, when the Dashboard loads, then the overall balance card shows "You Owe" and "Owed to You" totals
- [ ] Given an authenticated user with groups, when the Dashboard loads, then each group card shows: name, member avatars, total expenses, user's net balance, and last activity time
- [ ] Given an authenticated user with no groups, when the Dashboard loads, then an empty state is shown with a prompt to create or join a group
- [ ] Given a balance that is owed by the user, when displayed, then it shows in a distinct style (e.g., red/orange text with "OWED" label)

**Edge Cases:**

- User in 0 groups → empty state with call-to-action
- User in 50+ groups → scrollable list, no pagination required for MVP
- Balance of exactly $0.00 → show "Settled Up" instead of $0.00

---

## Expense Management

### REQ-006: Add an expense to a group

**Type:** Functional
**Priority:** Must
**Feature:** F-07
**Description:**
A group member can add a new expense by providing: description (required), date (required, defaults to today), amount (required, > 0), category (required, from predefined list), who paid, and how to split. The form follows a step-through flow to reduce cognitive load. Data is persisted in **Supabase**.

**Acceptance Criteria:**

- [ ] Given a group member on the Add Expense screen, when all required fields are filled and saved, then a new Expense record is created in the group in the database
- [ ] Given the Add Expense form, when the amount is zero or negative, then validation prevents saving
- [ ] Given the Add Expense form, when description is empty, then validation prevents saving
- [ ] Given a saved expense, when balances are recalculated, then all affected member balances update after data is loaded from the server
- [ ] Given the date field, when rendered, then it defaults to today's date

**Edge Cases:**

- Amount with more than 2 decimal places → round to nearest cent
- Very large amounts ($999,999.99 max) → accept; beyond → reject
- All form fields at maximum length → system handles gracefully
- **Offline** → cannot save; show connectivity error (MVP online-first)

---

### REQ-007: Select payer(s) for an expense

**Type:** Functional
**Priority:** Must
**Feature:** F-07
**Description:**
When adding an expense, the user must select who paid. Options are a single group member or "Group" (indicating the expense was paid from a shared fund). For single payer, the full amount is attributed to that member.

**Acceptance Criteria:**

- [ ] Given the "Who Paid" selector, when rendered, then it lists all group members plus a "Group" option
- [ ] Given a single payer selected, when the expense is saved, then an ExpensePayer record is created with the full amount
- [ ] Given "Group" selected, when the expense is saved, then payer amounts are split equally among all members (each member is both payer and owes)

**Edge Cases:**

- Group with only 1 member → payer defaults to that member, split is self-only (no balance change)

---

### REQ-008: Split expense equally

**Type:** Functional
**Priority:** Must
**Feature:** F-08
**Description:**
When "Split Equally" is selected, the expense amount is divided evenly among all selected members. Rounding differences (e.g., $100 / 3 = $33.33, $33.33, $33.34) are handled by assigning the remainder cent to the first member.

**Acceptance Criteria:**

- [ ] Given an equal split among N members, when calculated, then each member's share is floor(amount/N) with remainder cents distributed one per member from first to last
- [ ] Given the "Split Equally" checkbox, when checked, then all member amount fields auto-populate and become read-only
- [ ] Given the "Split Equally" checkbox, when unchecked, then member amount fields become editable for exact-amount or percentage entry

**Edge Cases:**

- Split among 1 member → entire amount to that member
- Amount that divides evenly → no remainder handling needed
- $0.01 split among 3 → one member gets $0.01, others get $0.00

---

### REQ-009: Split expense by exact amounts

**Type:** Functional
**Priority:** Must
**Feature:** F-09
**Description:**
When splitting by exact amounts, the user manually enters the dollar amount each member owes. The system validates that all individual amounts sum to the total expense amount before saving.

**Acceptance Criteria:**

- [ ] Given exact-amount mode, when the user edits a member's amount, then the running total is displayed in real-time
- [ ] Given exact-amount mode, when the sum of splits does not equal the expense total, then a validation error prevents saving
- [ ] Given exact-amount mode, when a member's amount is set to $0.00, then they owe nothing for this expense

**Edge Cases:**

- All amounts set to $0.00 → validation error (must sum to total)
- Negative amount for a member → reject, amounts must be >= 0

---

### REQ-010: Split expense by custom percentages

**Type:** Functional
**Priority:** Must
**Feature:** F-10
**Description:**
When splitting by percentages, the user assigns a percentage to each member. Percentages must sum to 100%. The system calculates dollar amounts from the percentages applied to the total.

**Acceptance Criteria:**

- [ ] Given percentage mode, when percentages are entered, then dollar amounts are calculated and displayed in real-time
- [ ] Given percentage mode, when percentages do not sum to 100%, then a validation error prevents saving
- [ ] Given percentage mode, when a member's percentage is 0%, then they owe nothing for this expense

**Edge Cases:**

- Percentages that produce fractional cents → round to nearest cent, adjust remainder
- 100% assigned to one member → valid, that member owes the full amount

---

### REQ-011: Edit an existing expense

**Type:** Functional
**Priority:** Must
**Feature:** F-11
**Description:**
The expense creator or group admin can edit any field of an existing expense. On save, all affected balances are recalculated after the update is persisted in Supabase.

**Acceptance Criteria:**

- [ ] Given an expense, when the creator or admin taps edit, then the expense form opens pre-populated with current values
- [ ] Given a non-creator, non-admin member, when viewing an expense, then the edit option is not available
- [ ] Given an edited expense, when saved, then all affected member balances are recalculated

**Edge Cases:**

- **Offline** → edit cannot be saved; show error (MVP online-first)
- Editing payer or splits → full recalculation of group balances

---

### REQ-012: Delete an expense

**Type:** Functional
**Priority:** Must
**Feature:** F-11
**Description:**
The expense creator or group admin can delete an expense. A confirmation dialog is shown before deletion. All affected balances are recalculated after deletion in the database.

**Acceptance Criteria:**

- [ ] Given an expense, when the creator or admin taps delete, then a confirmation dialog appears
- [ ] Given confirmation of deletion, when confirmed, then the expense and its payer/split records are removed in the database, and balances recalculate
- [ ] Given a deletion confirmation, when cancelled, then no changes are made

**Edge Cases:**

- Deleting the only expense in a group → balances reset to zero for all members
- **Offline** → deletion cannot complete; show connectivity error

---

## Balance & Settlement

### REQ-013: Calculate per-group and cross-group balances

**Type:** Functional
**Priority:** Must
**Feature:** F-12
**Description:**
The system must calculate net balances for each member within each group (what they owe or are owed) and aggregate balances across all groups for the dashboard summary. Balance = (total paid by user) - (total owed by user) for each group. Inputs come from **data fetched from Supabase**.

**Acceptance Criteria:**

- [ ] Given a group with expenses, when balances are calculated, then each member's net balance (paid - owed) is accurate
- [ ] Given a user in multiple groups, when the dashboard loads, then overall "You Owe" and "Owed to You" are the cross-group sums
- [ ] Given a new expense is added, when saved, then balances reflect the latest server state after reload or cache invalidation

**Edge Cases:**

- Group with no expenses → all balances are $0.00
- User removed from group → their balance contributions remain in historical expenses
- Floating point precision → use integer cents internally, display as dollars

---

### REQ-014: Simplify debts within a group

**Type:** Functional
**Priority:** Should
**Feature:** F-13
**Description:**
The system should apply a debt simplification algorithm to minimize the number of transactions needed to settle all balances within a group. For example, if A owes B $10 and B owes C $10, the simplified result is A owes C $10 directly.

**Acceptance Criteria:**

- [ ] Given a group with multiple debts, when simplification runs, then the number of settlement transactions is minimized
- [ ] Given simplified debts, when displayed, then each entry shows "X owes Y: $Z"
- [ ] Given debts that are already minimal, when simplification runs, then no changes occur

**Edge Cases:**

- All members have zero balance → no debts to display
- Circular debts (A→B→C→A) → fully resolved to net transfers
- Large groups (10+ members) → algorithm completes in <100ms

---

### REQ-015: Record a settlement between members

**Type:** Functional
**Priority:** Must
**Feature:** F-14
**Description:**
A group member can record a settlement (payment) from one member to another within a group. This reduces the outstanding balance between those two members. Persisted in Supabase.

**Acceptance Criteria:**

- [ ] Given two members with an outstanding balance, when a settlement is recorded, then the balance between them is reduced by the settlement amount
- [ ] Given a settlement, when saved, then a Settlement record is created and group balances recalculate
- [ ] Given a settlement amount greater than the outstanding balance, then validation prevents saving (cannot overpay)

**Edge Cases:**

- Settlement of exact outstanding amount → balance between the two becomes $0.00
- **Offline** → cannot save; show connectivity error
- Settlement recorded by a third member → allowed (any group member can record)

---

## Views & Navigation

### REQ-016: Display group detail with expenses and balances

**Type:** Functional
**Priority:** Must
**Feature:** F-06
**Description:**
The Group Detail view must show: group name (editable by admin), total group expenses, member balance summary (each member's net owed/owing), and a chronological list of recent expenses showing date, payer, description, total, and the current user's split.

**Acceptance Criteria:**

- [ ] Given a group, when the detail page loads, then the group total expenses and member balances are displayed
- [ ] Given a group, when the detail page loads, then recent expenses are listed with date, payer, title, total amount, and user's split
- [ ] Given a group admin, when they tap the edit icon on the group name, then they can rename the group

**Edge Cases:**

- Group with 0 expenses → show empty state: "No expenses yet. Add the first one!"
- Expense list with 100+ items → virtualized/scrollable list
- Member with $0 balance → show "Owed $0" or "Settled Up"

---

### REQ-017: Filter and sort expense list

**Type:** Functional
**Priority:** Should
**Feature:** F-15
**Description:**
The expense list within a group should be filterable by date range, category, and amount range, and sortable by date, amount, or category.

**Acceptance Criteria:**

- [ ] Given an expense list, when a category filter is applied, then only expenses matching that category are shown
- [ ] Given an expense list, when a date range filter is applied, then only expenses within that range are shown
- [ ] Given an expense list, when sorted by amount, then expenses are ordered by total amount (ascending or descending)

**Edge Cases:**

- No expenses match filters → show "No expenses match your filters" with a clear-filters button
- Multiple filters applied simultaneously → AND logic (all conditions must match)

---

### REQ-018: Render data visualizations with SVG

**Type:** Functional
**Priority:** Could
**Feature:** F-16
**Description:**
The app should provide interactive SVG-based visualizations including: a segmented bar chart showing expense breakdown by category, and a flow diagram mapping how costs are distributed among members.

**Acceptance Criteria:**

- [ ] Given a group with categorized expenses, when the visualization view is opened, then a segmented bar chart shows each category's proportion
- [ ] Given a group with expenses, when the flow diagram is rendered, then it shows payment flows between members

**Edge Cases:**

- Only one category → single-color bar
- No expenses → show empty state instead of empty chart

---

### REQ-019: Provide bottom navigation bar

**Type:** Functional
**Priority:** Must
**Feature:** F-21
**Description:**
The app must have a persistent bottom navigation bar with five items: Dashboard, Groups, Add Expense (+), Activity, and Settings. The "Add Expense" button should be visually prominent (green circular FAB style). Navigation uses **React Router** (or equivalent SPA router).

**Acceptance Criteria:**

- [ ] Given any screen in the app, when rendered on mobile, then the bottom nav bar is visible with 5 items
- [ ] Given the bottom nav, when a tab is tapped, then the user navigates to the corresponding route
- [ ] Given the "Add Expense" button, when rendered, then it is visually distinguished (green circle, larger icon)
- [ ] Given the current screen, when the nav renders, then the active tab is highlighted

**Edge Cases:**

- Keyboard open on mobile → bottom nav may be hidden (acceptable)
- Desktop viewport → bottom nav still displayed (mobile-first, but functional on desktop)

---

### REQ-020: Display activity feed

**Type:** Functional
**Priority:** Should
**Feature:** F-22
**Description:**
The Activity screen should show a chronological feed of all actions across all groups the user belongs to, including expense additions, edits, deletions, settlements, and member joins. Data is stored and read from **Supabase**.

**Acceptance Criteria:**

- [ ] Given user activity across groups, when the Activity screen loads, then events are listed chronologically (newest first)
- [ ] Given an activity entry, when rendered, then it shows: timestamp, action type, group name, and brief description

**Edge Cases:**

- No activity yet → empty state: "No activity yet. Start by creating a group!"
- High volume of activity → lazy loading / virtual scroll

---

## Data Portability & Storage

### REQ-021: Export all data as JSON

**Type:** Functional
**Priority:** Must
**Feature:** F-17
**Description:**
Users must be able to export their complete permitted data (groups they belong to, expenses, splits, settlements, related users as needed) as a single JSON file that conforms to the defined schema. Data is **read via repositories** from Supabase.

**Acceptance Criteria:**

- [ ] Given an authenticated user, when they tap "Export Data", then a `.json` file is downloaded containing their data
- [ ] Given the exported JSON, when validated against the schema, then it passes with zero errors
- [ ] Given the exported JSON, when imported back (where supported), then the app state is restored consistently with import rules

**Edge Cases:**

- User with no data → export produces a valid JSON with empty arrays
- Very large dataset (1000+ expenses) → export completes within reasonable time or shows progress (target: under ~30s for MVP)

---

### REQ-022: Import data from JSON file

**Type:** Functional
**Priority:** Must
**Feature:** F-18
**Description:**
Users must be able to import a previously exported JSON file to restore or merge data. The system validates the file against the expected schema before writing via repositories to **Supabase** (subject to RLS and ownership rules).

**Acceptance Criteria:**

- [ ] Given a valid JSON file, when imported, then the data is applied according to the chosen strategy (merge/overwrite) through the data layer
- [ ] Given an invalid JSON file (wrong schema), when imported, then a descriptive error message is shown
- [ ] Given a JSON file with conflicting IDs, when imported, then the user is prompted to overwrite or skip conflicts

**Edge Cases:**

- Empty JSON file → show "File contains no data"
- Corrupted/malformed JSON → show "Invalid file format" error
- File size > 10MB → show "File too large" warning

---

### REQ-023: Persist application data in Supabase Postgres

**Type:** Functional
**Priority:** Must
**Feature:** F-23
**Description:**
All authoritative application state for groups, expenses, settlements, memberships, and activity must be stored in **Supabase Postgres**. The app is **online-first**: reads and writes require a successful round-trip to Supabase under normal operation. **Row Level Security (RLS)** must enforce which rows each authenticated user can access.

**Acceptance Criteria:**

- [ ] Given an authenticated user with connectivity, when the app loads data, then entities are fetched from Supabase according to RLS
- [ ] Given any successful mutation, when completed, then the change is reflected in Postgres (and visible on subsequent fetch)
- [ ] Given the user is offline, when they attempt a data mutation, then the operation fails with a clear message (no silent local-only write for MVP)

**Edge Cases:**

- Supabase rate limits or transient errors → retry with user-visible message
- Session invalid → redirect to sign-in
- Import/export remains available as a portability path; export does not replace cloud persistence

---

### REQ-024: Implement repository pattern data layer

**Type:** Non-Functional
**Priority:** Must
**Feature:** F-24
**Description:**
All data access must go through a repository abstraction layer with defined interfaces. The MVP implementation uses the **Supabase JS client** against Postgres. UI and services must not embed ad hoc SQL or bypass RLS assumptions.

**Acceptance Criteria:**

- [ ] Given the data layer, when inspected, then all CRUD operations are defined as interface methods on repository classes
- [ ] Given the Supabase repository implementation, when used by the UI, then no direct `from('table')` calls exist outside the repository layer (except the shared client module used by repositories)
- [ ] Given tests, when they need data access, then they mock repository interfaces or use a test double — not production keys with elevated privileges in the browser

**Edge Cases:**

- Repository method called before session is ready → queue or reject with clear error per UX choice

---

## PWA & Online-First Shell

### REQ-025: Configure as Progressive Web App (online-first)

**Type:** Non-Functional
**Priority:** Must
**Feature:** F-20
**Description:**
The app must be configured as a PWA with a web app manifest, service worker for **precaching the app shell and static assets**, and installability on mobile home screens. **Core data flows require network access** for MVP; the service worker does not guarantee offline expense CRUD.

**Acceptance Criteria:**

- [ ] Given the app, when audited with Lighthouse, then PWA installability / best-practice criteria are met to a high standard (target >90 where applicable)
- [ ] Given a mobile browser, when the user adds to home screen, then the app launches in standalone mode with the ShareSquare icon
- [ ] Given repeat visits, when the user opens the app, then cached shell/assets load quickly
- [ ] Given no network, when the user attempts to load or mutate cloud data, then the app surfaces an offline or error state — it must not claim success for unsynced writes

**Edge Cases:**

- Service worker update available → prompt user to refresh
- Cache storage full → evict oldest cached assets per Workbox strategy

---

## UI / Aesthetics

### REQ-026: Implement mobile-first responsive layout

**Type:** Non-Functional
**Priority:** Must
**Feature:** F-21
**Description:**
The entire app must be designed mobile-first using Tailwind CSS. The primary viewport is 375px–428px (iPhone range). Layouts must be usable but not necessarily optimized for desktop widths.

**Acceptance Criteria:**

- [ ] Given a 375px viewport, when any screen is rendered, then all content is accessible without horizontal scrolling
- [ ] Given a desktop viewport (1280px+), when any screen is rendered, then the layout remains centered and usable (max-width container)

**Edge Cases:**

- Very small viewport (<320px) → graceful degradation, no broken layouts
- Landscape orientation on mobile → usable but not optimized

---

### REQ-027: Apply mint-green and white color palette

**Type:** Non-Functional
**Priority:** Must
**Feature:** F-05, F-06
**Description:**
The app must use a consistent color palette derived from the screen designs: primary mint green for action elements and balance cards, white/light gray backgrounds, deep charcoal for text, and muted sage green for the header/nav. Accent colors for "owed" (warm tone) vs "owing" (cool/green tone) status.

**Acceptance Criteria:**

- [ ] Given the app, when rendered, then the color palette matches the provided screen designs (mint green primary, white backgrounds, charcoal text)
- [ ] Given balance displays, when positive (owed to user), then they use green styling; when negative (user owes), then they use a distinct warm/neutral styling
- [ ] Given the bottom nav bar, when rendered, then it uses a muted sage/olive green background matching the designs

**Edge Cases:**

- Dark mode → not required for MVP (explicitly out of scope)

---

### REQ-028: Render category selection for expenses

**Type:** Functional
**Priority:** Must
**Feature:** F-07
**Description:**
The expense form must include a category selector with predefined categories: Food, Rent, Utilities, Transport, Entertainment, Shopping, Health, Travel, Other. Each category should have a recognizable icon.

**Acceptance Criteria:**

- [ ] Given the Add Expense form, when the category field is rendered, then it shows a dropdown or selector with all predefined categories
- [ ] Given a category, when selected, then it is stored with the expense and displayed in expense lists
- [ ] Given no category selected, when the user attempts to save, then validation prevents saving (category is required)

**Edge Cases:**

- "Other" category selected → no additional input required for MVP (free-text subcategory is out of scope)

---

### REQ-029: Resolve invite codes via Supabase Postgres

**Type:** Functional
**Priority:** Must
**Feature:** F-03, F-04
**Description:**
Invite codes must be **unique in the database** (`groups.invite_code` unique constraint) and resolvable across users and devices. When a group is created, the row is inserted into Postgres with the generated code. When a user joins, the client queries by invite code (under **RLS** policies that allow authenticated users to look up a group by code for joining) and then inserts a membership row. No separate Vercel KV or Next.js API routes are used.

**Acceptance Criteria:**

- [ ] Given a new group is created, when the invite code is generated, then it is stored on the `groups` row in Postgres
- [ ] Given a unique constraint violation on `invite_code`, when insert fails, then the client regenerates the code and retries at least once
- [ ] Given a user enters a valid invite code, when submitted, then the client resolves the group via Supabase and adds membership
- [ ] Given an invalid or non-existent code, when submitted, then the client shows "Code not found, check and try again."
- [ ] Given a network or Supabase error during group creation, then an error is surfaced and the group row is not left in an inconsistent state (transaction or RPC)
- [ ] RLS prevents reading arbitrary groups except where policy allows (e.g. membership or invite lookup path)

**Edge Cases:**

- User offline when joining → surface "You need an internet connection to join a group via code"
- Supabase unavailable → surface "Unable to connect. Please try again."

---

### REQ-030: Display and copy invite code from Group Detail page

**Type:** Functional
**Priority:** Must
**Feature:** F-03
**Description:**
All group members (not just admins) must be able to see and copy the group's invite code directly from the Group Detail page. This is the primary mechanism for inviting new members to an existing group.

**Acceptance Criteria:**

- [x] Given a group detail page, when loaded by any member, then the group's invite code is prominently displayed
- [x] Given the invite code display, when the user taps "Copy Code", then the code is copied to the clipboard using the Clipboard API
- [x] Given a successful copy, when the copy action completes, then a confirmation ("Copied!") appears for 2 seconds
- [x] Given the invite code, when displayed, then it is formatted in monospace/code style for easy reading

**Edge Cases:**

- Clipboard API not available (some browser contexts): show the code in a selectable text field as a fallback (not yet implemented)
- Very small viewport: invite code section should not overflow horizontally

---

### REQ-031: Delete a group and cascade all related data

**Type:** Functional
**Priority:** Must
**Feature:** F-03
**Description:**
A group admin can permanently delete a group. Deletion cascades to all associated records in Postgres: expenses, expense payers, expense splits, settlements, activity entries, and group memberships — via **ON DELETE CASCADE**, a **database RPC**, or explicit ordered deletes in the repository. A confirmation dialog must be presented before deletion. After deletion, the user is returned to the Groups list.

**Acceptance Criteria:**

- [ ] Given a group admin, when they choose to delete the group, then a confirmation dialog shows the group name and warns the action is permanent
- [ ] Given the user confirms deletion, when processed, then the group and all dependent rows are removed from Postgres (no orphans)
- [ ] Given the user cancels deletion, when the dialog is dismissed, then no data is changed
- [ ] Given successful deletion, when complete, then the user is navigated to `/groups` and a toast confirms "Group deleted."
- [ ] Given a non-admin member, when viewing the group, then no delete option is visible

**Edge Cases:**

- Group with no expenses: deletion still proceeds (removes group and membership records only)
- Deleting a group that is the only group the user belongs to: allowed, user lands on empty groups page
- **Offline** → show that deletion requires connectivity

---

### REQ-032: App-level currency selection

**Type:** Functional
**Priority:** Must
**Feature:** F-07 (extended)
**Description:**
Users must be able to set a preferred currency for the entire app from the Settings page. The currency setting controls the symbol and formatting of all monetary values displayed in the app. No currency conversion is performed — the setting is a display preference only. All stored values remain in integer cents (or JPY units per existing rules) regardless of currency.

**Supported currencies (MVP):**
USD ($), EUR (€), GBP (£), INR (₹), AUD (A$), CAD (C$), JPY (¥), SGD (S$)

**Special formatting rules:**

- JPY: no decimal places (¥1,250 not ¥12.50; stored as integer units, not cents)
- All others: two decimal places

**Acceptance Criteria:**

- [x] Given the Settings page, when loaded, then a currency selector displays all 8 supported currencies as "USD ($)", "EUR (€)", etc.
- [x] Given the user selects a currency, when saved, then all monetary displays in the app update immediately to use the new symbol and formatting
- [x] Given the app is restarted, when loaded, then the previously selected currency is restored
- [x] Given no currency has been set, when the app first loads, then USD is the default
- [x] Given any balance, expense amount, or settlement amount is displayed, then it uses the selected currency symbol

**Edge Cases:**

- Currency changed after expenses are already recorded: amounts display in new currency symbol without conversion (no data migration needed)
- JPY selected: expense amounts entered as whole units (¥1,250); the stored value is treated as full units for display

**Implementation note:** Preference is stored in **`localStorage`** key `sharesquare_display_currency` (see `CurrencyContext`, `constants/currency.ts`, design §contexts).

---

### REQ-033: Add Expense shortcut on Group Detail page

**Type:** Functional
**Priority:** Must
**Feature:** F-07
**Description:**
The Group Detail page must provide a direct "Add Expense" button adjacent to the "Record Settlement" button. Tapping it navigates to the Add Expense route with the current group pre-selected and the group field locked (non-editable). This reduces friction for the primary workflow of repeatedly adding expenses within a group.

**Acceptance Criteria:**

- [x] Given the Group Detail page, when loaded, then an "Add Expense" button is visible adjacent to the "Record Settlement" button
- [x] Given the user taps "Add Expense" from a group, when the form loads, then the group is pre-selected based on the `groupId` query parameter (or equivalent)
- [x] Given the form is opened via the group shortcut, when rendered, then the group selector field is read-only (cannot be changed)
- [x] Given the Add Expense screen is opened via the bottom nav (not from a group), when rendered, then the group selector remains editable and no group is pre-selected
- [x] Given the expense is saved from the pre-selected group context, when complete, then the user is navigated back to that group's detail page

**Edge Cases:**

- Invalid groupId in query parameter: fall back to editable group selector
- User navigates directly to `/expenses/new?groupId=<id>` for a group they are not a member of: show "You are not a member of this group" and render editable group selector
