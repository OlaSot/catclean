export type SupabaseAddressRow = {
  id: string;
  city: string | null;
  street: string | null;
  house_number: string | null;
  apartment: string | null;
  floor: string | null;
  postal_code: string | null;
};

export type SupabaseProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role?: string | null;
};

export type SupabaseOrderAssignmentRow = {
  id: string;
  order_id: string;
  cleaner_id: string;
  status: string | null;
  completed_at?: string | null;
  cleaner?: SupabaseProfileRow | null;
};

export type SupabaseOrderRow = {
  id: number | string;
  order_number?: string | null;
  created_at: string;
  updated_at: string | null;
  status: string;
  address_id: string | null;
  client_id: string | null;
  created_by: string | null;
  assigned_cleaner_id: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  service_type: string | null;
  booking_product?: string | null;
  currency: string | null;
  payment_status: string | null;
  estimated_price: number | null;
  final_price?: number | null;
  estimated_duration_minutes?: number | null;
  internal_note?: string | null;
  access_notes?: string | null;
  pets_info?: string | null;
  supplies_note?: string | null;
  equipment_note?: string | null;
  price_breakdown?: Record<string, unknown> | null;
  manual_discount?: number | null;
  manual_surcharge?: number | null;
  address?: SupabaseAddressRow | SupabaseAddressRow[] | null;
  client?: SupabaseProfileRow | SupabaseProfileRow[] | null;
  assigned_cleaner?: SupabaseProfileRow | SupabaseProfileRow[] | null;
  order_assignments?: SupabaseOrderAssignmentRow[] | null;
};

export type ClientOrderStats = {
  ordersCount: number;
  lastOrderDateISO?: string;
};
