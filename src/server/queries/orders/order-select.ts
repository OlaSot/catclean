/** Shared Supabase select for admin order queries. */
export const ADMIN_ORDER_SELECT = `
  id,
  order_number,
  created_at,
  updated_at,
  status,
  address_id,
  client_id,
  created_by,
  assigned_cleaner_id,
  scheduled_date,
  scheduled_time,
  service_type,
  booking_product,
  currency,
  payment_status,
  estimated_price,
  final_price,
  estimated_duration_minutes,
  internal_note,
  access_notes,
  pets_info,
  supplies_note,
  equipment_note,
  price_breakdown,
  manual_discount,
  manual_surcharge,
  address:addresses (
    id,
    city,
    street,
    house_number,
    apartment,
    floor,
    postal_code
  ),
  client:profiles!orders_client_id_fkey (
    id,
    full_name,
    email,
    phone,
    role
  ),
  assigned_cleaner:profiles!orders_assigned_cleaner_id_fkey (
    id,
    full_name,
    email,
    phone
  ),
  order_assignments (
    id,
    order_id,
    cleaner_id,
    status,
    cleaner:profiles!order_assignments_cleaner_id_fkey (
      id,
      full_name,
      email,
      phone
    )
  )
`;
