# Requirements: ShareSquare
> Linked to: spec.md v0.1 | Last updated: 2026-03-10

---

## Authentication & User Profiles

### REQ-001: Authenticate users via Google OAuth
**Type:** Functional
**Priority:** Must
**Feature:** F-01
**Description:**
Users must be able to sign in exclusively through Google OAuth 2.0. No email/password registration flow exists. On successful authentication, the system creates or retrieves the user profile using the Google account's email as the unique identifier.

**Acceptance Criteria:**
- [ ] Given an unauthenticated user, when they tap "Sign in with Google", then the Google OAuth consent screen is presented
- [ ] Given a successful Google OAuth callback, when the system receives the token, then a user session is created and the user is redirected to the Dashboard
- [ ] Given a first-time Google sign-in, when authentication succeeds, then a new User record is created with the Google profile data
- [ ] Given a returning user, when authentication succeeds, then the existing User record is retrieved and session restored
- [ ] Given the user denies Google OAuth consent, when the callback returns an error, then an error message is displayed with a retry option

**Edge Cases:**
- Google OAuth service unavailable → show "Unable to reach Google. Please try again." with retry
- User revokes Google app access between sessions → treat as new sign-in flow
- Multiple Google accounts → each email creates a separate ShareSquare user

---

### REQ-002: Display user profile from Google account data
**Type:** Functional
**Priority:** Must
**Feature:** F-02
**Description:**
The user's profile (display name, avatar image, email) must be automatically populated from their Google account. No manual profile editing is required for MVP.

**Acceptance Criteria:**
- [ ] Given an authenticated user, when the profile is rendered, then it displays the Google account name, avatar, and email
- [ ] Given a Google account with no avatar, when the profile is rendered, then a default avatar (initials-based) is shown

**Edge Cases:**
- Google profile picture URL expires or is inaccessible → fall back to initials avatar
- Very long display names → truncate with ellipsis at 30 characters

---

## Group Management

### REQ-003: Create a new expense group
**Type:** Functional
**Priority:** Must
**Feature:** F-03
**Description:**
An authenticated user can create a new group by providing a group name. The system generates a unique alphanumeric invite code. The creator is automatically added as a member with the "admin" role.

**Acceptance Criteria:**
- [ ] Given an authenticated user, when they submit a group name, then a new Group is created with a unique invite code
- [ ] Given a new group, when created, then the creator is added as a GroupMember with role "admin"
- [ ] Given a group creation, when the invite code is generated, then it is a human-readable alphanumeric string (e.g., "APT4B-2026")
- [ ] Given a group name, when it is empty or whitespace-only, then validation prevents creation

**Edge Cases:**
- Invite code collision → regenerate until unique
- Group name at max length (100 chars) → accept; beyond → reject with error
- Offline group creation → store locally, sync invite code validation when online

---

### REQ-004: Join a group via invite code
**Type:** Functional
**Priority:** Must
**Feature:** F-04
**Description:**
An authenticated user can join an existing group by entering the group's alphanumeric invite code. On success, the user is added as a member with the "member" role.

**Acceptance Criteria:**
- [ ] Given a valid invite code, when submitted, then the user is added to the group as a "member"
- [ ] Given an invalid invite code, when submitted, then an error "Code not found, check and try again" is displayed
- [ ] Given a user already in the group, when they enter the same invite code, then an error "You're already a member of this group" is displayed
- [ ] Given the code input, when it contains spaces or special characters, then they are stripped/normalized before validation

**Edge Cases:**
- Case sensitivity → invite codes are case-insensitive (normalize to uppercase)
- Invite code for a deleted group → show "This group no longer exists"

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
A group member can add a new expense by providing: description (required), date (required, defaults to today), amount (required, > 0), category (required, from predefined list), who paid, and how to split. The form follows a step-through flow to reduce cognitive load.

**Acceptance Criteria:**
- [ ] Given a group member on the Add Expense screen, when all required fields are filled and saved, then a new Expense record is created in the group
- [ ] Given the Add Expense form, when the amount is zero or negative, then validation prevents saving
- [ ] Given the Add Expense form, when description is empty, then validation prevents saving
- [ ] Given a saved expense, when balances are recalculated, then all affected member balances update immediately
- [ ] Given the date field, when rendered, then it defaults to today's date

**Edge Cases:**
- Amount with more than 2 decimal places → round to nearest cent
- Very large amounts ($999,999.99 max) → accept; beyond → reject
- All form fields at maximum length → system handles gracefully
- Offline expense creation → store locally, flag as pending sync

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
The expense creator or group admin can edit any field of an existing expense. On save, all affected balances are recalculated.

**Acceptance Criteria:**
- [ ] Given an expense, when the creator or admin taps edit, then the expense form opens pre-populated with current values
- [ ] Given a non-creator, non-admin member, when viewing an expense, then the edit option is not available
- [ ] Given an edited expense, when saved, then all affected member balances are recalculated

**Edge Cases:**
- Editing an expense while offline → store changes locally, sync later
- Editing payer or splits → full recalculation of group balances

---

### REQ-012: Delete an expense
**Type:** Functional
**Priority:** Must
**Feature:** F-11
**Description:**
The expense creator or group admin can delete an expense. A confirmation dialog is shown before deletion. All affected balances are recalculated after deletion.

**Acceptance Criteria:**
- [ ] Given an expense, when the creator or admin taps delete, then a confirmation dialog appears
- [ ] Given confirmation of deletion, when confirmed, then the expense and its payer/split records are removed, and balances recalculate
- [ ] Given a deletion confirmation, when cancelled, then no changes are made

**Edge Cases:**
- Deleting the only expense in a group → balances reset to zero for all members
- Deleting while offline → mark as pending deletion, sync later

---

## Balance & Settlement

### REQ-013: Calculate per-group and cross-group balances
**Type:** Functional
**Priority:** Must
**Feature:** F-12
**Description:**
The system must calculate net balances for each member within each group (what they owe or are owed) and aggregate balances across all groups for the dashboard summary. Balance = (total paid by user) - (total owed by user) for each group.

**Acceptance Criteria:**
- [ ] Given a group with expenses, when balances are calculated, then each member's net balance (paid - owed) is accurate
- [ ] Given a user in multiple groups, when the dashboard loads, then overall "You Owe" and "Owed to You" are the cross-group sums
- [ ] Given a new expense is added, when saved, then balances are immediately recalculated

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
A group member can record a settlement (payment) from one member to another within a group. This reduces the outstanding balance between those two members.

**Acceptance Criteria:**
- [ ] Given two members with an outstanding balance, when a settlement is recorded, then the balance between them is reduced by the settlement amount
- [ ] Given a settlement, when saved, then a Settlement record is created and group balances recalculate
- [ ] Given a settlement amount greater than the outstanding balance, then validation prevents saving (cannot overpay)

**Edge Cases:**
- Settlement of exact outstanding amount → balance between the two becomes $0.00
- Settlement while offline → store locally, sync later
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
The app must have a persistent bottom navigation bar with five items: Dashboard, Groups, Add Expense (+), Activity, and Settings. The "Add Expense" button should be visually prominent (green circular FAB style).

**Acceptance Criteria:**
- [ ] Given any screen in the app, when rendered on mobile, then the bottom nav bar is visible with 5 items
- [ ] Given the bottom nav, when a tab is tapped, then the user navigates to the corresponding screen
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
The Activity screen should show a chronological feed of all actions across all groups the user belongs to, including expense additions, edits, deletions, settlements, and member joins.

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
Users must be able to export their complete data (all users they interact with, groups, expenses, splits, settlements) as a single JSON file that conforms to the defined schema.

**Acceptance Criteria:**
- [ ] Given an authenticated user, when they tap "Export Data", then a `.json` file is downloaded containing all their data
- [ ] Given the exported JSON, when validated against the schema, then it passes with zero errors
- [ ] Given the exported JSON, when imported back, then the app state is restored identically

**Edge Cases:**
- User with no data → export produces a valid JSON with empty arrays
- Very large dataset (1000+ expenses) → export completes within 5 seconds

---

### REQ-022: Import data from JSON file
**Type:** Functional
**Priority:** Must
**Feature:** F-18
**Description:**
Users must be able to import a previously exported JSON file to restore or merge data into the app. The system validates the file against the expected schema before processing.

**Acceptance Criteria:**
- [ ] Given a valid JSON file, when imported, then the data is loaded into the app
- [ ] Given an invalid JSON file (wrong schema), when imported, then a descriptive error message is shown
- [ ] Given a JSON file with conflicting IDs, when imported, then the user is prompted to overwrite or skip conflicts

**Edge Cases:**
- Empty JSON file → show "File contains no data"
- Corrupted/malformed JSON → show "Invalid file format" error
- File size > 10MB → show "File too large" warning

---

### REQ-023: Persist data locally with IndexedDB
**Type:** Functional
**Priority:** Must
**Feature:** F-23
**Description:**
All application state must be persisted in the browser using IndexedDB for offline-first capability. Data is loaded from IndexedDB on app start and written after every mutation.

**Acceptance Criteria:**
- [ ] Given the app loads, when IndexedDB contains data, then the app state is hydrated from local storage
- [ ] Given any data mutation (add/edit/delete), when completed, then the change is immediately persisted to IndexedDB
- [ ] Given the browser is offline, when the user interacts with the app, then all read/write operations work against IndexedDB

**Edge Cases:**
- IndexedDB storage quota exceeded → show warning, suggest exporting data
- Browser private/incognito mode → IndexedDB may be cleared on close; warn user
- Corrupted IndexedDB data → fall back to empty state with option to import from JSON

---

### REQ-024: Implement repository pattern data layer
**Type:** Non-Functional
**Priority:** Must
**Feature:** F-24
**Description:**
All data access must go through a repository abstraction layer with defined interfaces. The MVP implementation uses IndexedDB/localStorage. This pattern ensures a future backend (Supabase, Firebase) can be swapped in by implementing the same interface without changing any UI code.

**Acceptance Criteria:**
- [ ] Given the data layer, when inspected, then all CRUD operations are defined as interface methods on repository classes
- [ ] Given the IndexedDB repository implementation, when used by the UI, then no direct IndexedDB calls exist outside the repository layer
- [ ] Given a new repository implementation (e.g., Supabase), when it implements the same interface, then the UI functions identically without changes

**Edge Cases:**
- Repository method called before IndexedDB is initialized → queue operations until ready

---

## PWA & Offline

### REQ-025: Configure as Progressive Web App
**Type:** Non-Functional
**Priority:** Must
**Feature:** F-20
**Description:**
The app must be configured as a PWA with a web app manifest, service worker for caching, and installability on mobile home screens. Core flows (viewing groups, viewing expenses, viewing balances) must work offline.

**Acceptance Criteria:**
- [ ] Given the app, when audited with Lighthouse, then PWA criteria score is >90
- [ ] Given a mobile browser, when the user adds to home screen, then the app launches in standalone mode with the ShareSquare icon
- [ ] Given no network connection, when the user opens the app, then previously loaded data is accessible
- [ ] Given no network connection, when the user adds an expense, then it is saved locally and flagged for sync

**Edge Cases:**
- Service worker update available → prompt user to refresh
- Cache storage full → evict oldest cached assets

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
