"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField, inputClassName } from "@/components/ui/FormField";
import type { CreateAdminCleanerApiResponse } from "@/features/cleaners/types/create-admin-cleaner-api.types";
import {
  PHONE_FORM_EXAMPLE,
  PHONE_FORM_HINT,
} from "@/lib/phone/profile-phone";

const selectClassName =
  "w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-[#5B8DB8]/50 focus:ring-4 focus:ring-[#5B8DB8]/10";

function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200/80 bg-[#F6F8FB] px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#C5D9EB]"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-[#34597E] focus:ring-[#5B8DB8]/30"
      />
      {label}
    </label>
  );
}

export default function CreateCleanerForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"active" | "pending">("active");
  const [petFriendly, setPetFriendly] = useState(false);
  const [ownsVacuum, setOwnsVacuum] = useState(false);
  const [ownsSteamCleaner, setOwnsSteamCleaner] = useState(false);
  const [acceptsWindows, setAcceptsWindows] = useState(false);
  const [acceptsDryCleaning, setAcceptsDryCleaning] = useState(false);

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
      status,
      baseCity: String(formData.get("baseCity") ?? "").trim(),
      workingRadiusKm: Number(formData.get("workingRadiusKm")),
      petFriendly,
      ownsVacuum,
      ownsSteamCleaner,
      acceptsWindows,
      acceptsDryCleaning,
    };

    try {
      const response = await fetch("/api/admin/cleaners", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as CreateAdminCleanerApiResponse;

      if (!response.ok || json.error || !json.data) {
        setError(json.error ?? "Failed to create cleaner");
        return;
      }

      router.push("/app/admin/cleaners");
      router.refresh();
    } catch {
      setError("Failed to create cleaner");
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
            Creates Supabase Auth user, profile (role cleaner) and
            cleaner_profiles. profiles.id = auth user id.
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

          <FormField label="Password" htmlFor="password" hint="Min. 6 characters">
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

          <FormField label="Status" htmlFor="status">
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "active" | "pending")
              }
              className={selectClassName}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </FormField>

          <FormField label="Base city" htmlFor="baseCity">
            <input
              id="baseCity"
              name="baseCity"
              type="text"
              required
              className={inputClassName}
            />
          </FormField>

          <FormField
            label="Working radius (km)"
            htmlFor="workingRadiusKm"
            hint="0–500"
          >
            <input
              id="workingRadiusKm"
              name="workingRadiusKm"
              type="number"
              min={0}
              max={500}
              step={1}
              defaultValue={15}
              required
              className={inputClassName}
            />
          </FormField>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Skills & equipment
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <CheckboxField
            id="petFriendly"
            label="Pet friendly"
            checked={petFriendly}
            onChange={setPetFriendly}
          />
          <CheckboxField
            id="ownsVacuum"
            label="Owns vacuum"
            checked={ownsVacuum}
            onChange={setOwnsVacuum}
          />
          <CheckboxField
            id="ownsSteamCleaner"
            label="Owns steam cleaner"
            checked={ownsSteamCleaner}
            onChange={setOwnsSteamCleaner}
          />
          <CheckboxField
            id="acceptsWindows"
            label="Accepts windows"
            checked={acceptsWindows}
            onChange={setAcceptsWindows}
          />
          <CheckboxField
            id="acceptsDryCleaning"
            label="Accepts dry cleaning"
            checked={acceptsDryCleaning}
            onChange={setAcceptsDryCleaning}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200/80 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-[#34597E] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create cleaner"}
        </button>

        <Link
          href="/app/admin/cleaners"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
