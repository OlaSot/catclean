"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPreferredCleaner } from "../api/client-portal-api";
import type { PortalPreferredCleaner } from "../types/portal.types";
import {
  PORTAL_GREETING_CLASS,
  PORTAL_MUTED_CLASS,
} from "../lib/portal-styles";
import CleanerProfileCard from "../components/CleanerProfileCard";
import PortalEmptyState from "../components/PortalEmptyState";
import PortalPrimaryButton from "../components/PortalPrimaryButton";

export default function ClientPreferredCleanerView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cleaner, setCleaner] = useState<PortalPreferredCleaner | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPreferredCleaner();
        if (!cancelled) setCleaner(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load preferred cleaner");
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
      <div className="py-16 text-center text-sm text-slate-500">Loading preferred cleaner…</div>
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
        <h1 className={`${PORTAL_GREETING_CLASS} mt-4`}>Preferred Cleaner</h1>
        <p className={`${PORTAL_MUTED_CLASS} mt-1`}>
          Your trusted cleaner for repeat bookings
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {cleaner ? (
        <CleanerProfileCard cleaner={cleaner} variant="hero" />
      ) : (
        <PortalEmptyState
          title="No preferred cleaner yet."
          description="After your first visit, you can save a cleaner you love and request them for future bookings."
          action={
            <PortalPrimaryButton href="/booking">
              Book your first cleaning
            </PortalPrimaryButton>
          }
        />
      )}
    </div>
  );
}
