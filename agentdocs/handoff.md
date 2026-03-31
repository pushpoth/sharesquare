session: 4 | 2026-03-31 | completed: TASK-007, TASK-008

decisions:

- SQL: single migration `supabase/migrations/20260331140000_initial_schema.sql` — tables, indexes, `set_updated_at` trigger, RLS, helper functions `is_group_member` / `is_group_admin`, `find_group_by_invite_code`, RPC `create_group_with_admin`.
- Groups are not SELECTable by non-members via table RLS; join flow must use **`find_group_by_invite_code`** (or RPC) from the Supabase `GroupRepository` (TASK-010).
- `IExpenseRepository` create/update payers & splits use **`Omit<..., "id" | "expenseId">`** so UI payloads match TypeScript (design §5 shows only `expenseId` omitted — documented in interface file).

next session:

- start with: TASK-009 / TASK-010 — Supabase repository implementations + client singleton (TASK-014); wire `findByInviteCode` to `.rpc('find_group_by_invite_code')`.
- check first: column mapping snake_case ↔ camelCase at repo boundary (`display_name` ↔ `name`, `amount_owed`, etc.)
- watch out: Dexie repos remain default until factory switches to Supabase
