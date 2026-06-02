-- =============================================================================
-- CatClean CRM — order file attachments (private Storage bucket: order-files)
-- Migration: 003_order_files
--
-- After applying: create a **private** Storage bucket named `order-files` in Supabase
-- (Dashboard → Storage), or rely on API auto-create via service role on first upload.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.order_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  file_path text NOT NULL,
  file_name text,
  file_type text,
  file_size integer,
  category text NOT NULL CHECK (
    category IN (
      'before_photo',
      'after_photo',
      'damage_photo',
      'document',
      'other'
    )
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_files_order_id_idx
  ON public.order_files (order_id);

CREATE INDEX IF NOT EXISTS order_files_created_at_idx
  ON public.order_files (created_at DESC);

COMMENT ON TABLE public.order_files IS 'Files and photos attached to orders; blobs live in Storage bucket order-files.';
COMMENT ON COLUMN public.order_files.file_path IS 'Storage object path inside bucket order-files (e.g. orders/{orderId}/...).';

COMMIT;
