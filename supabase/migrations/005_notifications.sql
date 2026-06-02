-- =============================================================================
-- CatClean CRM — in-app notifications (MVP)
-- Migration: 005_notifications
-- =============================================================================

BEGIN;

-- Helper used by RLS policies (admin / operator)
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

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role_target text NOT NULL CHECK (role_target IN ('admin', 'operator', 'client', 'cleaner')),
  type text NOT NULL,
  title text NOT NULL,
  message text,
  order_id uuid REFERENCES public.orders (id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx
  ON public.notifications (user_id);

CREATE INDEX IF NOT EXISTS notifications_created_at_idx
  ON public.notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications (user_id, created_at DESC)
  WHERE is_read = false;

COMMENT ON TABLE public.notifications IS 'In-app notifications for CRM users (no email/SMS).';

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Read: staff sees everything; regular users see only their own
DROP POLICY IF EXISTS notifications_select ON public.notifications;
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT
  USING (
    public.is_staff_profile()
    OR user_id = auth.uid()
  );

-- Update: staff can update all; users can update only their own (API limits fields)
DROP POLICY IF EXISTS notifications_update ON public.notifications;
CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE
  USING (
    public.is_staff_profile()
    OR user_id = auth.uid()
  )
  WITH CHECK (
    public.is_staff_profile()
    OR user_id = auth.uid()
  );

COMMIT;

