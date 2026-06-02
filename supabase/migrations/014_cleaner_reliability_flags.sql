alter table public.cleaner_profiles
  add column if not exists often_late boolean not null default false,
  add column if not exists strong_move_out boolean not null default false,
  add column if not exists good_with_pets boolean not null default false;
