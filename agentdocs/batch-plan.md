# Batch Plan: sharesquare

> **Updated:** 2026-03-31 · **Total tasks:** 60 · **Done through Batch 13:** 43 tasks (see `context.json` `tasks_done`) · **App today:** Vite + PWA; Supabase Auth when real project URL; repos = Dexie unless `VITE_USE_SUPABASE_REPOS=true`.

Batches follow `context.json` **`depends_on`**: a task appears only after all listed dependencies are **done**. Each batch targets **3–5 tasks**, **≤2 M-effort**, **no L** in one batch where possible.

---

## ~~Batch 1 — Infra foundation~~

Focus: Vite scaffold, ESLint/Jest/Prettier, PWA plugin

TASK-001, TASK-002, TASK-003

---

## ~~Batch 2 — Types, constants, utilities~~

Focus: domain types, `COLORS` / routes, currency + validation helpers

TASK-004, TASK-005, TASK-006

---

## ~~Batch 3 — Supabase schema + repository interfaces~~

Focus: migrations + RLS + RPC helpers; TS repository contracts + errors

TASK-007, TASK-008

---

## ~~Batch 4 — Supabase repositories (core data)~~

Focus: profile, groups, expenses — **requires live DB** with migration applied. Use `find_group_by_invite_code` / `create_group_with_admin` where RLS requires it.

TASK-009, TASK-010, TASK-011

---

## ~~Batch 5 — Supabase repositories (remainder) + client factory + RLS review~~

Focus: settlements, activity, then **`@supabase/supabase-js` singleton** wiring all five repos (`TASK-014` blocks `TASK-023`). **`TASK-056`** (`depends_on`: 007, 010) belongs here so invite/join behavior is validated right after **`TASK-010`**.

TASK-012, TASK-013, TASK-014, TASK-056

---

## ~~Batch 6 — Auth session + invite service + dashboard config~~

Focus: `TASK-015` (session helpers) unblocks **`TASK-022`**; **`TASK-016`** needs **`TASK-010`** (group repo for code collision checks). **`TASK-054`** only needs **`TASK-007`** — do early so OAuth/magic-link matches deployed URLs.

TASK-015, TASK-016, TASK-054

---

## ~~Batch 7 — Profile sync trigger + balance services~~

Focus: **`TASK-055`** after **`TASK-015`** (profile upsert path); **`TASK-017` → `TASK-018`** chain for balances / simplification.

TASK-055, TASK-017, TASK-018

---

## ~~Batch 8 — Export / import / activity service~~

Focus: **`TASK-020`** after **`TASK-019`**; **`TASK-021`** needs **`TASK-013`** (activity repo).

TASK-019, TASK-020, TASK-021

---

## ~~Batch 9 — AuthContext + RepositoryContext~~

Focus: **`TASK-022`** after **`TASK-015`**; **`TASK-023`** after **`TASK-014`**. *`AppRoutes` exists from TASK-001; full **`TASK-052`** waits on **`TASK-036`** (Toast).*

TASK-022, TASK-023

---

## ~~Batch 10 — Data hooks~~

Focus: all require **`TASK-023`**; **`TASK-024`** also needs **`TASK-016`**; **`TASK-025`/`TASK-027`** need **`TASK-021`**; **`TASK-026`** needs **`TASK-017`**, **`TASK-018`**.

TASK-024, TASK-025, TASK-026, TASK-027

---

## ~~Batch 11 — Global UI primitives (low deps)~~

Focus: **`TASK-029`** (BottomNav) only needs constants; **`TASK-034`–`TASK-036`** have **no** task deps — unblocks pages and **`TASK-052`**.

TASK-029, TASK-034, TASK-035, TASK-036

---

## ~~Batch 12 — Header + member / card components~~

Focus: **`TASK-028`** needs **`TASK-022`**; **`TASK-031`–`TASK-033`** feed group dashboard and lists.

TASK-028, TASK-031, TASK-032, TASK-033

---

## ~~Batch 13 — App shell + expense building blocks~~

Focus: **`TASK-030`** needs **`TASK-028`**, **`TASK-029`**, **`TASK-022`**; **`TASK-037`** (M) + list/filter/balance rows.

TASK-030, TASK-037, TASK-038, TASK-039, TASK-040

---

## Batch 14 — Group forms + settlement

Focus: **`TASK-041`**, **`TASK-042`** need **`TASK-024`** + **`TASK-036`**; **`TASK-043`** needs **`TASK-027`**, **`TASK-031`**, **`TASK-006`**.

TASK-041, TASK-042, TASK-043

---

## Batch 15 — Landing + dashboard pages

Focus: **`TASK-044`** needs **`TASK-022`**, **`TASK-003`**; **`TASK-045`** needs shell, cards, **`TASK-026`**, **`TASK-024`**, etc.

TASK-044, TASK-045

---

## Batch 16 — Groups + group detail pages

Focus: **`TASK-046`**, **`TASK-047`** (heavy integration).

TASK-046, TASK-047

---

## Batch 17 — Expense pages + activity

Focus: **`TASK-048`–`TASK-050`**.

TASK-048, TASK-049, TASK-050

---

## Batch 18 — Settings + router hardening + charts

Focus: **`TASK-051`** (export/import); **`TASK-052`** completes provider/router checklist; **`TASK-053`** needs **`TASK-026`**.

TASK-051, TASK-052, TASK-053

---

## Batch 19 — Delete group (admin)

Focus: **`TASK-058`** (M) after group detail + repos **`TASK-010`–`TASK-013`** and related UI.

TASK-058

---

## Batch 20 — Polish + shortcuts

Focus: **`TASK-057`** (invite on detail); **`TASK-059`** (currency in settings); **`TASK-060`** (add-expense shortcut).

TASK-057, TASK-059, TASK-060

---

### Sequencing notes

| Topic | Note |
|--------|------|
| **TASK-014 before hooks** | Repository factory must exist before **`TASK-023`** and any hook that will call Supabase. |
| **TASK-016 before TASK-024** | `useGroups` / invite generation assume **`InviteCodeService`** + group repo. |
| **TASK-054** | Supabase Auth redirect URLs — do before end-to-end OAuth testing. |
| **TASK-056** | Scheduled in **Batch 5** after **`TASK-010`**; re-run if RLS or RPCs change later. |
| **TASK-052 vs current code** | Routing shell landed in TASK-001; **`TASK-052`** is close-out + any remaining provider/order requirements. |
| **IndexedDB** | Remains default in **`RepositoryContext`** until factory switches implementations to `src/repositories/supabase/*`. |

When splitting a batch mid-flight, **edit this file in place** (strikethrough completed tasks, adjust IDs) per spec-it Phase 4 rules — do not regenerate from scratch.
