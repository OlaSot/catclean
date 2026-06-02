# CatClean CRM — Dispatch Recommendation Engine

## Philosophy

Dispatch engine is recommendation-only.

- CRM suggests best candidates.
- Admin/operator always makes final assignment decision.
- No auto-assignment in MVP.
- Preferred cleaner is a recommendation signal, not guaranteed assignment.

## Scoring factors

Implemented in `src/lib/dispatch/calculate-cleaner-score.ts`.

### Positive signals

- cleaner is available
- low workload for selected day
- cleaner accepts orders
- preferred work city matches order city
- cleaner is in `client_preferred_cleaners` for this client (strong bonus)
- strong move-out cleaner for `move_in_out`
- good with pets when order has pets
- previous successful relation with same client (small bonus, only when preferred cleaner is not set)
- strong completion history

### Negative signals / penalties

- availability status `unavailable` / `vacation` / `sick`
- `is_accepting_orders = false`
- overlap with planned schedule
- overload (`max_daily_hours` / `max_orders_per_day`)
- complaint-heavy profile
- `often_late = true`

## API

`GET /api/admin/orders/[id]/suggested-cleaners`

Returns top candidates with:

- `cleaner`
- `score`
- `reasons[]`
- `warnings[]`
- workload snapshot
- reliability snapshot

## Operational usage

- UI shows top 3-5 suggestions in assignment block.
- Quick assign button is available for each suggested cleaner.
- Manual cleaner selection remains fully available.
