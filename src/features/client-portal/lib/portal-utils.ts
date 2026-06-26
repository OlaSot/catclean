export function formatPortalMoney(value: number, currency = "EUR"): string {
  if (currency === "EUR") {
    return `€${value.toFixed(0)}`;
  }
  return `${value.toFixed(2)} ${currency}`;
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getGreetingName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0];
  return first || "there";
}

export function formatNotificationDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
