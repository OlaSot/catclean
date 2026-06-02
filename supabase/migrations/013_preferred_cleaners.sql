create table if not exists public.client_preferred_cleaners (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  cleaner_id uuid not null references public.profiles(id) on delete cascade,
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  unique (client_id, cleaner_id)
);

create index if not exists client_preferred_cleaners_client_idx
  on public.client_preferred_cleaners(client_id, is_primary desc, created_at desc);

create index if not exists client_preferred_cleaners_cleaner_idx
  on public.client_preferred_cleaners(cleaner_id);
