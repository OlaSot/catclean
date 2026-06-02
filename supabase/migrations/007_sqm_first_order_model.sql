-- =============================================================================
-- CatClean CRM — sqm-first order model (pricing drivers on detail tables)
-- Migration: 007_sqm_first_order_model
-- =============================================================================

BEGIN;

-- Planned job duration for schedule (minutes). Complements estimated_duration_hours in docs.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes integer;

COMMENT ON COLUMN public.orders.estimated_duration_minutes IS
  'Planned job duration in minutes (from pricing engine or admin override). Used by schedule view.';

-- Regular cleaning: m² is the primary pricing driver (not rooms_count).
ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS property_size_m2 integer;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS cleaning_intensity text DEFAULT 'standard';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'regular_cleaning_details'
      AND c.conname = 'regular_cleaning_details_cleaning_intensity_check'
  ) THEN
    ALTER TABLE public.regular_cleaning_details
      ADD CONSTRAINT regular_cleaning_details_cleaning_intensity_check
      CHECK (
        cleaning_intensity IS NULL
        OR cleaning_intensity IN ('standard', 'deep')
      );
  END IF;
END
$$;

COMMENT ON COLUMN public.regular_cleaning_details.property_size_m2 IS
  'Property size in m² — primary pricing and duration driver for regular cleaning.';
COMMENT ON COLUMN public.regular_cleaning_details.cleaning_intensity IS
  'standard | deep — affects base rate multiplier.';

-- Move in/out: align column name with app (property_size_m2); keep property_size_sqm if legacy exists.
ALTER TABLE public.move_cleaning_details
  ADD COLUMN IF NOT EXISTS property_size_m2 integer;

COMMENT ON COLUMN public.move_cleaning_details.property_size_m2 IS
  'Property size in m² — primary pricing driver for move in/out.';

COMMIT;
