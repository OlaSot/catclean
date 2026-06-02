export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readLocalStorageJson(key: string): unknown | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function writeLocalStorageJson(key: string, value: unknown): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota / privacy mode errors.
  }
}

export function removeLocalStorageItem(key: string): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors.
  }
}
