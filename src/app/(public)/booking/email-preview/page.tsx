import { SitePageShell } from "@/components/layout/SitePageShell";
import {
  EMAIL_LOGO_PUBLIC_PATH,
  buildBookingReceivedEmailHtml,
} from "@/lib/email/booking-received-email-html";

const PREVIEW_EMAIL = {
  clientName: "Anna Schmidt",
  orderNumber: "5B7657",
  scheduledDate: "2026-09-12",
  scheduledTime: "10:00",
  street: "Georgstraße",
  houseNumber: "18",
  zip: "30159",
  city: "Hannover",
  serviceType: "home_reset",
  bookingProduct: "home_reset",
  confirmationUrl: "https://catclean.de/confirm-order/preview",
  estimatedPrice: 262.08,
  currency: "EUR",
};

export default function BookingEmailPreviewPage() {
  const html = buildBookingReceivedEmailHtml(PREVIEW_EMAIL, EMAIL_LOGO_PUBLIC_PATH);

  return (
    <SitePageShell
      backgroundClassName="min-h-screen bg-[#EEF2F7] text-slate-700"
      contentClassName="py-6 sm:py-8"
    >
      <div className="mx-auto max-w-[600px]">
        <p className="mb-4 text-sm text-slate-500">
          Vorschau der Buchungsmail — so sieht sie im Postfach aus.
        </p>
        <iframe
          title="CatClean Buchungsmail"
          className="h-[920px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
          srcDoc={html}
        />
      </div>
    </SitePageShell>
  );
}
