session: 16 | 2026-03-31 | completed: TASK-044, TASK-045

decisions:
  - Login: `<Navigate to={ROUTES.HOME} replace />` when `isAuthenticated` (replacing `useEffect`+`navigate` only for that case); demo navigation after `signInWithDemoProfile` still uses `useNavigate`.
  - Demo CTA uses `data-testid="sign-in-button"`; Google OAuth keeps `sign-in-google-button` (tasks allow provider-specific ids).

next session:
  - start with: Batch 16 — TASK-046, TASK-047 (Groups list + Group detail — heavier integration)
  - check first: `src/app/groups/page.tsx` and `src/app/groups/[id]/page.tsx` vs tasks.md; wire GroupCreateForm, InviteCodeInput, ExpenseList/Filters, etc.
  - watch out: TASK-047 dependency chain includes TASK-040, TASK-038, TASK-039, TASK-043
