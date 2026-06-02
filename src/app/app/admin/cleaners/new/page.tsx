import Link from "next/link";
import CreateCleanerForm from "@/features/cleaners/components/CreateCleanerForm";

export default function AdminCreateCleanerPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <Link
          href="/app/admin/cleaners"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#34597E]"
        >
          <span aria-hidden>←</span>
          Back to cleaners
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-800">
          New cleaner
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Create auth account, cleaner profile, skills and service area.
        </p>
      </div>

      <div className="max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:p-8">
        <CreateCleanerForm />
      </div>
    </div>
  );
}
