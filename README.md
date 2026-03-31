# ShareSquare

A browser-first expense tracking PWA for friends, roommates, and families. ShareSquare records shared expenses, calculates “who owes whom,” and supports settlements — with **Supabase** for auth and data, and a **Vite + React** SPA.

## Target architecture (living docs)

The **source of truth** is [`agentdocs/`](agentdocs/): `spec.md` (v0.2), `design.md` (v0.3), `requirements.md`, `tasks.md` (v0.3), and [`agentdocs/context.json`](agentdocs/context.json).

| Layer        | Technology (target) |
| ------------ | ------------------- |
| Build / app  | Vite 6, React 19, TypeScript 5, react-router-dom 7 |
| Styling      | Tailwind CSS 4 |
| Backend / DB | Supabase (Postgres + Auth + RLS) |
| Client       | `@supabase/supabase-js` |
| PWA          | vite-plugin-pwa (Workbox); **online-first** data, precached shell/assets |
| Testing      | Jest + React Testing Library |

**Implementation note:** The app shell is **Vite + React** (see `agentdocs/tasks.md` TASK-001). **IndexedDB (Dexie)** remains the interim data layer until Supabase repository tasks land. Treat `agentdocs` as canonical for the target stack.

## Features (product)

- **Supabase Auth** — Sign-in via providers and/or magic link configured in the Supabase project (no separate client-only Google OAuth SDK requirement)
- **Group management** — Create groups, share **invite codes** stored in Postgres (`groups.invite_code`)
- **Expense tracking** — Equal, exact, and percentage splits; integer **cents** in the data layer
- **Balances & debt simplification** — Per-group and cross-group views; greedy net-balance simplification
- **Settlements** — Record payments between members
- **Activity feed** — Chronological actions across groups
- **JSON export/import** — Portability via repositories
- **PWA** — Installable; core data operations require network for MVP

### PWA behavior (online-first)

`vite-plugin-pwa` generates a Workbox service worker on `npm run build` that precaches the app shell and static assets (faster loads, install prompt). **Expense and group data are not offline-first in MVP:** CRUD still expects network access once Supabase is wired. See `public/manifest.json` for install metadata.

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+
- A Supabase project (URL + anon key) once the stack migration is applied — see [`supabase/README.md`](supabase/README.md) for running SQL migrations

### Installation

```bash
git clone <repo-url>
cd sharesquare
npm install
```

### Development

After the repo matches **Vite** (TASK-001):

```bash
npm run dev
```

Default dev URL is typically **http://localhost:5173** (Vite). If the scaffold is still Next.js, `npm run dev` may use **http://localhost:3000** until migration.

### Environment

Canonical variable names and placeholders live in **[`.env.example`](.env.example)** (TASK-052). Copy it to `.env.local` (or `.env`) and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_USE_SUPABASE_REPOS` — set to `true` to use the shared Supabase anon client for all repositories; leave `false` or unset to keep **IndexedDB (Dexie)** for local/offline-first dev.

Never commit secrets or the **service role** key.

**Google / magic link (TASK-054):** With a **real** Supabase project URL (not the Jest placeholder), the login page shows **Sign in with Google**, which uses `supabase.auth.signInWithOAuth`. Configure **Site URL**, **redirect allow list**, and **Google OAuth credentials** in the Supabase dashboard — see [`supabase/README.md`](supabase/README.md) § *Supabase Auth (dashboard)*. For local demo without a project, use **Quick Start (Demo Mode)**.

### Common scripts

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `npm run dev`           | Development server       |
| `npm run build`         | Production build         |
| `npm test`              | Unit tests               |
| `npm run typecheck`     | TypeScript check         |
| `npm run lint`          | ESLint                   |
| `npm run format`        | Prettier (write)         |

## Project structure (target)

Aligned with [`agentdocs/design.md`](agentdocs/design.md) §8:

```
index.html
src/
  main.tsx, App.tsx       # Vite entry + React Router
  pages/                  # Route-level screens
  components/
  layouts/
  repositories/
    interfaces/
    supabase/             # Supabase-backed implementations + client.ts
  services/
  contexts/
  hooks/
  types/
  utils/
  constants/
supabase/migrations/      # SQL + RLS (TASK-007)
```

## Architecture

```
Pages → Hooks → Repository interfaces → Supabase repositories → Postgres (RLS)
             → Services (pure logic: balances, debt simplification, import/export)
```

## Spec-driven development

| Document            | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `agentdocs/spec.md` | Product spec, goals, features, data model            |
| `agentdocs/requirements.md` | 33 requirements with acceptance criteria   |
| `agentdocs/design.md` | Technical design, stack, sequences, RLS intent |
| `agentdocs/tasks.md`| 60 implementation tasks with dependencies          |
| `agentdocs/context.json` | Machine-readable stack + task index           |

## License

Private project.
