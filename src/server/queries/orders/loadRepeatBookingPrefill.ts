import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import {
  mapOrderToRepeatPrefill,
  type RepeatBookingPrefill,
} from "@/lib/booking/repeat-booking-prefill";
import { getClientOrderById } from "@/server/queries/orders/getClientOrderById";

export async function loadRepeatBookingPrefill(
  repeatFrom: string | undefined,
): Promise<RepeatBookingPrefill | undefined> {
  const orderId = repeatFrom?.trim();
  if (!orderId) return undefined;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return undefined;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "client") return undefined;

  const { order } = await getClientOrderById(orderId, user.id);
  if (!order) return undefined;

  const prefill = mapOrderToRepeatPrefill(order);

  // Enrich contact from profile when available
  const { data: clientProfile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (clientProfile) {
    prefill.contact.name = clientProfile.full_name?.trim() || prefill.contact.name;
    prefill.contact.email = clientProfile.email?.trim() || prefill.contact.email;
    prefill.contact.phone = clientProfile.phone?.trim() || prefill.contact.phone;
  }

  return prefill;
}
