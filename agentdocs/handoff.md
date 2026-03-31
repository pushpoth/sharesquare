session: 10 | 2026-04-01 | completed: TASK-022, TASK-023

decisions:
  - Extended `AuthContextValue` with task-aligned aliases `user`, `session` (Supabase `Session | null`), `signOut`; kept `currentUser` / `logout` for existing call sites.

next session:
  - start with: Batch 10 — TASK-024, TASK-025, TASK-026, TASK-027 (data hooks; verify existing `useGroups` / `useBalances` vs task AC)
  - check first: `src/hooks/useGroups.ts`, `useBalances.ts`, `useExpenses.ts`, `useSettlements.ts`
  - watch out: tasks specify refetch patterns and invite retry; align or mark partial in tasks if already sufficient
