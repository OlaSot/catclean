# CatClean CRM — Order Confirmation Link Flow (MVP)

## Scope

MVP flow for confirming an order via public link.

- No email provider integration yet (no Resend/Brevo).
- Admin/operator generates link manually.
- Link is copied and sent to client outside CRM.

## Data model

Migration: `supabase/migrations/010_order_confirmation_tokens.sql`

Table: `order_confirmation_tokens`

- `id uuid` PK
- `order_id uuid` -> `orders.id` (cascade delete)
- `token text` unique
- `expires_at timestamptz`
- `used_at timestamptz | null`
- `created_by uuid | null` -> `profiles.id`
- `created_at timestamptz` default now

## Admin flow

Endpoints:

- `GET /api/admin/orders/[id]/confirmation-link` (latest token state)
- `POST /api/admin/orders/[id]/confirmation-link` (generate/regenerate)

1. Check staff auth (`admin` / `operator`).
2. Validate order exists.
3. Generate secure token (`crypto.randomBytes(...).toString("base64url")`).
4. Invalidate previous active tokens for this order.
5. Insert token row with 7-day TTL.
6. Return `confirmationUrl`.

### Latest token policy

- Only latest active token is valid.
- Regeneration strategy: previous active tokens are invalidated (`expires_at` set to now).
- `used_at` is not used for invalidation on regeneration (kept for real confirmations only).

UI: Admin order detail page

- Button: Generate confirmation link
- Button: Regenerate link (if token already exists)
- Show generated URL
- Copy button
- Show expiry timestamp
- Show latest token operational state in order detail:
  - Awaiting client confirmation
  - Confirmation link expired
  - Order confirmed
  - Confirmed at <time> (used token)

## Public flow

Public page: `/confirm-order/[token]`

Uses:

- `GET /api/public/order-confirmations/[token]`
- `POST /api/public/order-confirmations/[token]/confirm`

### GET validation

- token exists
- compute `canConfirm` from:
  - not expired
  - not used
  - order status not terminal (`completed`, `cancelled_*`, `refunded`, `canceled`)

### POST confirm rules

- token exists
- token not expired
- token not used
- order status not terminal

On success:

1. Set `order_confirmation_tokens.used_at = now`
2. Update `orders.status = confirmed`
3. Write `order_status_history` (best-effort)
4. Create notifications for staff (`admin` + `operator`)

Notification type:
- `order_confirmed`

## Status and safety notes

- Flow does not change routing model (no locale routes, no auth model changes).
- Existing status change APIs remain intact.
- Existing order creation and client cabinet behavior are not altered.
- Token is single-use by design (`used_at`).
- Default lifecycle: admin-created order starts in `awaiting_confirmation`, then client confirmation moves it to `confirmed`.

## Next step (post-MVP)

- Add email delivery provider integration and templates.
- Add resend/regenerate policies and revocation UI.
- Add audit list of active/expired tokens per order.
