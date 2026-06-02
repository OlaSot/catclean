DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'cleaner_availability'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'cleaner_availability'
        AND column_name = 'cleaner_id'
    ) THEN
      ALTER TABLE public.cleaner_availability
        ADD COLUMN cleaner_id uuid references public.profiles(id) on delete cascade;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'cleaner_availability'
        AND column_name = 'cleanerid'
    ) THEN
      EXECUTE '
        UPDATE public.cleaner_availability
        SET cleaner_id = cleanerid
        WHERE cleaner_id IS NULL
      ';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'cleaner_availability'
        AND column_name = 'date'
    ) THEN
      ALTER TABLE public.cleaner_availability
        ADD COLUMN date date;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'cleaner_availability'
        AND column_name = 'work_date'
    ) THEN
      EXECUTE '
        UPDATE public.cleaner_availability
        SET date = work_date
        WHERE date IS NULL
      ';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'cleaner_availability'
        AND column_name = 'available_date'
    ) THEN
      EXECUTE '
        UPDATE public.cleaner_availability
        SET date = available_date
        WHERE date IS NULL
      ';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.cleaner_availability
      WHERE cleaner_id IS NULL
    ) THEN
      RAISE NOTICE 'cleaner_availability has NULL cleaner_id rows; NOT NULL not applied';
    ELSE
      ALTER TABLE public.cleaner_availability
        ALTER COLUMN cleaner_id SET NOT NULL;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.cleaner_availability
      WHERE date IS NULL
    ) THEN
      RAISE NOTICE 'cleaner_availability has NULL date rows; NOT NULL not applied';
    ELSE
      ALTER TABLE public.cleaner_availability
        ALTER COLUMN date SET NOT NULL;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cleaner_availability'
      AND column_name = 'cleaner_id'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cleaner_availability'
      AND column_name = 'date'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS cleaner_availability_cleaner_date_uq
      ON public.cleaner_availability(cleaner_id, date);

    CREATE INDEX IF NOT EXISTS cleaner_availability_cleaner_date_idx
      ON public.cleaner_availability(cleaner_id, date);
  ELSE
    RAISE NOTICE 'Skipping cleaner_availability indexes: cleaner_id/date not ready';
  END IF;
END $$;
