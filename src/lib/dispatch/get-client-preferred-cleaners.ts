import type { SupabaseClient } from "@supabase/supabase-js";

export type ClientPreferredCleaner = {
  id: string;
  clientId: string;
  cleanerId: string;
  isPrimary: boolean;
  createdAt: string;
};

export async function getClientPreferredCleaners(
  supabase: SupabaseClient,
  clientId: string
): Promise<{ items: ClientPreferredCleaner[]; error: string | null }> {
  const id = clientId.trim();
  if (!id) return { items: [], error: "Client id is required" };

  const { data, error } = await supabase
    .from("client_preferred_cleaners")
    .select("id, client_id, cleaner_id, is_primary, created_at")
    .eq("client_id", id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return { items: [], error: error.message };

  const items = (data ?? []).map((row) => ({
    id: String((row as { id: string }).id),
    clientId: String((row as { client_id: string }).client_id),
    cleanerId: String((row as { cleaner_id: string }).cleaner_id),
    isPrimary: Boolean((row as { is_primary: boolean | null }).is_primary),
    createdAt: String((row as { created_at: string }).created_at),
  }));

  return { items, error: null };
}
