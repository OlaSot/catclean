/** Supabase select for client-owned orders (orders.client_id = auth.uid()). */
export const CLIENT_ORDER_SELECT = `
  id,
  status,
  scheduled_date,
  scheduled_time,
  service_type,
  currency,
  payment_status,
  estimated_price,
  client_id,
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
    apartment,
    floor,
    postal_code
  ),
  assigned_cleaner:profiles!orders_assigned_cleaner_id_fkey (
    id,
    full_name,
    email,
    phone
  )
`;
