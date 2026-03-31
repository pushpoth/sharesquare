session: 21 | 2026-03-31 | completed: TASK-057, TASK-059, TASK-060

decisions:
  - Display currency preference: **`localStorage`** key **`sharesquare_display_currency`** (not `profiles` column) — see `CurrencyContext`, `constants/currency.ts`, requirements REQ-032 note.
  - **JPY** stored integers are **whole yen** (no ÷100); other ISO codes use **cent** minor units per existing schema (display-only switch, no FX).
  - **Add expense** control sits in a **row with Record Settlement** (REQ-033 adjacency).

discoveries:
  - other: `useCurrency()` outside `CurrencyProvider` falls back to **USD** + no-op setter (tests / edge renders).

next session:
  - All **60/60** tasks from `tasks.md` are marked done; **`context.json`** `status` is **complete** — run a **release / QA pass** (Supabase project, OAuth redirects, real-device PWA) and decide versioning or backlog items outside the task list.
  - Optional: clipboard-unavailable **fallback** for invite copy (REQ-030 edge case).
