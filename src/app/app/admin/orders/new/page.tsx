import Link from "next/link";
import CreateOrderForm from "@/features/orders/components/CreateOrderForm";

export default function AdminCreateOrderPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F6F8FB] px-6 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <Link
            href="/app/admin/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#34597E]"
          >
            <span aria-hidden>←</span>
            Back to orders
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-800">
            New order
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Link an existing client profile, then add address and schedule.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:p-8">
          <CreateOrderForm />
        </div>
      </div>
    </div>
  );
}
