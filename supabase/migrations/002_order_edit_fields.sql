-- =============================================================================
-- CatClean CRM — fields required for admin order editing
-- Migration: 002_order_edit_fields
--
-- Adds admin-editable fields mentioned in docs/ORDER_MODEL.md:
-- - orders.final_price
-- - orders.internal_note
-- =============================================================================

BEGIN;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS final_price numeric(10, 2);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS internal_note text;

COMMENT ON COLUMN public.orders.final_price IS 'Final amount charged to client (after adjustments).';
COMMENT ON COLUMN public.orders.internal_note IS 'Admin-only internal note for a single order.';

COMMIT;

