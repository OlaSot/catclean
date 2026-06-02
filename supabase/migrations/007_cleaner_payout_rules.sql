BEGIN;

ALTER TABLE public.cleaner_payouts
  ADD COLUMN IF NOT EXISTS payout_percent numeric(5,2),
  ADD COLUMN IF NOT EXISTS base_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS adjustment_amount numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS adjustment_reason text,
  ADD COLUMN IF NOT EXISTS is_manual_override boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.cleaner_payouts.payout_percent IS
  'Payout percent used for calculation (default 50.00).';
COMMENT ON COLUMN public.cleaner_payouts.base_amount IS
  'Base amount for payout calculation (orders.final_price fallback orders.estimated_price).';
COMMENT ON COLUMN public.cleaner_payouts.adjustment_amount IS
  'Manual adjustment to suggested payout amount, can be negative or positive.';
COMMENT ON COLUMN public.cleaner_payouts.adjustment_reason IS
  'Optional staff-visible reason for payout adjustment.';
COMMENT ON COLUMN public.cleaner_payouts.is_manual_override IS
  'True when payout amount was manually overridden by staff.';

COMMIT;
