-- Home Care product separation: booking source + structured wizard fields

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS booking_product text;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS cleaning_frequency text;

ALTER TABLE public.regular_cleaning_details
  ADD COLUMN IF NOT EXISTS property_type text;

COMMENT ON COLUMN public.orders.booking_product IS
  'Wizard product identifier, e.g. home_care | home_reset';

COMMENT ON COLUMN public.regular_cleaning_details.cleaning_frequency IS
  'Preferred cleaning cadence: one_time | weekly | biweekly | monthly';

COMMENT ON COLUMN public.regular_cleaning_details.property_type IS
  'Property type from booking wizard: apartment | house';
