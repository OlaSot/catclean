-- Customer comments belong to a booking, while postal codes belong to an address.
-- Keeping them separate prevents either value from overwriting the other.
alter table public.orders
  add column if not exists customer_comment text;

comment on column public.orders.customer_comment is
  'Optional comment entered by the customer for this booking.';
