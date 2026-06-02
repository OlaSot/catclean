import { BookingWizard } from "@/features/booking-wizard";

type BookingPageProps = {
  searchParams?: Promise<{ service?: string }>;
};

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  return (
    <main className="min-h-screen bg-[#EEF2F7] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1720px]">
        <div className="mb-6">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-700 sm:text-5xl">
            Book your cleaning
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Premium booking flow with instant estimate.
          </p>
        </div>
        <BookingWizard initialService={params?.service} />
      </div>
    </main>
  );
}
