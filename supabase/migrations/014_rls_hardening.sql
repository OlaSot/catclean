-- RLS hardening baseline for operational CRM tables.
-- Idempotent: policies are dropped/recreated safely.

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

create or replace function public.is_staff_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin', 'operator'), false)
$$;

create or replace function public.order_belongs_to_client(order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.client_id = auth.uid()
  )
$$;

create or replace function public.order_assigned_to_cleaner(order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.assigned_cleaner_id = auth.uid()
  )
$$;

create or replace function public.address_accessible(address_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.address_id = address_id
      and (
        o.client_id = auth.uid()
        or o.assigned_cleaner_id = auth.uid()
      )
  )
$$;

alter table public.orders enable row level security;
alter table public.profiles enable row level security;
alter table public.client_profiles enable row level security;
alter table public.cleaner_profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.order_assignments enable row level security;
alter table public.order_files enable row level security;
alter table public.order_payments enable row level security;
alter table public.cleaner_payouts enable row level security;
alter table public.reviews enable row level security;
alter table public.complaints enable row level security;
alter table public.notifications enable row level security;
alter table public.cleaner_availability enable row level security;
alter table public.client_preferred_cleaners enable row level security;
alter table public.order_confirmation_tokens enable row level security;
alter table public.order_status_history enable row level security;

-- profiles
drop policy if exists profiles_staff_all on public.profiles;
create policy profiles_staff_all on public.profiles
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- client_profiles
drop policy if exists client_profiles_staff_all on public.client_profiles;
create policy client_profiles_staff_all on public.client_profiles
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists client_profiles_self_select on public.client_profiles;
create policy client_profiles_self_select on public.client_profiles
  for select to authenticated
  using (profile_id = auth.uid());

-- cleaner_profiles
drop policy if exists cleaner_profiles_staff_all on public.cleaner_profiles;
create policy cleaner_profiles_staff_all on public.cleaner_profiles
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists cleaner_profiles_self_select on public.cleaner_profiles;
create policy cleaner_profiles_self_select on public.cleaner_profiles
  for select to authenticated
  using (profile_id = auth.uid());

-- orders
drop policy if exists orders_staff_all on public.orders;
create policy orders_staff_all on public.orders
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists orders_client_select_own on public.orders;
create policy orders_client_select_own on public.orders
  for select to authenticated
  using (client_id = auth.uid());

drop policy if exists orders_cleaner_select_assigned on public.orders;
create policy orders_cleaner_select_assigned on public.orders
  for select to authenticated
  using (assigned_cleaner_id = auth.uid());

drop policy if exists orders_cleaner_update_assigned on public.orders;
create policy orders_cleaner_update_assigned on public.orders
  for update to authenticated
  using (assigned_cleaner_id = auth.uid())
  with check (assigned_cleaner_id = auth.uid());

-- addresses
drop policy if exists addresses_staff_all on public.addresses;
create policy addresses_staff_all on public.addresses
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists addresses_related_order_read on public.addresses;
create policy addresses_related_order_read on public.addresses
  for select to authenticated
  using (public.address_accessible(id));

-- order_assignments
drop policy if exists order_assignments_staff_all on public.order_assignments;
create policy order_assignments_staff_all on public.order_assignments
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists order_assignments_cleaner_read_own on public.order_assignments;
create policy order_assignments_cleaner_read_own on public.order_assignments
  for select to authenticated
  using (cleaner_id = auth.uid());

-- order_files (private metadata)
drop policy if exists order_files_staff_all on public.order_files;
create policy order_files_staff_all on public.order_files
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists order_files_client_read_own on public.order_files;
create policy order_files_client_read_own on public.order_files
  for select to authenticated
  using (public.order_belongs_to_client(order_id));

drop policy if exists order_files_cleaner_read_assigned on public.order_files;
create policy order_files_cleaner_read_assigned on public.order_files
  for select to authenticated
  using (public.order_assigned_to_cleaner(order_id));

drop policy if exists order_files_cleaner_write_assigned on public.order_files;
create policy order_files_cleaner_write_assigned on public.order_files
  for insert to authenticated
  with check (public.order_assigned_to_cleaner(order_id));

drop policy if exists order_files_cleaner_delete_assigned on public.order_files;
create policy order_files_cleaner_delete_assigned on public.order_files
  for delete to authenticated
  using (public.order_assigned_to_cleaner(order_id));

-- order_payments
drop policy if exists order_payments_staff_all on public.order_payments;
create policy order_payments_staff_all on public.order_payments
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists order_payments_client_read_own on public.order_payments;
create policy order_payments_client_read_own on public.order_payments
  for select to authenticated
  using (public.order_belongs_to_client(order_id));

-- cleaner_payouts
drop policy if exists cleaner_payouts_staff_all on public.cleaner_payouts;
create policy cleaner_payouts_staff_all on public.cleaner_payouts
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists cleaner_payouts_cleaner_read_own on public.cleaner_payouts;
create policy cleaner_payouts_cleaner_read_own on public.cleaner_payouts
  for select to authenticated
  using (cleaner_id = auth.uid());

-- reviews
drop policy if exists reviews_staff_all on public.reviews;
create policy reviews_staff_all on public.reviews
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists reviews_client_read_own on public.reviews;
create policy reviews_client_read_own on public.reviews
  for select to authenticated
  using (client_id = auth.uid());

drop policy if exists reviews_client_insert_own on public.reviews;
create policy reviews_client_insert_own on public.reviews
  for insert to authenticated
  with check (client_id = auth.uid());

-- complaints
drop policy if exists complaints_staff_all on public.complaints;
create policy complaints_staff_all on public.complaints
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists complaints_client_read_own on public.complaints;
create policy complaints_client_read_own on public.complaints
  for select to authenticated
  using (client_id = auth.uid());

drop policy if exists complaints_client_insert_own on public.complaints;
create policy complaints_client_insert_own on public.complaints
  for insert to authenticated
  with check (client_id = auth.uid());

-- notifications
drop policy if exists notifications_staff_all on public.notifications;
create policy notifications_staff_all on public.notifications
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists notifications_user_read_own on public.notifications;
create policy notifications_user_read_own on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists notifications_user_update_own on public.notifications;
create policy notifications_user_update_own on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- cleaner_availability
drop policy if exists cleaner_availability_staff_all on public.cleaner_availability;
create policy cleaner_availability_staff_all on public.cleaner_availability
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists cleaner_availability_cleaner_read_own on public.cleaner_availability;
create policy cleaner_availability_cleaner_read_own on public.cleaner_availability
  for select to authenticated
  using (cleaner_id = auth.uid());

-- client_preferred_cleaners (admin/operator only)
drop policy if exists client_preferred_cleaners_staff_all on public.client_preferred_cleaners;
create policy client_preferred_cleaners_staff_all on public.client_preferred_cleaners
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

-- order_confirmation_tokens (no direct public/client access)
drop policy if exists order_confirmation_tokens_staff_all on public.order_confirmation_tokens;
create policy order_confirmation_tokens_staff_all on public.order_confirmation_tokens
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

-- order_status_history
drop policy if exists order_status_history_staff_all on public.order_status_history;
create policy order_status_history_staff_all on public.order_status_history
  for all to authenticated
  using (public.is_staff_user())
  with check (public.is_staff_user());

drop policy if exists order_status_history_client_read on public.order_status_history;
create policy order_status_history_client_read on public.order_status_history
  for select to authenticated
  using (public.order_belongs_to_client(order_id));

drop policy if exists order_status_history_cleaner_read on public.order_status_history;
create policy order_status_history_cleaner_read on public.order_status_history
  for select to authenticated
  using (public.order_assigned_to_cleaner(order_id));
