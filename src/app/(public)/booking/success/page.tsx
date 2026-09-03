import { BookingFlowShell } from "@/components/booking/BookingFlowShell";
import { BookingSuccessView } from "@/components/booking/BookingSuccessView";

type BookingSuccessPageProps = {
  searchParams?: Promise<{ order?: string; mail?: string; portal?: string }>;
};

function sanitizeOrderId(raw: string | undefined): string | null {
  const value = raw?.trim() ?? "";
  if (!value || value.length > 40) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(value)) return null;
  return value;
}

export default async function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const params = await searchParams;
  const orderId = sanitizeOrderId(params?.order);

  return (
    <BookingFlowShell
      portalMode={params?.portal === "1"}
      backgroundClassName="min-h-screen bg-white text-slate-700"
      contentClassName="py-6 sm:py-10"
    >
      <BookingSuccessView orderId={orderId} emailSent={params?.mail === "1"} returnToPortal={params?.portal === "1"} />
    </BookingFlowShell>
  );
}
