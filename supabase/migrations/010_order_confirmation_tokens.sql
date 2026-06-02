create table if not exists public.order_confirmation_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists order_confirmation_tokens_order_id_idx
  on public.order_confirmation_tokens(order_id);

create index if not exists order_confirmation_tokens_expires_at_idx
  on public.order_confirmation_tokens(expires_at);
