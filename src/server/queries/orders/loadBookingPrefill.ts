import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import type { ClientSavedAddress } from "@/lib/booking/saved-address";
import type { RepeatBookingPrefill } from "@/lib/booking/repeat-booking-prefill";
import { getClientSavedAddresses } from "@/server/queries/addresses/getClientSavedAddresses";
import { loadRepeatBookingPrefill } from "@/server/queries/orders/loadRepeatBookingPrefill";

function savedAddressToPrefill(address: ClientSavedAddress): RepeatBookingPrefill {
  return {
    orderId: "",
    serviceId: "home_care",
    address: {
      street: address.street,
      houseNumber: address.houseNumber,
      apartment: address.apartment,
      zip: address.zip,
      city: address.city,
      floor: address.floor,
      accessNotes: address.accessNotes,
    },
    contact: {
      name: "",
      phone: "",
      email: "",
      notes: "",
    },
    petsInfo: null,
    customerComment: null,
  };
}

async function enrichContactFromProfile(
  prefill: RepeatBookingPrefill,
  userId: string,
): Promise<RepeatBookingPrefill> {
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return prefill;

  return {
    ...prefill,
    contact: {
      ...prefill.contact,
      name: profile.full_name?.trim() || prefill.contact.name,
      email: profile.email?.trim() || prefill.contact.email,
      phone: profile.phone?.trim() || prefill.contact.phone,
    },
  };
}

async function loadSavedAddressPrefill(
  addressId: string | undefined,
  userId: string,
): Promise<RepeatBookingPrefill | undefined> {
  const { addresses } = await getClientSavedAddresses(userId);
  if (addresses.length === 0) return undefined;

  const selected =
    (addressId ? addresses.find((item) => item.id === addressId) : undefined) ??
    addresses.find((item) => item.isDefault) ??
    addresses[0];

  if (!selected) return undefined;

  const prefill = savedAddressToPrefill(selected);
  return enrichContactFromProfile(prefill, userId);
}

export async function loadBookingPrefill(options: {
  repeatFrom?: string;
  addressId?: string;
}): Promise<RepeatBookingPrefill | undefined> {
  const repeatPrefill = await loadRepeatBookingPrefill(options.repeatFrom);
  if (repeatPrefill) return repeatPrefill;

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

  return loadSavedAddressPrefill(options.addressId, user.id);
}
