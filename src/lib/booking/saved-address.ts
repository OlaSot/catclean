import type { SupabaseAddressRow } from "@/entities/order/order.supabase.types";
import type { RepeatBookingAddressPrefill } from "./repeat-booking-prefill";

export type ClientSavedAddress = {
  id: string;
  street: string;
  houseNumber: string;
  apartment: string;
  zip: string;
  city: string;
  floor: string;
  accessNotes: string;
  label: string;
  lastUsedAt: string;
  orderCount: number;
  isDefault: boolean;
};

type AddressOrderRow = {
  id: string | number;
  created_at: string | null;
  scheduled_date: string | null;
  access_notes: string | null;
  address: SupabaseAddressRow | SupabaseAddressRow[] | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function normalizePart(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

export function savedAddressDedupeKey(address: SupabaseAddressRow): string {
  return [
    normalizePart(address.street),
    normalizePart(address.house_number),
    normalizePart(address.city),
    normalizePart(address.floor),
    normalizePart(address.apartment),
  ].join("|");
}

function isGermanZip(value: string): boolean {
  return /^\d{5}$/.test(value.trim());
}

function splitPostalCode(value: string | null | undefined): { zip: string; comment: string } {
  const raw = value?.trim() ?? "";
  if (!raw) return { zip: "", comment: "" };
  if (isGermanZip(raw)) return { zip: raw, comment: "" };
  return { zip: "", comment: raw };
}

export function mapAddressRowToPrefill(
  address: SupabaseAddressRow,
  accessNotes?: string | null,
): RepeatBookingAddressPrefill {
  const { zip } = splitPostalCode(address.postal_code);

  return {
    street: address.street?.trim() ?? "",
    houseNumber: address.house_number?.trim() ?? "",
    apartment: address.apartment?.trim() ?? "",
    zip,
    city: address.city?.trim() ?? "",
    floor: address.floor?.trim() ?? "",
    accessNotes: accessNotes?.trim() ?? "",
  };
}

function formatAddressLabel(parts: RepeatBookingAddressPrefill): string {
  const line = [parts.street, parts.houseNumber].filter(Boolean).join(" ");
  const city = parts.city.trim();
  if (line && city) return `${line}, ${city}`;
  return line || city || "Address";
}

function orderUsedAt(row: AddressOrderRow): string {
  return row.scheduled_date?.slice(0, 10) ?? row.created_at?.slice(0, 10) ?? "";
}

export function collectClientSavedAddresses(rows: AddressOrderRow[]): ClientSavedAddress[] {
  const byKey = new Map<string, ClientSavedAddress>();

  for (const row of rows) {
    const address = unwrapRelation(row.address);
    if (!address?.id) continue;

    const street = address.street?.trim() ?? "";
    const houseNumber = address.house_number?.trim() ?? "";
    const city = address.city?.trim() ?? "";
    if (!street && !houseNumber && !city) continue;

    const key = savedAddressDedupeKey(address);
    const prefill = mapAddressRowToPrefill(address, row.access_notes);
    const usedAt = orderUsedAt(row);
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, {
        id: address.id,
        ...prefill,
        label: formatAddressLabel(prefill),
        lastUsedAt: usedAt,
        orderCount: 1,
        isDefault: false,
      });
      continue;
    }

    existing.orderCount += 1;
    if (usedAt && (!existing.lastUsedAt || usedAt > existing.lastUsedAt)) {
      existing.lastUsedAt = usedAt;
      existing.id = address.id;
      existing.street = prefill.street;
      existing.houseNumber = prefill.houseNumber;
      existing.apartment = prefill.apartment;
      existing.zip = prefill.zip;
      existing.city = prefill.city;
      existing.floor = prefill.floor;
      existing.accessNotes = prefill.accessNotes || existing.accessNotes;
      existing.label = formatAddressLabel(prefill);
    }
  }

  const addresses = [...byKey.values()].sort((a, b) =>
    b.lastUsedAt.localeCompare(a.lastUsedAt),
  );

  if (addresses[0]) {
    addresses[0].isDefault = true;
  }

  return addresses;
}
