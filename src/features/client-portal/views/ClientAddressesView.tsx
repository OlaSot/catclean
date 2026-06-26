"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { fetchClientAddresses } from "../api/client-portal-api";
import type { PortalSavedAddress } from "../types/portal.types";
import {
  PORTAL_CARD_CLASS,
  PORTAL_GREETING_CLASS,
  PORTAL_MUTED_CLASS,
} from "../lib/portal-styles";
import PortalEmptyState from "../components/PortalEmptyState";
import PortalPrimaryButton from "../components/PortalPrimaryButton";

function formatLastUsed(isoDate: string): string {
  if (!isoDate) return "—";
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AddressCard({ address }: { address: PortalSavedAddress }) {
  const details = [
    address.floor ? `Floor ${address.floor}` : null,
    address.apartment ? `Apt ${address.apartment}` : null,
    address.zip || null,
  ].filter(Boolean);

  return (
    <article className={`${PORTAL_CARD_CLASS} p-5`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#34597E]/10 text-[#34597E]">
          <MapPin className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">{address.label}</h2>
            {address.isDefault ? (
              <span className="rounded-full bg-[#34597E]/10 px-2 py-0.5 text-xs font-medium text-[#34597E]">
                Default
              </span>
            ) : null}
          </div>
          {details.length > 0 ? (
            <p className="mt-1 text-sm text-slate-500">{details.join(" · ")}</p>
          ) : null}
          {address.accessNotes ? (
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Access:</span>{" "}
              {address.accessNotes}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-slate-400">
            Last used {formatLastUsed(address.lastUsedAt)}
            {address.orderCount > 1 ? ` · ${address.orderCount} bookings` : ""}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Link
          href={`/booking?addressId=${encodeURIComponent(address.id)}`}
          className="inline-flex rounded-full border border-[#34597E]/20 bg-white px-4 py-2 text-sm font-semibold text-[#34597E] transition hover:bg-[#34597E]/5"
        >
          Book at this address
        </Link>
      </div>
    </article>
  );
}

export default function ClientAddressesView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<PortalSavedAddress[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchClientAddresses();
        if (!cancelled) setAddresses(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load addresses");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">Loading addresses…</div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/app/client/profile"
          className="inline-flex text-sm font-medium text-[#34597E] hover:underline"
        >
          ← Back to profile
        </Link>
        <h1 className={`${PORTAL_GREETING_CLASS} mt-4`}>Addresses</h1>
        <p className={`${PORTAL_MUTED_CLASS} mt-1`}>
          Saved from your past bookings — used to prefill new orders
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      ) : (
        <PortalEmptyState
          title="No saved addresses yet"
          description="After your first booking, your address will appear here and be prefilled automatically next time."
          action={
            <PortalPrimaryButton href="/booking">Book Cleaning</PortalPrimaryButton>
          }
        />
      )}
    </div>
  );
}
