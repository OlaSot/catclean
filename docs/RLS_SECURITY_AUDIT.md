# CatClean CRM — RLS/Security Audit

## Scope

Tables audited:

- `orders`
- `profiles`
- `client_profiles`
- `cleaner_profiles`
- `addresses`
- `order_assignments`
- `order_files`
- `order_payments`
- `cleaner_payouts`
- `reviews`
- `complaints`
- `notifications`
- `cleaner_availability`
- `client_preferred_cleaners`
- `order_confirmation_tokens`
- `order_status_history`

## Target access model

- **admin/operator**: full operational management across CRM tables.
- **client**: own data only (own orders/payments/reviews/complaints/notifications).
- **cleaner**: assigned-work data only (assigned orders/payouts/files/notifications, own availability read).
- **public**: no direct table access for confirmation tokens.

## Findings and hardening plan

### `orders`
- **RLS needed**: yes.
- **Read**: staff all; client own; cleaner assigned.
- **Write**: staff all; cleaner limited updates on assigned orders (start/complete flows).
- **Risk**: broad authenticated reads without RLS.
- **Action**: enabled RLS + scoped policies.

### `profiles`
- **RLS needed**: yes.
- **Read**: self; staff all.
- **Write**: self update; staff all.
- **Risk**: clients enumerating all users/phones/emails.
- **Action**: enabled RLS + self/staff policies.

### `client_profiles`
- **RLS needed**: yes.
- **Read**: self + staff.
- **Write**: staff (admin workflows).
- **Risk**: leakage of internal notes/company fields.
- **Action**: enabled RLS + self-select/staff-all.

### `cleaner_profiles`
- **RLS needed**: yes.
- **Read**: self + staff.
- **Write**: staff (operational settings/reliability flags).
- **Risk**: leakage of internal reliability/workload settings.
- **Action**: enabled RLS + self-select/staff-all.

### `addresses`
- **RLS needed**: yes.
- **Read**: staff all; client/cleaner only for related orders.
- **Write**: staff.
- **Risk**: full address exposure.
- **Action**: enabled RLS + relation-based read function.

### `order_assignments`
- **RLS needed**: yes.
- **Read**: staff all; cleaner own rows.
- **Write**: staff.
- **Risk**: assignment graph leakage.
- **Action**: enabled RLS + scoped policies.

### `order_files`
- **RLS needed**: yes (critical).
- **Read**: staff all; client own-order; cleaner assigned-order.
- **Write**: staff all; cleaner on assigned order for cleaner upload/delete flows.
- **Risk**: private metadata and filenames exposed.
- **Action**: enabled RLS + strict order-relation policies.

### `order_payments`
- **RLS needed**: yes.
- **Read**: staff all; client own-order payments.
- **Write**: staff.
- **Risk**: financial data leakage.
- **Action**: enabled RLS + own-order read.

### `cleaner_payouts`
- **RLS needed**: yes.
- **Read**: staff all; cleaner own payouts.
- **Write**: staff.
- **Risk**: payout leakage across cleaners.
- **Action**: enabled RLS + cleaner-id read.

### `reviews`
- **RLS needed**: yes.
- **Read**: staff all; client own reviews.
- **Write**: staff all; client insert own.
- **Risk**: review content leakage/impersonation.
- **Action**: enabled RLS + ownership checks.

### `complaints`
- **RLS needed**: yes.
- **Read**: staff all; client own complaints.
- **Write**: staff all; client insert own.
- **Risk**: complaint content leakage.
- **Action**: enabled RLS + ownership checks.

### `notifications`
- **RLS needed**: yes.
- **Read/Update**: user own notifications.
- **Write**: staff (plus service role where used).
- **Risk**: users reading other users’ notifications.
- **Action**: enabled RLS + user-id scoped policies.

### `cleaner_availability`
- **RLS needed**: yes.
- **Read**: staff all; cleaner own (read-only baseline).
- **Write**: staff.
- **Risk**: exposure/tampering of schedule constraints.
- **Action**: enabled RLS + staff-all + cleaner-own-read.

### `client_preferred_cleaners`
- **RLS needed**: yes.
- **Read/Write**: staff only.
- **Risk**: inference of customer-cleaner preference relationships.
- **Action**: enabled RLS + admin/operator only.

### `order_confirmation_tokens`
- **RLS needed**: yes (critical).
- **Read/Write**: staff only (service role routes bypass as needed).
- **Public**: **no direct table access**.
- **Risk**: token leakage -> unauthorized confirmations.
- **Action**: enabled RLS + staff-only; no anon/client policy.

### `order_status_history`
- **RLS needed**: yes.
- **Read**: staff all; client own-order; cleaner assigned-order.
- **Write**: staff.
- **Risk**: operational note leakage.
- **Action**: enabled RLS + relation-based read.

## Service role usage (documented)

Current service-role/admin usage patterns:

- auth user creation (admin client/cleaner creation flows)
- storage operations and signed URL generation/upload helpers
- notification creation helpers in privileged contexts
- order confirmation token public endpoints (read/confirm logic via server/admin client)

Notes:
- Service role bypasses RLS by design; keep usage limited to backend routes only.
- Never expose service role key to client code.

## Migration

- Hardening migration: `supabase/migrations/014_rls_hardening.sql`
- It:
  - enables RLS for audited tables
  - creates helper security-definer functions for role/order relation checks
  - recreates scoped policies for staff/client/cleaner access

## API compatibility notes

The policy model is aligned with current API route behavior:

- staff routes use staff auth and should continue to operate
- client routes are scoped to own resources
- cleaner routes are scoped to assigned resources
- confirmation token table stays inaccessible from direct client SDK access

Manual smoke checks after migration:

- admin orders + order detail + files + finance
- client own orders and payment summary
- cleaner assigned orders and payout visibility
- notifications read/read-all
- preferred cleaners and availability flows
