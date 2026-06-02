-- =============================================================================
-- CatClean CRM — client reviews & complaints (MVP)
-- Migration: 004_reviews_complaints
-- =============================================================================

BEGIN;

-- Helper: staff roles (admin / operator)
CREATE OR REPLACE FUNCTION public.is_staff_profile()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'operator')
  );
$$;

-- Helper: client owns order
CREATE OR REPLACE FUNCTION public.client_owns_order(p_order_id uuid)
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
      AND o.client_id = auth.uid()
  );
$$;

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  cleaner_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_order_id_unique UNIQUE (order_id)
);

CREATE INDEX IF NOT EXISTS reviews_client_id_idx ON public.reviews (client_id);
CREATE INDEX IF NOT EXISTS reviews_cleaner_id_idx ON public.reviews (cleaner_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews (created_at DESC);

CREATE TABLE IF NOT EXISTS public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'open',
  reason text NOT NULL,
  description text NOT NULL,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT complaints_status_check CHECK (
    status IN ('open', 'in_progress', 'resolved', 'closed')
  )
);

CREATE INDEX IF NOT EXISTS complaints_client_id_idx ON public.complaints (client_id);
CREATE INDEX IF NOT EXISTS complaints_status_idx ON public.complaints (status);
CREATE INDEX IF NOT EXISTS complaints_created_at_idx ON public.complaints (created_at DESC);

-- One active (open) complaint per order for MVP
CREATE UNIQUE INDEX IF NOT EXISTS complaints_order_id_open_unique
  ON public.complaints (order_id)
  WHERE status = 'open';

COMMENT ON TABLE public.reviews IS 'Client rating after completed order; one review per order.';
COMMENT ON TABLE public.complaints IS 'Client complaints; one open complaint per order (MVP).';

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- reviews
CREATE POLICY reviews_select ON public.reviews
  FOR SELECT
  USING (
    public.is_staff_profile()
    OR client_id = auth.uid()
  );

CREATE POLICY reviews_insert ON public.reviews
  FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND public.client_owns_order(order_id)
  );

-- complaints
CREATE POLICY complaints_select ON public.complaints
  FOR SELECT
  USING (
    public.is_staff_profile()
    OR client_id = auth.uid()
  );

CREATE POLICY complaints_insert ON public.complaints
  FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND public.client_owns_order(order_id)
  );

CREATE POLICY complaints_update ON public.complaints
  FOR UPDATE
  USING (public.is_staff_profile())
  WITH CHECK (public.is_staff_profile());

COMMIT;
