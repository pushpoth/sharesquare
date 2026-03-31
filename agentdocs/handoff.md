session: 13 | 2026-03-31 | completed: TASK-028, TASK-031, TASK-032, TASK-033

decisions:
  - MemberAvatar image-error test uses `act` + `fireEvent.error` so React 19 applies `onError` state updates (raw `dispatchEvent` leaves `<img>` mounted).

next session:
  - start with: Batch 13 — TASK-030, TASK-037, TASK-038, TASK-039, TASK-040 (AppLayout auth guard + expense building blocks)
  - check first: `AppLayout` vs tasks.md (redirect when unauthenticated, loading, max-width); TASK-030 deps: 028+029+022 all done
  - watch out: TASK-037 is M-effort (ExpenseForm + SplitSelector)
