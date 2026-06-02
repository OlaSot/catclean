/** Default region for parsing local numbers without country code. */
const DE_COUNTRY_CODE = "49";

/** E.164 national number length for DE (after +49), inclusive range. */
const DE_NATIONAL_MIN = 9;
const DE_NATIONAL_MAX = 12;

/**
 * Normalize a phone number to E.164 (Germany-focused MVP).
 * Returns null when the value cannot be parsed as a valid DE number.
 */
export function normalizePhone(input: string): string | null {
  if (typeof input !== "string") return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  // Remove spaces, brackets, dashes, dots, slashes (keep leading + during first pass)
  let compact = trimmed.replace(/[\s\-()./]/g, "");

  let digits: string;

  if (compact.startsWith("+")) {
    digits = compact.slice(1).replace(/\D/g, "");
  } else {
    digits = compact.replace(/\D/g, "");
    if (!digits) return null;

    if (digits.startsWith("00")) {
      digits = digits.slice(2);
    } else if (digits.startsWith("0")) {
      // 01781234567 -> 491781234567
      digits = `${DE_COUNTRY_CODE}${digits.slice(1)}`;
    } else if (!digits.startsWith(DE_COUNTRY_CODE)) {
      return null;
    }
  }

  if (!digits.startsWith(DE_COUNTRY_CODE)) {
    return null;
  }

  const national = digits.slice(DE_COUNTRY_CODE.length);
  if (!/^\d+$/.test(national)) return null;
  if (national.length < DE_NATIONAL_MIN || national.length > DE_NATIONAL_MAX) {
    return null;
  }

  return `+${DE_COUNTRY_CODE}${national}`;
}

export function isValidPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}
