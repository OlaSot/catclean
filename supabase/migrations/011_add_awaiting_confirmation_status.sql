DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'order_status'
      AND n.nspname = 'public'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'awaiting_confirmation';
  END IF;
END $$;
