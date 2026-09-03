-- Restrict cleaners to the two order-status transitions they are allowed to perform.
-- The transition, assignment update, and audit insert happen in one transaction.

create or replace function public.transition_cleaner_order_status(
  p_order_id uuid,
  p_target_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cleaner_id uuid := auth.uid();
  v_current_status text;
  v_assigned_cleaner_id uuid;
  v_target_status text := lower(trim(p_target_status));
  v_comment text;
begin
  if v_cleaner_id is null or public.current_user_role() <> 'cleaner' then
    return jsonb_build_object('ok', false, 'errorCode', 'forbidden');
  end if;

  if v_target_status not in ('in_progress', 'completed') then
    return jsonb_build_object('ok', false, 'errorCode', 'invalid_target');
  end if;

  select lower(coalesce(o.status, 'new')), o.assigned_cleaner_id
    into v_current_status, v_assigned_cleaner_id
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'errorCode', 'not_found');
  end if;

  if v_assigned_cleaner_id is distinct from v_cleaner_id then
    return jsonb_build_object('ok', false, 'errorCode', 'forbidden');
  end if;

  if v_target_status = 'in_progress'
     and v_current_status not in ('confirmed', 'cleaner_assigned') then
    return jsonb_build_object(
      'ok', false,
      'errorCode', 'invalid_transition',
      'oldStatus', v_current_status
    );
  end if;

  if v_target_status = 'completed' and v_current_status <> 'in_progress' then
    return jsonb_build_object(
      'ok', false,
      'errorCode', 'invalid_transition',
      'oldStatus', v_current_status
    );
  end if;

  update public.orders
  set status = v_target_status
  where id = p_order_id;

  if v_target_status = 'completed' then
    update public.order_assignments
    set status = 'completed', completed_at = now()
    where order_id = p_order_id
      and cleaner_id = v_cleaner_id;
    v_comment := 'Cleaning completed';
  else
    v_comment := 'Cleaning started';
  end if;

  insert into public.order_status_history (
    order_id,
    old_status,
    new_status,
    changed_by,
    comment
  ) values (
    p_order_id,
    v_current_status,
    v_target_status,
    v_cleaner_id,
    v_comment
  );

  return jsonb_build_object(
    'ok', true,
    'oldStatus', v_current_status,
    'newStatus', v_target_status
  );
end;
$$;

revoke all on function public.transition_cleaner_order_status(uuid, text) from public;
revoke all on function public.transition_cleaner_order_status(uuid, text) from anon;
grant execute on function public.transition_cleaner_order_status(uuid, text) to authenticated;

-- Remove the broad row-level UPDATE permission. Cleaners now update through the RPC only.
drop policy if exists orders_cleaner_update_assigned on public.orders;

