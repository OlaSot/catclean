import type { OrderOperationalNotesPublic } from "./order-operational-notes.types";
import type { SupabaseOrderRow } from "./order.supabase.types";

export function mapOrderOperationalNotesPublic(
  row: SupabaseOrderRow
): OrderOperationalNotesPublic {
  return {
    accessNotes: row.access_notes?.trim() || null,
    petsInfo: row.pets_info?.trim() || null,
    suppliesNote: row.supplies_note?.trim() || null,
    equipmentNote: row.equipment_note?.trim() || null,
  };
}

export const EMPTY_OPERATIONAL_NOTES_PUBLIC: OrderOperationalNotesPublic = {
  accessNotes: null,
  petsInfo: null,
  suppliesNote: null,
  equipmentNote: null,
};
