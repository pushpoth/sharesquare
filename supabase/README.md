# Supabase (ShareSquare)

SQL migrations live in [`migrations/`](./migrations/). They define the **Postgres schema** and **Row Level Security** policies described in [`agentdocs/design.md`](../agentdocs/design.md) §4 and §6.

## Apply migrations

### Option A — Supabase CLI (recommended)

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and log in.
2. Link the project: `supabase link --project-ref <your-project-ref>`
3. Push: `supabase db push`

### Option B — SQL Editor

1. Open the Supabase dashboard → **SQL Editor**.
2. Run migrations in order (or `supabase db push`):
   - `20260331140000_initial_schema.sql`
   - `20260331150000_expense_write_rpcs.sql`
   - `20260331160000_profile_on_auth_user.sql` — creates `profiles` row when a user signs up (TASK-055)

### Profile sync (TASK-055)

- **Database:** `on_auth_user_created` on `auth.users` calls `handle_new_user()` to `INSERT` into `public.profiles` (`ON CONFLICT DO NOTHING`).
- **App:** `ensureProfile()` in `src/services/authService.ts` still **upserts** after sign-in so OAuth name/avatar stay current.
- Either path alone satisfies “row exists before first data op”; both together are idempotent.

## After migrate

- App uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see root `.env.example`).
- Configure **Auth** in the dashboard (TASK-054) — section below.

## Supabase Auth (dashboard) — TASK-054

Do this in [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication**.

1. **Site URL** — set to your deployed SPA origin (e.g. `https://your-app.pages.dev`) and, for local dev, `http://localhost:5173` (or the port Vite prints).
2. **Redirect URLs** — add allow-list entries so OAuth / magic link can return to the SPA:
   - `http://localhost:5173/**`
   - `http://127.0.0.1:5173/**`
   - Production: `https://<your-domain>/**`
3. **Providers** — enable **Google** (and/or others). Store **Client ID** and **Client secret** in Supabase (not in the repo). The SPA only uses the **anon** key; it never sees the service role.
4. **Email** — under **Auth** → **Providers** → **Email**: enable or disable **magic link** / **confirm email** to match product choice (`authService.signInWithMagicLink` is available when email OTP is enabled).

After saving, sign-in from the app (`Sign in with Google`) should redirect back to the Site URL / redirect path with a session. **Manual check:** complete OAuth on localhost and production once per environment.

## RPC helpers

| Function | Migration | Purpose |
|----------|-----------|---------|
| `find_group_by_invite_code(text)` | initial | Join flow: resolve a group by invite code without direct `groups` SELECT for non-members. |
| `create_group_with_admin(text, text)` | initial | Atomic insert `groups` + creator `group_members` row as `admin`. |
| `create_expense_with_lines(...)` | expense_write_rpcs | Atomic insert `expenses` + `expense_payers` + `expense_splits` (member check). |
| `update_expense_with_lines(...)` | expense_write_rpcs | Replace payers/splits + patch expense in one transaction (creator or admin). |

Group and expense Supabase repositories call these instead of relying on permissive `groups` SELECT or multi-request writes.

## RLS audit (invite / join)

See [`agentdocs/rls-invite-join.md`](../agentdocs/rls-invite-join.md) for the TASK-056 review: non-members cannot enumerate `groups`; join uses `find_group_by_invite_code` + controlled `group_members` inserts.
