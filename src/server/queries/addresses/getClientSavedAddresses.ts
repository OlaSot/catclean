import {
  collectClientSavedAddresses,
  type ClientSavedAddress,
} from "@/lib/booking/saved-address";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";

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

  const supabase = await createSupabaseServerClient();

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
