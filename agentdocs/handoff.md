session: 11 | 2026-04-01 | completed: TASK-024, TASK-025, TASK-026, TASK-027

decisions:
  - Kept `useLiveQuery` on useExpenses / useSettlements / useBalances for Dexie live updates; useGroups alone uses explicit refetch (task requirement).

next session:
  - start with: Batch 11 — TASK-029, TASK-034, TASK-035, TASK-036 (BottomNav, EmptyState, ConfirmDialog, Toast)
  - check first: which of these components already exist under `src/components/`
  - watch out: TASK-052 depends on Toast (TASK-036)
