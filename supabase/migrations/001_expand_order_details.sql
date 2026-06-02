-- =============================================================================
-- CatClean CRM — expand order detail tables and common order fields
-- Migration: 001_expand_order_details
-- Spec: docs/ORDER_MODEL.md
--
-- Safe to re-run: uses ADD COLUMN IF NOT EXISTS only (no drops).
-- Existing rows keep NULL / column defaults where applicable.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- orders — common operational and pricing fields
-- -----------------------------------------------------------------------------
COMMENT ON TABLE public.orders IS 'Core booking record; service-specific params live in detail tables.';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS access_notes text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pets_info text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS supplies_note text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS equipment_note text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS price_breakdown jsonb;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS manual_discount numeric(10, 2) DEFAULT 0;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS manual_surcharge numeric(10, 2) DEFAULT 0;

COMMENT ON COLUMN public.orders.access_notes IS 'Entry codes, parking, access instructions (visible to cleaner).';
COMMENT ON COLUMN public.orders.pets_info IS 'Pets on site — summary for assignment and pricing.';
COMMENT ON COLUMN public.orders.supplies_note IS 'Who brings cleaning supplies — free-text supplement to detail.supplies_provided_by.';
COMMENT ON COLUMN public.orders.equipment_note IS 'Special equipment notes for the job.';
COMMENT ON COLUMN public.orders.price_breakdown IS 'Admin/pricing engine line items (jsonb).';
COMMENT ON COLUMN public.orders.manual_discount IS 'Admin manual discount applied to order total.';
COMMENT ON COLUMN public.orders.manual_surcharge IS 'Admin manual surcharge applied to order total.';

-- -----------------------------------------------------------------------------
-- 1. regular_cleaning_details
-- -----------------------------------------------------------------------------
ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS bedrooms_count integer;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS living_room_included boolean DEFAULT true;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS corridor_included boolean DEFAULT true;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS balcony_included boolean DEFAULT false;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS fridge_cleaning boolean DEFAULT false;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS oven_cleaning boolean DEFAULT false;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS inside_cabinets boolean DEFAULT false;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS windows_inside boolean DEFAULT false;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS pet_type text;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS supplies_provided_by text;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS equipment_required text[];

-- supplies_provided_by: CHECK added separately (column may already exist without constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'regular_cleaning_details'
      AND c.conname = 'regular_cleaning_details_supplies_provided_by_check'
  ) THEN
    ALTER TABLE public.regular_cleaning_details
      ADD CONSTRAINT regular_cleaning_details_supplies_provided_by_check
      CHECK (
        supplies_provided_by IS NULL
        OR supplies_provided_by IN ('client', 'cleaner', 'company')
      );
  END IF;
END
$$;

COMMENT ON COLUMN public.regular_cleaning_details.supplies_provided_by IS 'Who provides cleaning supplies: client | cleaner | company.';
COMMENT ON COLUMN public.regular_cleaning_details.equipment_required IS 'List of required equipment items (e.g. ladder, steam cleaner).';

-- -----------------------------------------------------------------------------
-- 2. move_cleaning_details
-- -----------------------------------------------------------------------------
ALTER TABLE public.move_cleaning_details
  ADD COLUMN IF NOT EXISTS empty_apartment boolean DEFAULT false;

ALTER TABLE public.move_cleaning_details
  ADD COLUMN IF NOT EXISTS heavy_limescale boolean DEFAULT false;

ALTER TABLE public.move_cleaning_details
  ADD COLUMN IF NOT EXISTS heavy_dirt boolean DEFAULT false;

ALTER TABLE public.move_cleaning_details
  ADD COLUMN IF NOT EXISTS inside_cabinets boolean DEFAULT false;

ALTER TABLE public.move_cleaning_details
  ADD COLUMN IF NOT EXISTS fridge_cleaning boolean DEFAULT false;

ALTER TABLE public.move_cleaning_details
  ADD COLUMN IF NOT EXISTS oven_cleaning boolean DEFAULT false;

ALTER TABLE public.move_cleaning_details
  ADD COLUMN IF NOT EXISTS windows_inside boolean DEFAULT false;

ALTER TABLE public.move_cleaning_details
  ADD COLUMN IF NOT EXISTS balcony_included boolean DEFAULT false;

-- -----------------------------------------------------------------------------
-- 3. airbnb_details
-- -----------------------------------------------------------------------------
ALTER TABLE public.airbnb_details
  ADD COLUMN IF NOT EXISTS laundry_required boolean DEFAULT false;

ALTER TABLE public.airbnb_details
  ADD COLUMN IF NOT EXISTS keys_location text;

ALTER TABLE public.airbnb_details
  ADD COLUMN IF NOT EXISTS special_turnover_notes text;

-- -----------------------------------------------------------------------------
-- 4. office_cleaning_details
-- -----------------------------------------------------------------------------
ALTER TABLE public.office_cleaning_details
  ADD COLUMN IF NOT EXISTS bathrooms_count integer;

ALTER TABLE public.office_cleaning_details
  ADD COLUMN IF NOT EXISTS kitchen_area boolean DEFAULT false;

ALTER TABLE public.office_cleaning_details
  ADD COLUMN IF NOT EXISTS trash_removal boolean DEFAULT true;

ALTER TABLE public.office_cleaning_details
  ADD COLUMN IF NOT EXISTS supplies_restock boolean DEFAULT false;

-- -----------------------------------------------------------------------------
-- 5. dry_cleaning_details
-- -----------------------------------------------------------------------------
ALTER TABLE public.dry_cleaning_details
  ADD COLUMN IF NOT EXISTS material_notes text;

ALTER TABLE public.dry_cleaning_details
  ADD COLUMN IF NOT EXISTS carpet_area_m2 integer;

ALTER TABLE public.dry_cleaning_details
  ADD COLUMN IF NOT EXISTS elevator_available boolean DEFAULT false;

-- -----------------------------------------------------------------------------
-- 6. window_cleaning_details
-- -----------------------------------------------------------------------------
ALTER TABLE public.window_cleaning_details
  ADD COLUMN IF NOT EXISTS window_sashes_count integer;

ALTER TABLE public.window_cleaning_details
  ADD COLUMN IF NOT EXISTS frame_cleaning boolean DEFAULT true;

ALTER TABLE public.window_cleaning_details
  ADD COLUMN IF NOT EXISTS blinds_cleaning boolean DEFAULT false;

-- -----------------------------------------------------------------------------
-- 7. special_package_details
-- -----------------------------------------------------------------------------
ALTER TABLE public.special_package_details
  ADD COLUMN IF NOT EXISTS package_focus text;

ALTER TABLE public.special_package_details
  ADD COLUMN IF NOT EXISTS allergy_friendly_products boolean DEFAULT false;

ALTER TABLE public.special_package_details
  ADD COLUMN IF NOT EXISTS pet_area_description text;

COMMIT;
