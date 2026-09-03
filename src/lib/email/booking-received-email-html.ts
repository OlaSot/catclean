import {
  getBookingProductLabelEn,
  resolveBookingProductKey,
} from "@/lib/orders/booking-product-label";
import { BERLIN_TIME_ZONE } from "@/lib/booking/berlin-datetime";

export type BookingReceivedEmailContent = {
  clientName: string;
  orderNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  serviceType: string;
  bookingProduct?: string | null;
  confirmationUrl?: string | null;
  estimatedPrice?: number | null;
  currency?: string | null;
};

export const EMAIL_LOGO_CID = "catclean-logo";
export const EMAIL_LOGO_CID_SRC = `cid:${EMAIL_LOGO_CID}`;
export const EMAIL_LOGO_PUBLIC_PATH = "/email/logo.png";

const BRAND = "#34597E";
const TEXT = "#334155";
const HEADING = "#1e293b";
const MUTED = "#64748b";
const PAGE_BG = "#EEF2F7";
const CARD_BORDER = "#e2e8f0";
const ROW_BG = "#F6F8FB";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatVisitLabel(dateKey: string, timeHm: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return `${dateKey} · ${timeHm}`;
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayLabel = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: BERLIN_TIME_ZONE,
  }).format(date);
  return `${dayLabel} · ${timeHm} Uhr`;
}

export function productLabel(input: BookingReceivedEmailContent): string {
  const key = resolveBookingProductKey({
    bookingProduct: input.bookingProduct,
    serviceType: input.serviceType,
  });
  if (key === "home_care") return "Home Care";
  if (key === "home_reset") return "Home Reset";
  if (key === "move_out") return "Umzugsreinigung";
  return getBookingProductLabelEn(key, input.serviceType);
}

function priceLabel(input: BookingReceivedEmailContent): string | null {
  if (typeof input.estimatedPrice !== "number" || !Number.isFinite(input.estimatedPrice)) return null;
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: input.currency || "EUR" }).format(input.estimatedPrice);
}

function detailRow(label: string, value: string, last = false): string {
  const border = last ? "" : "border-bottom:1px solid #e8eef4;";
  return `<tr>
    <td style="padding:12px 16px;${border}">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">${escapeHtml(label)}</p>
      <p style="margin:0;font-size:15px;font-weight:600;color:${HEADING};">${escapeHtml(value)}</p>
    </td>
  </tr>`;
}

export function buildBookingReceivedEmailHtml(
  input: BookingReceivedEmailContent,
  logoSrc: string,
): string {
  const name = input.clientName.trim() || "Guten Tag";
  const visit = formatVisitLabel(input.scheduledDate, input.scheduledTime);
  const address = [input.street, input.houseNumber].filter(Boolean).join(" ");
  const cityLine = [input.zip, input.city].filter(Boolean).join(" ");
  const service = productLabel(input);
  const confirm = input.confirmationUrl?.trim() || "";
  const price = priceLabel(input);

  const logoBlock = logoSrc
    ? `<img src="${escapeHtml(logoSrc)}" alt="CatClean" width="180" height="40" style="display:block;width:180px;height:auto;border:0;outline:none;text-decoration:none;" />`
    : `<p style="margin:0;font-size:20px;font-weight:700;color:${HEADING};">CatClean</p>`;

  const confirmBlock = confirm
    ? `<tr>
        <td style="padding:8px 32px 8px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:${TEXT};">Bitte bestätigen Sie Ihre Angaben. Danach prüfen wir die Verfügbarkeit und planen eine passende Reinigungskraft ein.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="border-radius:999px;background:${BRAND};">
                <a href="${escapeHtml(confirm)}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                  Termin bestätigen
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CatClean · Anfrage erhalten</title>
</head>
<body style="margin:0;padding:0;background:${PAGE_BG};font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:${TEXT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Ihre CatClean-Anfrage ${escapeHtml(input.orderNumber)} ist bei uns eingegangen.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE_BG};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:#ffffff;border:1px solid ${CARD_BORDER};border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid ${CARD_BORDER};">
              ${logoBlock}
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${BRAND};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;">
              <p style="display:inline-block;margin:0 0 14px;padding:6px 10px;border-radius:999px;background:#edf4fa;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND};">Anfrage eingegangen</p>
              <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:${HEADING};">Vielen Dank für Ihre Anfrage</h1>
              <p style="margin:0 0 10px;font-size:15px;line-height:1.55;">Hallo ${escapeHtml(name)},</p>
              <p style="margin:0;font-size:15px;line-height:1.55;">schön, dass Sie CatClean gewählt haben. Ihre Anfrage ist sicher bei uns angekommen.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${ROW_BG};border-radius:16px;">
                ${detailRow("Bestellnummer", input.orderNumber)}
                ${detailRow("Leistung", service)}
                ${detailRow("Termin", visit)}
                ${detailRow("Adresse", `${address}, ${cityLine}`, !price)}
                ${price ? detailRow("Voraussichtlicher Preis", price, true) : ""}
              </table>
            </td>
          </tr>
          ${confirmBlock}
          <tr><td style="padding:20px 32px 28px;"><p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${HEADING};">Wie geht es weiter?</p><p style="margin:0;font-size:13px;line-height:1.6;color:${MUTED};">Nach Ihrer Bestätigung prüfen wir Termin und Leistungsumfang. Sobald alles eingeplant ist, erhalten Sie eine weitere Nachricht von uns.</p></td></tr>
          <tr>
            <td style="padding:16px 32px 24px;border-top:1px solid ${CARD_BORDER};">
              <p style="margin:0;font-size:12px;color:${MUTED};">CatClean · Hannover</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildBookingReceivedEmailText(input: BookingReceivedEmailContent): string {
  const name = input.clientName.trim() || "Guten Tag";
  const visit = formatVisitLabel(input.scheduledDate, input.scheduledTime);
  const address = [input.street, input.houseNumber].filter(Boolean).join(" ");
  const cityLine = [input.zip, input.city].filter(Boolean).join(" ");
  const service = productLabel(input);
  const confirm = input.confirmationUrl?.trim() || "";
  const price = priceLabel(input);

  const textLines = [
    `Hallo ${name},`,
    "",
    "wir haben Ihre Anfrage bei CatClean aufgenommen.",
    `Bestellnummer: ${input.orderNumber}`,
    `Leistung: ${service}`,
    `Termin: ${visit}`,
    `Adresse: ${address}, ${cityLine}`,
    ...(price ? [`Voraussichtlicher Preis: ${price}`] : []),
    "",
  ];
  if (confirm) {
    textLines.push("Bitte bestätigen Sie Ihre Angaben. Danach prüfen wir die Verfügbarkeit und planen eine passende Reinigungskraft ein:");
    textLines.push(confirm);
    textLines.push("");
  }
  textLines.push("Nach Ihrer Bestätigung prüfen wir Termin und Leistungsumfang. Sobald alles eingeplant ist, erhalten Sie eine weitere Nachricht.");
  textLines.push("");
  textLines.push("CatClean · Hannover");
  return textLines.join("\n");
}
