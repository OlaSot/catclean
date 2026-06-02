/** Supabase select for cleaner-assigned orders. */
export const CLEANER_ORDER_SELECT = `
  id,
  status,
  scheduled_date,
  scheduled_time,
  service_type,
  currency,
  estimated_price,
  assigned_cleaner_id,
  access_notes,
  pets_info,
  supplies_note,
  equipment_note,
  address:addresses (
    id,
    city,
    street,
    house_number,
    floor
  ),
  client:profiles!orders_client_id_fkey (
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
    completed_at
  )
`;

/** Detail select includes customer comment and doorbell fields on address. */
export const CLEANER_ORDER_DETAIL_SELECT = `
  id,
  status,
  scheduled_date,
  scheduled_time,
  service_type,
  currency,
  estimated_price,
  assigned_cleaner_id,
  access_notes,
  pets_info,
  supplies_note,
  equipment_note,
  address:addresses (
    id,
    city,
    street,
    house_number,
    floor,
    apartment,
    postal_code
  ),
  client:profiles!orders_client_id_fkey (
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
    completed_at
  )
`;
