# ShareSquare

A simplified, browser-first expense tracking application designed for friends, roommates, and families. Inspired by the core utility of Splitwise, ShareSquare provides a frictionless way to record shared expenses, calculate owed balances, and settle debts — all without a backend server.

## Features

- **Google OAuth Sign-In** — Zero-password onboarding (+ demo mode for local testing)
- **Group Management** — Create groups, invite members via shareable codes, manage membership
- **Expense Tracking** — Add, edit, and delete expenses with flexible split options (equal, custom amounts, percentages)
- **Balance Calculation** — Real-time "who owes whom" balances per group and overall
- **Debt Simplification** — Greedy net-balance algorithm minimises the number of settlements needed
- **Settlements** — Record payments between members to clear debts
- **Activity Feed** — Chronological log of all group actions
- **Data Export/Import** — Full JSON export and import for data portability
- **Offline-First** — All data stored locally in IndexedDB via Dexie.js

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Data Storage | Dexie.js 4 (IndexedDB) |
| Testing | Jest 30 + React Testing Library |
| Linting/Formatting | ESLint 9 + Prettier |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone <repo-url>
cd sharesquare
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the **Quick Start (Demo Mode)** button on the landing page to explore without Google OAuth.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm run format` | Format with Prettier |

## Project Structure

```
src/
├── app/                  # Next.js pages and layouts
│   ├── page.tsx          # Landing / login page
│   ├── home/             # Dashboard
│   ├── groups/           # Groups list + [id] detail
│   ├── expenses/         # Add new + [id]/edit
│   ├── activity/         # Activity feed
│   └── settings/         # Settings, export/import
├── components/           # Reusable UI components
├── constants/            # App constants (categories, routes)
├── contexts/             # React contexts (Auth, Repository)
├── hooks/                # Custom hooks (useGroups, useExpenses, etc.)
├── layouts/              # Page layout wrappers
├── repositories/         # Data access layer (interfaces + Dexie implementations)
├── services/             # Business logic (auth, balance, debt simplification, etc.)
├── types/                # TypeScript entity types
└── utils/                # Utility functions (currency, dates, validation)
```

## Architecture

ShareSquare follows a **repository pattern** with a clean separation between the data layer (IndexedDB/Dexie.js) and the UI. This design allows for future migration to a backend database without touching the UI layer.

```
Pages → Hooks → Repositories (interfaces) → Dexie (IndexedDB)
             → Services (pure business logic)
```

All monetary values are stored as **integer cents** to avoid floating-point precision issues.

## Implementation Progress

### Completed (v0.1.0)

- [x] Project infrastructure (Next.js, Tailwind, Jest, ESLint, Prettier)
- [x] TypeScript entity types and data model (6 entities, 8 DB tables)
- [x] Dexie.js database schema with indexed queries
- [x] Repository pattern — 5 interfaces + 5 Dexie implementations + factory
- [x] Services — Auth, InviteCode, Balance, DebtSimplification, Export, Import, Activity
- [x] React contexts (Auth, Repository) and 5 custom hooks
- [x] 16 UI components (Header, BottomNav, AppLayout, BalanceCard, GroupCard, ExpenseForm, ExpenseList, ExpenseFilters, MemberBalanceList, GroupCreateForm, InviteCodeInput, SettlementForm, ConfirmDialog, Toast, EmptyState, MemberAvatar)
- [x] 8 pages (Landing, Dashboard, Groups, Group Detail, Add Expense, Edit Expense, Activity, Settings)
- [x] 97 unit tests across 13 test suites

### Roadmap

- [ ] **PWA / Service Worker** (TASK-003) — Serwist integration for offline caching and install prompt
- [ ] **SVG Data Visualizations** (TASK-053) — Expense breakdowns by category and spending-over-time charts
- [ ] **Google OAuth production setup** — Replace demo mode with real `@react-oauth/google` integration
- [ ] **Multi-currency support** — Currency selection per group
- [ ] **Backend migration** — Supabase or Firebase for real-time sync across devices
- [ ] **Receipt scanning** — OCR-based expense entry

## Spec-Driven Development

This project follows a spec-driven workflow. All living documentation lives in `agentdocs/`:

| Document | Purpose |
|---|---|
| `spec.md` | Product spec — problem, goals, features, data model, business rules |
| `requirements.md` | 28 granular requirements with acceptance criteria |
| `design.md` | Technical architecture, sequence diagrams, UI specs |
| `tasks.md` | 53 implementation tasks with dependencies and test plans |
| `context.json` | Machine-readable project state |

## License

Private project.
