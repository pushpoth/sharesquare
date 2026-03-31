-- Atomic expense create/update with payers + splits (TASK-011, REQ-023)

create or replace function public.create_expense_with_lines(
  p_group_id uuid,
  p_title text,
  p_amount bigint,
  p_date date,
  p_category text,
  p_payers jsonb,
  p_splits jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_eid uuid;
  elem jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_group_member(p_group_id, auth.uid()) then
    raise exception 'Forbidden';
  end if;

  insert into public.expenses (group_id, title, amount, date, category, created_by)
  values (p_group_id, p_title, p_amount, p_date, p_category, auth.uid())
  returning id into v_eid;

  for elem in select * from jsonb_array_elements(coalesce(p_payers, '[]'::jsonb))
  loop
    insert into public.expense_payers (expense_id, user_id, amount)
    values (v_eid, (elem->>'user_id')::uuid, (elem->>'amount')::bigint);
  end loop;

  for elem in select * from jsonb_array_elements(coalesce(p_splits, '[]'::jsonb))
  loop
    insert into public.expense_splits (expense_id, user_id, amount_owed)
    values (v_eid, (elem->>'user_id')::uuid, (elem->>'amount_owed')::bigint);
  end loop;

  return v_eid;
end;
$$;

grant execute on function public.create_expense_with_lines(uuid, text, bigint, date, text, jsonb, jsonb) to authenticated;

create or replace function public.update_expense_with_lines(
  p_expense_id uuid,
  p_title text,
  p_amount bigint,
  p_date date,
  p_category text,
  p_payers jsonb,
  p_splits jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_created_by uuid;
  elem jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select e.group_id, e.created_by into v_group_id, v_created_by
  from public.expenses e
  where e.id = p_expense_id
  for update;

  if v_group_id is null then
    raise exception 'Expense not found';
  end if;

  if not public.is_group_member(v_group_id, auth.uid()) then
    raise exception 'Forbidden';
  end if;

  if v_created_by <> auth.uid() and not public.is_group_admin(v_group_id, auth.uid()) then
    raise exception 'Forbidden';
  end if;

  delete from public.expense_payers where expense_id = p_expense_id;
  delete from public.expense_splits where expense_id = p_expense_id;

  update public.expenses
  set
    title = p_title,
    amount = p_amount,
    date = p_date,
    category = p_category
  where id = p_expense_id;

  for elem in select * from jsonb_array_elements(coalesce(p_payers, '[]'::jsonb))
  loop
    insert into public.expense_payers (expense_id, user_id, amount)
    values (p_expense_id, (elem->>'user_id')::uuid, (elem->>'amount')::bigint);
  end loop;

  for elem in select * from jsonb_array_elements(coalesce(p_splits, '[]'::jsonb))
  loop
    insert into public.expense_splits (expense_id, user_id, amount_owed)
    values (p_expense_id, (elem->>'user_id')::uuid, (elem->>'amount_owed')::bigint);
  end loop;
end;
$$;

grant execute on function public.update_expense_with_lines(uuid, text, bigint, date, text, jsonb, jsonb) to authenticated;
