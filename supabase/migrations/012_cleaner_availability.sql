create table if not exists public.cleaner_availability (
  id uuid primary key default gen_random_uuid(),
  cleaner_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  status text not null check (
    status in ('available', 'unavailable', 'vacation', 'sick', 'preferred_day_off')
  ),
  note text,
  created_at timestamptz not null default now(),
  unique (cleaner_id, date)
);

alter table public.cleaner_profiles
  add column if not exists max_daily_hours integer not null default 8,
  add column if not exists max_orders_per_day integer not null default 4,
  add column if not exists preferred_work_cities text[] not null default '{}',
  add column if not exists is_accepting_orders boolean not null default true;

create index if not exists cleaner_availability_cleaner_date_idx
  on public.cleaner_availability(cleaner_id, date);
