/** Operational order notes visible to client and cleaner (no admin-only fields). */
export type OrderOperationalNotesPublic = {
  accessNotes: string | null;
  petsInfo: string | null;
  suppliesNote: string | null;
  equipmentNote: string | null;
};
