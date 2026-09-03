alter table public.regular_cleaning_details
  add column if not exists floors_count integer;

alter table public.regular_cleaning_details
  drop constraint if exists regular_cleaning_details_floors_count_check;

alter table public.regular_cleaning_details
  add constraint regular_cleaning_details_floors_count_check
  check (floors_count is null or floors_count between 1 and 20);

comment on column public.regular_cleaning_details.floors_count is
  'Number of floors selected for a house booking; null for legacy records.';
