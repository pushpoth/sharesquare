# RLS: invite lookup and group join (TASK-056)

**Status:** Reviewed 2026-03-31 against `supabase/migrations/20260331140000_initial_schema.sql`.

## Threat model

- **Goal:** An authenticated user may resolve **at most one** group by a **known invite code** to join, without listing other groups or members.
- **Non-goals:** Hiding group existence from someone who already knows a valid code (they learn id, name, invite_code, created_by, created_at from the RPC).

## Policies in effect

| Surface | Behavior |
|---------|----------|
| `groups` SELECT (`groups_select_member`) | Only rows where `is_group_member(id, auth.uid())`. Non-members **cannot** `SELECT` from `groups`. |
| `find_group_by_invite_code(p_code)` | `SECURITY DEFINER`, `STABLE`, returns **one** row where `upper(trim(invite_code)) = upper(trim(p_code))` or empty. Granted to `authenticated`. |
| `group_members` INSERT (`group_members_insert_join`) | Caller may insert **self** as `member` only if: group exists, user not already a member, and **at least one** member already exists (join path). |
| `group_members` INSERT (`group_members_insert_creator_bootstrap`) | First member row when creator has no members yet (paired with group create). |
| `group_members` SELECT | Members only — cannot enumerate memberships of groups you are not in. |

## Enumeration

- There is **no** policy allowing `SELECT * FROM groups` for non-members.
- Guessing invite codes is the only discovery path; codes should be **unguessable** (app generates high-entropy codes — see `InviteCodeService` / group create).

## Client usage

- **`SupabaseGroupRepository.findByInviteCode`** must call the RPC (not `from('groups')`) so join works before membership exists.
- **`create_group_with_admin`** creates the group and admin row atomically under definer rights.

## Manual QA (second user)

1. User A creates a group; User B uses valid invite code → join succeeds.
2. User B runs raw `select * from groups` (e.g. SQL editor as B) → only rows for groups B belongs to.
3. User B cannot `select` group rows for groups they are not in via table API under anon key + JWT.
