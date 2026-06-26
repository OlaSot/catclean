"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Bell,
  ChevronRight,
  Globe,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  PORTAL_CARD_CLASS,
  PORTAL_GREETING_CLASS,
  PORTAL_MUTED_CLASS,
} from "../lib/portal-styles";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";
import { useClientPortal } from "../providers/ClientPortalProvider";

function ProfileLinkRow({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: typeof MapPin;
  label: string;
  value?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#34597E]">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {value ? <p className="text-sm text-slate-500">{value}</p> : null}
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
    </Link>
  );
}

function ProfileInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#34597E]">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function ToggleRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <span
        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${
          enabled ? "bg-[#34597E]" : "bg-slate-200"
        }`}
        aria-hidden
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            enabled ? "left-[1.375rem]" : "left-0.5"
          }`}
        />
      </span>
    </div>
  );
}

export default function ClientProfileView() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { profile, profileLoading } = useClientPortal();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (profileLoading) {
    return <div className="py-16 text-center text-sm text-slate-500">Loading profile…</div>;
  }

  const client = profile;

  return (
    <div className="space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
      <header className={`${PORTAL_CARD_CLASS} p-6 text-center lg:col-span-2`}>
        <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-3xl bg-[#EEF4FA] ring-4 ring-white shadow-lg">
          {client?.avatarUrl ? (
            <Image
              src={client.avatarUrl}
              alt={client.fullName}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[#34597E]">
              {client?.firstName?.[0] ?? "?"}
            </div>
          )}
        </div>
        <h1 className={`${PORTAL_GREETING_CLASS} mt-4`}>
          {client?.fullName ?? "Your profile"}
        </h1>
        <p className={`${PORTAL_MUTED_CLASS} mt-1`}>CatClean member</p>
      </header>

      <section className={`${PORTAL_CARD_CLASS} divide-y divide-slate-100 overflow-hidden`}>
        <ProfileInfoRow icon={Phone} label="Phone" value={client?.phone ?? "—"} />
        <ProfileInfoRow icon={Mail} label="Email" value={client?.email ?? "—"} />
        <ProfileInfoRow icon={Globe} label="Language" value={client?.language ?? "English"} />
      </section>

      <section className={`${PORTAL_CARD_CLASS} overflow-hidden`}>
        <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Shortcuts
        </p>
        <ProfileLinkRow
          href="/app/client/addresses"
          icon={MapPin}
          label="Addresses"
        />
        <ProfileLinkRow
          href="/app/client/preferred-cleaner"
          icon={Heart}
          label="Preferred cleaner"
        />
      </section>

      <section className={`${PORTAL_CARD_CLASS} overflow-hidden lg:col-span-2`}>
        <p className="flex items-center gap-2 px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Bell className="h-3.5 w-3.5" aria-hidden />
          Notification settings
        </p>
        <p className="px-5 pb-2 text-xs text-slate-400">
          Read-only — notification preferences API coming soon.
        </p>
        <ToggleRow label="Email updates" enabled={client?.emailNotifications ?? true} />
        <ToggleRow label="SMS reminders" enabled={client?.smsNotifications ?? true} />
        <ToggleRow label="Push notifications" enabled={client?.pushNotifications ?? false} />
      </section>

      <button
        type="button"
        onClick={() => void handleLogout()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:col-span-2"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Logout
      </button>
    </div>
  );
}
