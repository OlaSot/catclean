import {
  collectClientSavedAddresses,
  type ClientSavedAddress,
} from "@/lib/booking/saved-address";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";

const CLIENT_SAVED_ADDRESS_SELECT = `
  id,
  created_at,
  scheduled_date,
  access_notes,
  address:addresses (
    id,
    city,
    street,
    house_number,
    apartment,
    floor,
    postal_code
  )
`;

export async function getClientSavedAddresses(clientId: string): Promise<{
  addresses: ClientSavedAddress[];
  error: string | null;
}> {
  const id = clientId.trim();
  if (!id) {
    return { addresses: [], error: "Invalid client id" };
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return { addresses: [], error: admin.error ?? "Supabase admin client is unavailable" };
  }
  const supabase = admin.supabase;

  const { data: rows, error } = await supabase
    .from("orders")
    .select(CLIENT_SAVED_ADDRESS_SELECT)
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getClientSavedAddresses:", error);
    return { addresses: [], error: error.message };
  }

  const addresses = collectClientSavedAddresses(rows ?? []);

  return { addresses, error: null };
}
