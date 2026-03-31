# Supabase (ShareSquare)

SQL migrations live in [`migrations/`](./migrations/). They define the **Postgres schema** and **Row Level Security** policies described in [`agentdocs/design.md`](../agentdocs/design.md) §4 and §6.

## Apply migrations

### Option A — Supabase CLI (recommended)

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and log in.
2. Link the project: `supabase link --project-ref <your-project-ref>`
3. Push: `supabase db push`

### Option B — SQL Editor

1. Open the Supabase dashboard → **SQL Editor**.
2. Paste the contents of `migrations/20260331140000_initial_schema.sql` and run.

## After migrate

- Configure **Auth** providers and redirect URLs (see TASK-054 in `agentdocs/tasks.md`).
- App uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see root `.env.example`).

## RPC helpers in this migration

| Function | Purpose |
|----------|---------|
| `find_group_by_invite_code(text)` | Join flow: resolve a group by invite code without direct `groups` SELECT for non-members. |
| `create_group_with_admin(text, text)` | Atomic insert `groups` + creator `group_members` row as `admin`. |

Repository implementations (TASK-009+) should call these where appropriate instead of relying on permissive `groups` SELECT policies.
