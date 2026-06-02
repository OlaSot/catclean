-- =============================================================================
-- CatClean CRM — phone normalization infrastructure (E.164, unique lookup)
-- Migration: 008_phone_normalization
-- Spec: docs/AUTH_MODEL.md
-- =============================================================================

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_normalized text;

COMMENT ON COLUMN public.profiles.phone_normalized IS
  'E.164 phone (+49...) for uniqueness and future Phone OTP auth. Legacy phone column retained.';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_normalized_unique_idx
  ON public.profiles (phone_normalized)
  WHERE phone_normalized IS NOT NULL;

COMMIT;
