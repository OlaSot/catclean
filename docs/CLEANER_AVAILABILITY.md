# CatClean CRM — Cleaner Availability & Workload

## Scope

Operational planning feature for dispatchers:

- daily cleaner availability statuses
- workload and overlap warnings
- assignment-time visibility

Out of scope:

- payroll calculations
- auth model changes

## Data model

Migration: `supabase/migrations/012_cleaner_availability.sql`

### `cleaner_availability`

- `cleaner_id` (`profiles.id`)
- `date`
- `status`:
  - `available`
  - `unavailable`
  - `vacation`
  - `sick`
  - `preferred_day_off`
- `note`
- unique: `(cleaner_id, date)`

### `cleaner_profiles` additions

- `max_daily_hours` (default 8)
- `max_orders_per_day` (default 4)
- `preferred_work_cities` (`text[]`)
- `is_accepting_orders` (default true)

## Workload logic

Helper: `src/lib/schedule/calculate-cleaner-workload.ts`

Returns:

- `totalOrders`
- `totalMinutes`
- `totalHours`
- `overlaps`
- `exceedsMaxHours`
- `exceedsMaxOrders`

Inputs use assigned orders for selected date and `estimated_duration_minutes`.

## Operational behavior

- Schedule view shows availability and warnings (overlap, overload, not accepting orders).
- Assignment form shows per-day workload snapshot and warnings for selected cleaner/date.
- Assignment remains allowed (warning-only policy).

## Dashboard attention

Additional attention reasons include:

- overloaded cleaner
- unavailable cleaner assigned
- cleaner with overlaps
