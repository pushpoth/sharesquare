session: 9 | 2026-04-01 | completed: TASK-019, TASK-020, TASK-021

decisions:
  - Import persistence abstracted as `ImportDataWriter` with `createDexieImportWriter(db)` so tests mock writes; Supabase import adapter deferred (see notes.md).

discoveries:
  - api: Supabase `IUserRepository.create` is tied to current auth user — bulk user import via repos would need a separate adapter, not the existing create path.

next session:
  - start with: Batch 9 — TASK-022, TASK-023 (AuthContext may already exist in code; reconcile task-index vs implementation)
  - check first: `src/contexts/AuthContext.tsx`, `src/hooks/useAuth.ts`, planned `RepositoryContext`
  - watch out: TASK-022 AC vs current AuthContext; avoid duplicating providers
