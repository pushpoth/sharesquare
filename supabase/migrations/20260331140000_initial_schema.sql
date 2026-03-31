-- ShareSquare initial schema + RLS (TASK-007, REQ-023, REQ-029)
-- Apply with: supabase db push  OR  paste into Supabase SQL Editor (see supabase/README.md)

-- ---------------------------------------------------------------------------
-- Tables (snake_case; monetary amounts = integer cents as bigint)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  constraint groups_invite_code_unique unique (invite_code)
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  title text not null,
  amount bigint not null check (amount > 0),
  date date not null,
  category text not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expense_payers (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount bigint not null check (amount >= 0),
  unique (expense_id, user_id)
);

create table public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_owed bigint not null check (amount_owed >= 0),
  unique (expense_id, user_id)
);

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  from_user_id uuid not null references auth.users (id) on delete cascade,
  to_user_id uuid not null references auth.users (id) on delete cascade,
  amount bigint not null check (amount > 0),
  date date not null,
  created_at timestamptz not null default now()
);

create table public.activity_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  type text not null check (
    type in (
      'expense_added',
      'expense_edited',
      'expense_deleted',
      'settlement_added',
      'member_joined',
      'group_created'
    )
  ),
  description text not null,
  reference_id text not null,
  timestamp timestamptz not null default now()
);

create index idx_group_members_user_id on public.group_members (user_id);
create index idx_group_members_group_id on public.group_members (group_id);
create index idx_expenses_group_id on public.expenses (group_id);
create index idx_expense_payers_expense_id on public.expense_payers (expense_id);
create index idx_expense_splits_expense_id on public.expense_splits (expense_id);
create index idx_settlements_group_id on public.settlements (group_id);
create index idx_activity_entries_user_id on public.activity_entries (user_id);
create index idx_activity_entries_group_id on public.activity_entries (group_id);

-- ---------------------------------------------------------------------------
-- updated_at on expenses
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER) for RLS
-- ---------------------------------------------------------------------------

create or replace function public.is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members gm
    where gm.group_id = p_group_id and gm.user_id = p_user_id
  );
$$;

create or replace function public.is_group_admin(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members gm
    where gm.group_id = p_group_id and gm.user_id = p_user_id and gm.role = 'admin'
  );
$$;

grant execute on function public.is_group_member(uuid, uuid) to authenticated;
grant execute on function public.is_group_admin(uuid, uuid) to authenticated;

-- Invite join: lookup without prior membership (RLS hides direct table scan)
create or replace function public.find_group_by_invite_code(p_code text)
returns table (
  id uuid,
  name text,
  invite_code text,
  created_by uuid,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select g.id, g.name, g.invite_code, g.created_by, g.created_at
  from public.groups g
  where upper(trim(g.invite_code)) = upper(trim(p_code))
  limit 1;
$$;

grant execute on function public.find_group_by_invite_code(text) to authenticated;

-- Atomic: group + creator as admin (optional RPC; design.md §4)
create or replace function public.create_group_with_admin(p_name text, p_invite_code text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  new_row public.groups;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.groups (name, invite_code, created_by)
  values (p_name, upper(trim(p_invite_code)), auth.uid())
  returning * into new_row;

  insert into public.group_members (group_id, user_id, role)
  values (new_row.id, auth.uid(), 'admin');

  return new_row;
end;
$$;

grant execute on function public.create_group_with_admin(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_payers enable row level security;
alter table public.expense_splits enable row level security;
alter table public.settlements enable row level security;
alter table public.activity_entries enable row level security;

-- profiles
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy profiles_select_peers on public.profiles
  for select to authenticated using (
    exists (
      select 1
      from public.group_members gm1
      join public.group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = (select auth.uid()) and gm2.user_id = profiles.id
    )
  );

create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- groups
create policy groups_select_member on public.groups
  for select to authenticated
  using (public.is_group_member(id, (select auth.uid())));

create policy groups_insert_creator on public.groups
  for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy groups_update_admin on public.groups
  for update to authenticated
  using (public.is_group_admin(id, (select auth.uid())))
  with check (public.is_group_admin(id, (select auth.uid())));

create policy groups_delete_admin on public.groups
  for delete to authenticated
  using (public.is_group_admin(id, (select auth.uid())));

-- group_members
create policy group_members_select_member on public.group_members
  for select to authenticated
  using (public.is_group_member(group_id, (select auth.uid())));

-- Creator adds first row (no members yet)
create policy group_members_insert_creator_bootstrap on public.group_members
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.groups g
      where g.id = group_id and g.created_by = (select auth.uid())
    )
    and not exists (
      select 1 from public.group_members gm where gm.group_id = group_members.group_id
    )
  );

-- Join existing group (at least one member; not already joined)
create policy group_members_insert_join on public.group_members
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.groups g where g.id = group_id)
    and not exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id and gm.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.group_members gm2 where gm2.group_id = group_members.group_id
    )
  );

create policy group_members_insert_by_admin on public.group_members
  for insert to authenticated
  with check (public.is_group_admin(group_id, (select auth.uid())));

-- expenses
create policy expenses_select on public.expenses
  for select to authenticated
  using (public.is_group_member(group_id, (select auth.uid())));

create policy expenses_insert on public.expenses
  for insert to authenticated
  with check (
    public.is_group_member(group_id, (select auth.uid()))
    and created_by = (select auth.uid())
  );

create policy expenses_update on public.expenses
  for update to authenticated
  using (
    public.is_group_member(group_id, (select auth.uid()))
    and (
      created_by = (select auth.uid())
      or public.is_group_admin(group_id, (select auth.uid()))
    )
  )
  with check (public.is_group_member(group_id, (select auth.uid())));

create policy expenses_delete on public.expenses
  for delete to authenticated
  using (
    public.is_group_member(group_id, (select auth.uid()))
    and (
      created_by = (select auth.uid())
      or public.is_group_admin(group_id, (select auth.uid()))
    )
  );

-- expense_payers / expense_splits (via parent expense group)
create policy expense_payers_select on public.expense_payers
  for select to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and public.is_group_member(e.group_id, (select auth.uid()))
    )
  );

create policy expense_payers_insert on public.expense_payers
  for insert to authenticated
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and public.is_group_member(e.group_id, (select auth.uid()))
    )
  );

create policy expense_payers_update on public.expense_payers
  for update to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and public.is_group_member(e.group_id, (select auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and public.is_group_member(e.group_id, (select auth.uid()))
    )
  );

create policy expense_payers_delete on public.expense_payers
  for delete to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and public.is_group_member(e.group_id, (select auth.uid()))
    )
  );

create policy expense_splits_select on public.expense_splits
  for select to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and public.is_group_member(e.group_id, (select auth.uid()))
    )
  );

create policy expense_splits_insert on public.expense_splits
  for insert to authenticated
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and public.is_group_member(e.group_id, (select auth.uid()))
    )
  );

create policy expense_splits_update on public.expense_splits
  for update to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and public.is_group_member(e.group_id, (select auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and public.is_group_member(e.group_id, (select auth.uid()))
    )
  );

create policy expense_splits_delete on public.expense_splits
  for delete to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and public.is_group_member(e.group_id, (select auth.uid()))
    )
  );

-- settlements
create policy settlements_select on public.settlements
  for select to authenticated
  using (public.is_group_member(group_id, (select auth.uid())));

create policy settlements_insert on public.settlements
  for insert to authenticated
  with check (public.is_group_member(group_id, (select auth.uid())));

create policy settlements_delete on public.settlements
  for delete to authenticated
  using (
    public.is_group_member(group_id, (select auth.uid()))
    and (
      from_user_id = (select auth.uid())
      or to_user_id = (select auth.uid())
      or public.is_group_admin(group_id, (select auth.uid()))
    )
  );

-- activity_entries
create policy activity_select on public.activity_entries
  for select to authenticated
  using (public.is_group_member(group_id, (select auth.uid())));

create policy activity_insert on public.activity_entries
  for insert to authenticated
  with check (
    public.is_group_member(group_id, (select auth.uid()))
    and user_id = (select auth.uid())
  );
