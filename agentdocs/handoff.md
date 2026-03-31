session: 14 | 2026-03-31 | completed: TASK-030, TASK-037, TASK-038, TASK-039, TASK-040

decisions:
  - AppLayout: use `<Navigate to={ROUTES.LANDING} replace />` (same as `/`) after auth finishes loading instead of `useEffect` + `navigate`, matching tasks.md.
  - SplitSelector: `readOnly` no longer disables the “Split equally” checkbox — ExpenseForm passes `readOnly={splitEqually}` so equal mode locks amount fields only; users can uncheck to enter custom splits.

next session:
  - start with: Batch 14 — TASK-041, TASK-042, TASK-043 (GroupCreateForm, InviteCodeInput, SettlementForm)
  - check first: existing group/join/settlement UI vs tasks.md + useGroups / useToast patterns
  - watch out: TASK-043 needs TASK-027 settlements hook
