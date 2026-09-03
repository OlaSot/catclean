/** Region Hannover postal codes (city + surrounding municipalities). */

const PLZ_RANGES: ReadonlyArray<readonly [number, number]> = [
  [30159, 30669], // Hannover
  [30823, 30827], // Garbsen
  [30851, 30855], // Langenhagen
  [30880, 30880], // Laatzen
  [30890, 30890], // Barsinghausen
  [30900, 30900], // Wedemark
  [30916, 30916], // Isernhagen
  [30926, 30926], // Seelze
  [30938, 30938], // Burgwedel
  [30952, 30952], // Ronnenberg
  [30966, 30966], // Hemmingen
  [30974, 30974], // Wennigsen
  [30982, 30982], // Pattensen
  [30989, 30989], // Gehrden
  [31275, 31275], // Lehrte
  [31303, 31303], // Burgdorf
  [31311, 31311], // Uetze
  [31319, 31319], // Sehnde
  [31515, 31515], // Wunstorf
  [31535, 31535], // Neustadt am Rübenberge
  [31832, 31832], // Springe
];

export function normalizeGermanZip(zip: string | null | undefined): string {
  return (zip ?? "").replace(/\s+/g, "");
}

export function isHannoverPostalCode(zip: string | null | undefined): boolean {
  const digits = normalizeGermanZip(zip);
  if (!/^\d{5}$/.test(digits)) return false;
  const value = Number(digits);
  return PLZ_RANGES.some(([from, to]) => value >= from && value <= to);
}

export function isHannoverServiceArea(
  zip: string | null | undefined,
  _city?: string | null
): boolean {
  return isHannoverPostalCode(zip);
}

type AddressWithServiceArea = {
  zip: string;
  city: string;
  street?: string;
  serviceAreaValidated: boolean;
  googlePlaceId?: string;
  latitude?: number | null;
  longitude?: number | null;
};

/** Street typing always requires a new Google pick. ZIP/city edits follow the PLZ allowlist. */
export function addressAfterManualEdit<T extends AddressWithServiceArea>(
  current: T,
  patch: Partial<T>
): T {
  const next = { ...current, ...patch };
  if (Object.prototype.hasOwnProperty.call(patch, "street")) {
    next.serviceAreaValidated = false;
    if ("googlePlaceId" in next) next.googlePlaceId = "";
    if ("latitude" in next) next.latitude = null;
    if ("longitude" in next) next.longitude = null;
    return next;
  }
  if (
    Object.prototype.hasOwnProperty.call(patch, "zip") ||
    Object.prototype.hasOwnProperty.call(patch, "city")
  ) {
    next.serviceAreaValidated = isHannoverServiceArea(next.zip, next.city);
  }
  return next;
}
