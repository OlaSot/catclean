-- =============================================================================
-- CatClean CRM — finance MVP (manual payments & cleaner payouts, no Stripe)
-- Migration: 006_finance_mvp
-- =============================================================================

BEGIN;

-- Helper functions are expected to exist from earlier migrations:
-- - public.is_staff_profile()
-- - public.client_owns_order(order_id)

-- Helper: cleaner owns order (assigned_cleaner_id)
CREATE OR REPLACE FUNCTION public.cleaner_owns_order(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = p_order_id
      AND o.assigned_cleaner_id = auth.uid()
  );
$$;

CREATE TABLE IF NOT EXISTS public.order_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  method text NOT NULL CHECK (method IN ('cash','card','bank_transfer','manual','other')),
  status text NOT NULL CHECK (status IN ('pending','paid','failed','refunded')),
  note text,
  recorded_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_payments_order_id_idx
  ON public.order_payments (order_id);

CREATE INDEX IF NOT EXISTS order_payments_created_at_idx
  ON public.order_payments (created_at DESC);

CREATE TABLE IF NOT EXISTS public.cleaner_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  cleaner_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL CHECK (status IN ('pending','paid','cancelled')),
  note text,
  recorded_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cleaner_payouts_order_id_idx
  ON public.cleaner_payouts (order_id);

CREATE INDEX IF NOT EXISTS cleaner_payouts_cleaner_id_idx
  ON public.cleaner_payouts (cleaner_id);

CREATE INDEX IF NOT EXISTS cleaner_payouts_created_at_idx
  ON public.cleaner_payouts (created_at DESC);

COMMENT ON TABLE public.order_payments IS 'Manual payment records for orders (no online gateway).';
COMMENT ON TABLE public.cleaner_payouts IS 'Manual payout records to cleaners for orders.';

ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_payouts ENABLE ROW LEVEL SECURITY;

-- order_payments policies
DROP POLICY IF EXISTS order_payments_select ON public.order_payments;
CREATE POLICY order_payments_select ON public.order_payments
  FOR SELECT
  USING (
    public.is_staff_profile()
    OR public.client_owns_order(order_id)
  );

DROP POLICY IF EXISTS order_payments_insert ON public.order_payments;
CREATE POLICY order_payments_insert ON public.order_payments
  FOR INSERT
  WITH CHECK (public.is_staff_profile());

DROP POLICY IF EXISTS order_payments_update ON public.order_payments;
CREATE POLICY order_payments_update ON public.order_payments
  FOR UPDATE
  USING (public.is_staff_profile())
  WITH CHECK (public.is_staff_profile());

-- cleaner_payouts policies
DROP POLICY IF EXISTS cleaner_payouts_select ON public.cleaner_payouts;
CREATE POLICY cleaner_payouts_select ON public.cleaner_payouts
  FOR SELECT
  USING (
    public.is_staff_profile()
    OR cleaner_id = auth.uid()
  );

DROP POLICY IF EXISTS cleaner_payouts_insert ON public.cleaner_payouts;
CREATE POLICY cleaner_payouts_insert ON public.cleaner_payouts
  FOR INSERT
  WITH CHECK (public.is_staff_profile());

DROP POLICY IF EXISTS cleaner_payouts_update ON public.cleaner_payouts;
CREATE POLICY cleaner_payouts_update ON public.cleaner_payouts
  FOR UPDATE
  USING (public.is_staff_profile())
  WITH CHECK (public.is_staff_profile());

COMMIT;

