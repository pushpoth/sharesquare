session: 7 | 2026-04-01 | completed: TASK-015, TASK-016, TASK-054

decisions:

- **`isSupabaseAuthConfigured()`** in `readEnv.ts`: requires URL + anon key and **excludes** `https://test.supabase.co` so Jest keeps **Dexie + localStorage** auth path; real project enables OAuth UI + `AuthProvider` Supabase branch.
- **`ensureProfile`** uses `profiles` **upsert** `onConflict: id` after each session; pairs with TASK-055 (trigger vs app-only) later.
- **Invite codes:** `normalizeCode` hyphenates bare **8** alphanumeric chars to `XXXX-XXXX` so lookup matches DB/RPC storage when users omit the hyphen.

next session:

- start with: **Batch 7** — TASK-055, TASK-017, TASK-018 (profile trigger or doc + balance + debt simplification).
- check first: whether to add SQL trigger for `profiles` or document app-only `ensureProfile` as source of truth.
- watch out: `BalanceService` must stay pure (no repo imports); cents-only math.
