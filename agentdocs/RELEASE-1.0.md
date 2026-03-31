# ShareSquare v1.0.0

**Date:** 2026-03-31

## Summary

First production-aligned **MVP** release: task list **TASK-001–TASK-060** complete per `tasks.md` v1.0. The app is an **online-first** PWA (Vite 6, React 19, TypeScript 5, Tailwind 4) backed by **Supabase** (Postgres, Auth, RLS) with optional **IndexedDB (Dexie)** when `VITE_USE_SUPABASE_REPOS` is not enabled.

## Documentation

| Document        | Version | Role                          |
|----------------|---------|-------------------------------|
| `spec.md`       | 1.0     | Product intent & scope       |
| `design.md`     | 1.0     | Architecture & structure     |
| `requirements.md` | —     | REQ traceability (→ spec 1.0) |
| `tasks.md`      | 1.0     | Shipped task breakdown       |
| `context.json`  | —       | Machine-readable project state + `release` block |

## Verification (local)

- `npm test`
- `npm run lint`
- `npm run build`

## Versioning

- **Semantic:** `1.0.0` in `context.json` as `product_version` and `release.version`.
- Future doc edits for the same product generation should bump patch (e.g. `1.0.1`) for doc-only fixes, minor for additive features, major for breaking product/API changes.
