import Link from "next/link";
import CreateClientForm from "@/features/clients/components/CreateClientForm";

export default function AdminCreateClientPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <Link
          href="/app/admin/clients"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#34597E]"
        >
          <span aria-hidden>←</span>
          Back to clients
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-800">
          New client
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Create auth account, client profile and contact details.
        </p>
      </div>

      <div className="max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:p-8">
        <CreateClientForm />
      </div>
    </div>
  );
}
