"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField, inputClassName } from "@/components/ui/FormField";
import type { CreateAdminClientApiResponse } from "@/features/clients/types/create-admin-client-api.types";
import {
  PHONE_FORM_EXAMPLE,
  PHONE_FORM_HINT,
} from "@/lib/phone/profile-phone";

const selectClassName =
  "w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10";

export default function CreateClientForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientType, setClientType] = useState<"private" | "business">("private");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      fullName: String(formData.get("fullName") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      clientType,
      companyName: String(formData.get("companyName") ?? "").trim() || null,
    };

    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as CreateAdminClientApiResponse;

      if (!response.ok || json.error || !json.data) {
        setError(json.error ?? "Failed to create client");
        return;
      }

      router.push("/app/admin/clients");
      router.refresh();
    } catch {
      setError("Failed to create client");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Creates Supabase Auth user, profile (role client) and client_profiles.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="off"
              className={inputClassName}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            hint="Minimum 6 characters"
          >
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClassName}
            />
          </FormField>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-slate-800">Profile</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Full name" htmlFor="fullName">
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className={inputClassName}
            />
          </FormField>

          <FormField
            label="Phone"
            htmlFor="phone"
            hint={`${PHONE_FORM_HINT}. Example: ${PHONE_FORM_EXAMPLE}`}
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className={inputClassName}
              placeholder={PHONE_FORM_EXAMPLE}
            />
          </FormField>

          <FormField label="Client type" htmlFor="clientType">
            <select
              id="clientType"
              name="clientType"
              value={clientType}
              onChange={(e) =>
                setClientType(e.target.value as "private" | "business")
              }
              className={selectClassName}
            >
              <option value="private">Private</option>
              <option value="business">Business</option>
            </select>
          </FormField>

          <FormField
            label="Company name"
            htmlFor="companyName"
            hint="Optional"
          >
            <input
              id="companyName"
              name="companyName"
              type="text"
              className={inputClassName}
            />
          </FormField>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200/80 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create client"}
        </button>

        <Link
          href="/app/admin/clients"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
