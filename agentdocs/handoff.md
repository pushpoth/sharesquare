session: 17 | 2026-03-31 | completed: TASK-046, TASK-047

decisions:
  - Finished Batch 16 agentdocs and verification after prior implementation; fixed `GroupDetailClient.test.tsx` for Jest ESM import order vs. hoisted `jest.mock` (outer `const` TDZ / unstable refs).

discoveries:
  - other: Tests that `import` the SUT before mock-backed `const` values run hit `ReferenceError` or unstable mock identities; use `require("./Component")` after all `jest.mock` blocks, with factories that only close over variables created inside the factory.
  - other: Clipboard: `Object.assign(navigator, { clipboard })` did not hook `writeText`; `jest.spyOn(navigator.clipboard, "writeText")` (when present) or `defineProperty` works; `fireEvent.click` is reliable for the copy button assertion.

next session:
  - start with: Batch 17 — TASK-048, TASK-049, TASK-050 (expense pages + activity)
  - check first: `batch-plan.md` + `task-index.json` for TASK-048 deps
  - watch out: Same Jest mock pattern for heavy page integration tests
