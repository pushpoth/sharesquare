session: 20 | 2026-03-31 | completed: TASK-058

decisions:
  - Group delete visibility uses **`group_members.role === 'admin'`** (aligned with RLS `is_group_admin`), not only `createdBy`.
  - Supabase path: single `groups` delete; Postgres CASCADE handles children. Dexie path: one transactional cascade in `DexieGroupRepository.delete`.

discoveries:
  - other: `GroupDetailClient.test` mocks `useToast` with a hoisted `showToast` ref and uses module-level `mockNavigate` for `ROUTES.GROUPS` assertion after delete confirm.

next session:
  - start with: **Batch 20** — TASK-057 (invite on detail polish if still pending), TASK-059 (currency), TASK-060 (add-expense shortcut); confirm `batch-plan.md` order vs `task-index.json`.
  - check first: `tasks.md` TASK-057 status (invite code may already be on detail from TASK-047/057 scope)
  - watch out: TASK-059 localStorage vs `profiles` column choice
