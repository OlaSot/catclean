export function getPublicSiteUrl(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  try {
    return new URL(request.url).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function buildPublicConfirmationUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/confirm-order/${encodeURIComponent(token)}`;
}
