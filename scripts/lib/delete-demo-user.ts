import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ORDER_SERVICE_DETAIL_TABLE,
} from "../../src/lib/constants/orders";

const ALL_DETAIL_TABLES = Object.values(ORDER_SERVICE_DETAIL_TABLE);

async function deleteOrdersForClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<number> {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, address_id")
    .eq("client_id", clientId);

  if (ordersError) {
    throw new Error(`deleteOrdersForClient: ${ordersError.message}`);
  }

  const orderIds = (orders ?? []).map((o) => String(o.id));
  const addressIds = [
    ...new Set(
      (orders ?? [])
        .map((o) => o.address_id as string | null)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  if (orderIds.length > 0) {
    await supabase.from("order_status_history").delete().in("order_id", orderIds);
    await supabase.from("order_assignments").delete().in("order_id", orderIds);

    for (const table of ALL_DETAIL_TABLES) {
      const { error } = await supabase.from(table).delete().in("order_id", orderIds);
      if (error) {
        throw new Error(`deleteOrdersForClient ${table}: ${error.message}`);
      }
    }

    const { error: orderDelError } = await supabase
      .from("orders")
      .delete()
      .in("id", orderIds);
    if (orderDelError) {
      throw new Error(`deleteOrdersForClient orders: ${orderDelError.message}`);
    }
  }

  if (addressIds.length > 0) {
    const { error: addressDelError } = await supabase
      .from("addresses")
      .delete()
      .in("id", addressIds);
    if (addressDelError) {
      throw new Error(`deleteOrdersForClient addresses: ${addressDelError.message}`);
    }
  }

  return orderIds.length;
}

/**
 * Removes a demo auth user and related profile rows (orders included).
 */
export async function deleteDemoUserByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<{ deleted: boolean; ordersRemoved: number }> {
  const normalized = email.trim().toLowerCase();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .ilike("email", normalized)
    .maybeSingle();

  if (profileError) {
    throw new Error(`deleteDemoUserByEmail profile: ${profileError.message}`);
  }

  if (!profile?.id) {
    return { deleted: false, ordersRemoved: 0 };
  }

  const profileId = profile.id as string;
  const role = (profile.role ?? "").toLowerCase();

  let ordersRemoved = 0;
  if (role === "client") {
    ordersRemoved = await deleteOrdersForClient(supabase, profileId);
    await supabase.from("client_profiles").delete().eq("profile_id", profileId);
  } else if (role === "cleaner") {
    await supabase.from("order_assignments").delete().eq("cleaner_id", profileId);
    await supabase
      .from("orders")
      .update({ assigned_cleaner_id: null })
      .eq("assigned_cleaner_id", profileId);
    await supabase.from("cleaner_profiles").delete().eq("profile_id", profileId);
  }

  const { error: profileDelError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);
  if (profileDelError) {
    throw new Error(`deleteDemoUserByEmail profiles: ${profileDelError.message}`);
  }

  const { error: authDelError } = await supabase.auth.admin.deleteUser(profileId);
  if (authDelError) {
    throw new Error(`deleteDemoUserByEmail auth: ${authDelError.message}`);
  }

  return { deleted: true, ordersRemoved };
}
