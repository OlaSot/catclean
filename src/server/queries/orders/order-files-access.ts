import type { SupabaseClient } from "@supabase/supabase-js";

export async function assertAdminOrderExists(
  supabase: SupabaseClient,
  orderId: string
): Promise<{ ok: true } | { ok: false; notFound: boolean; error: string | null }> {
  const id = orderId.trim();
  if (!id) {
    return { ok: false, notFound: false, error: "Invalid order id" };
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("assertAdminOrderExists:", error);
    return { ok: false, notFound: false, error: error.message };
  }

  if (!data?.id) {
    return { ok: false, notFound: true, error: null };
  }

  return { ok: true };
}
