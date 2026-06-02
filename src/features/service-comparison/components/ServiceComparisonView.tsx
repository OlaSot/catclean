"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState, type ComponentType } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BrushCleaning,
  CalendarDays,
  Check,
  CircleAlert,
  Droplets,
  Heart,
  Home,
  Package,
  PawPrint,
  RefreshCw,
  Refrigerator,
  ShieldCheck,
  Sparkle,
  TimerReset,
  UserRoundCheck,
  WashingMachineIcon,
  Wind,
  XCircle,
} from "lucide-react";
import { SERVICE_IDS, SERVICE_PROFILES } from "../service-comparison.data";
import type { ServiceId } from "../service-comparison.types";
import { CleaningAreaCard } from "./CleaningAreaCard";
import { ServiceComparisonTable } from "./ServiceComparisonTable";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "What we clean", href: "/what-we-clean" },
  { label: "Services", href: "/#services" },
  { label: "About Us", href: "/#about" },
  { label: "Contacts", href: "/#contacts" },
];

const SERVICE_TAB_META: Record<ServiceId, { icon: ComponentType<{ className?: string }> }> = {
  home_reset: { icon: Home },
  move_out: { icon: Package },
  regular_cleaning: { icon: RefreshCw },
};

const NOT_INCLUDED = [
  { title: "Post renovation cleaning", icon: XCircle },
  { title: "Mold removal", icon: CircleAlert },
  { title: "Exterior windows, high or hard to reach", icon: XCircle },
  { title: "Hazardous waste removal", icon: CircleAlert },
];

const HOW_IT_WORKS = [
  {
    title: "Book online",
    description: "Pick your service, date and time in a few clicks.",
    icon: CalendarDays,
  },
  {
    title: "Cleaner assigned",
    description: "We match you with the best available cleaner.",
    icon: UserRoundCheck,
  },
  {
    title: "We clean your home",
    description: "Your cleaner follows the checklist for your chosen service.",
    icon: Home,
  },
  {
    title: "You relax",
    description: "Enjoy your clean home. We're here if you need anything.",
    icon: Heart,
  },
];

const TRUST_BADGES = [
  { title: "Trusted cleaners", description: "Background checked & rated", icon: BadgeCheck },
  { title: "Insured service", description: "Your home is in safe hands", icon: ShieldCheck },
  { title: "Easy rescheduling", description: "Change or cancel anytime", icon: TimerReset },
  { title: "Support", description: "We're here for you 7 days a week", icon: Heart },
];

const ADD_ON_ICONS = [
  BrushCleaning,
  Refrigerator,
  Wind,
  Sparkle,
  Home,
  Droplets,
  PawPrint,
] as const;

type Props = {
  initialServiceId?: ServiceId;
};

export function ServiceComparisonView({ initialServiceId = "home_reset" }: Props) {
  const [activeId, setActiveId] = useState<ServiceId>(initialServiceId);
  const profile = SERVICE_PROFILES[activeId];

  const handleSelect = useCallback((id: ServiceId) => {
    setActiveId(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("service", id);
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  const bookingHref = useMemo(() => `/booking?service=${activeId}`, [activeId]);

  return (
    <main className="min-h-screen bg-[#F6F8FB] text-slate-700">
      <div className="mx-auto w-full max-w-[1220px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 py-3">
          <Link href="/">
            <Image
              src="/logo_main.svg"
              alt="CatClean logo"
              width={190}
              height={56}
              className="h-10 w-auto sm:h-12"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 lg:flex">
            {NAV_LINKS.map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:text-[#34597E]">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href={bookingHref}
            className="inline-flex items-center gap-2 rounded-full bg-[#34597E] px-3.5 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(52,89,126,0.35)] transition hover:bg-[#2d4d6f] sm:px-5 sm:text-sm"
          >
            Book now
          </Link>
        </header>

        <section className="mt-6">
          <div className="text-center lg:text-left">
            <span className="inline-flex rounded-full border border-[#c9d8e8] bg-white/90 px-4 py-1.5 text-sm font-semibold text-[#34597E]">
              Compare services
            </span>
            <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-slate-800 sm:text-5xl">
              What&apos;s included in each cleaning
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600 lg:mx-0">
              Choose a service to see its checklist, included items and add-ons — then compare all three side by side.
            </p>
          </div>

          <div
            className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
            role="tablist"
            aria-label="Cleaning services"
          >
            {SERVICE_IDS.map((id) => {
              const item = SERVICE_PROFILES[id];
              const TabIcon = SERVICE_TAB_META[id].icon;
              const selected = id === activeId;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => handleSelect(id)}
                  className={`rounded-3xl border p-5 text-left transition ${
                    selected
                      ? "border-[#34597E] bg-[#34597E] text-white shadow-[0_14px_32px_rgba(52,89,126,0.28)]"
                      : "border-[#dce8f3] bg-white/95 text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:border-[#a9c2d9]"
                  }`}
                >
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                      selected ? "bg-white/20 text-white" : "bg-[#eef4fb] text-[#5B8DB8]"
                    }`}
                  >
                    <TabIcon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-xl font-semibold tracking-tight">{item.title}</p>
                  <p className={`mt-1 text-sm ${selected ? "text-white/85" : "text-slate-500"}`}>{item.tagline}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section
          key={activeId}
          className="motion-fade-in mt-10 overflow-hidden rounded-4xl border border-white/85 bg-[linear-gradient(140deg,#ffffff_10%,#eef5fc_62%,#e5eef8_100%)] p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] sm:p-8"
          role="tabpanel"
          aria-label={profile.title}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#5f89b1]">{profile.title}</p>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">{profile.shortDescription}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={bookingHref}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#34597E] px-6 py-3 text-base font-semibold text-white shadow-[0_10px_24px_rgba(52,89,126,0.30)] transition hover:bg-[#2d4d6f] sm:w-auto"
                >
                  Book {profile.title}
                </Link>
                <a
                  href="#add-ons"
                  className="inline-flex w-full items-center justify-center rounded-full border border-[#cdddec] bg-white px-6 py-3 text-base font-semibold text-[#34597E] transition hover:border-[#a9c2d9] hover:bg-[#f8fbff] sm:w-auto"
                >
                  View add-ons
                </a>
              </div>
            </div>
            <span className="inline-flex w-fit rounded-full border border-[#c9d8e8] bg-white/90 px-4 py-2 text-sm font-medium text-[#34597E]">
              Selected service
            </span>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-800">
            Checklist for {profile.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">Room-by-room scope for this service.</p>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {profile.cleaningAreas.map((area) => (
              <CleaningAreaCard key={`${activeId}-${area.key}`} area={area} serviceId={activeId} />
            ))}
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-[#dfe9f3] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Included with {profile.title}</h2>
            <p className="mt-2 text-sm text-slate-500">Core items covered in every visit of this service type.</p>
            <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              {profile.included.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 rounded-2xl border border-[#e7eff7] bg-[#fafdff] px-3 py-2.5 text-sm text-slate-600"
                >
                  <Check className="h-4 w-4 shrink-0 text-[#6B96BC]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#e5edf5] bg-[linear-gradient(145deg,#fafdff_20%,#edf4fb_100%)] p-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#5B8DB8] shadow-sm">
                <WashingMachineIcon className="h-5 w-5" />
              </span>
              <p className="text-sm leading-relaxed text-slate-600">
                Need something else? Add extras during booking or switch to a deeper service above.
              </p>
            </div>
          </article>

          <article
            id="add-ons"
            className="rounded-3xl border border-[#dfe9f3] bg-[linear-gradient(150deg,#ffffff_6%,#f2f7fc_72%,#eaf2f9_100%)] p-7 shadow-[0_14px_36px_rgba(15,23,42,0.07)]"
          >
            <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Add-ons for {profile.title}</h2>
            <p className="mt-2 text-sm text-slate-500">Popular extras clients add for this service.</p>
            <ul className="mt-5 space-y-3">
              {profile.addOns.map((item, index) => {
                const Icon = ADD_ON_ICONS[index % ADD_ON_ICONS.length];
                return (
                  <li key={item.title} className="rounded-2xl border border-[#e6edf6] bg-white/90 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef4fb] text-[#5f89b1]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.description}</p>
                        </div>
                      </div>
                      <span className="inline-flex shrink-0 rounded-full border border-[#d9e7f4] bg-white px-2.5 py-1 text-xs font-semibold text-[#34597E]">
                        {item.price}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link
              href={bookingHref}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#34597E] transition hover:text-[#274864]"
            >
              Add during booking
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </section>

        <section className="mt-12">
          <ServiceComparisonTable activeServiceId={activeId} />
        </section>

        <section className="mt-12 rounded-3xl border border-[#e7d6dc] bg-[linear-gradient(145deg,#fffafb_5%,#fff4f6_100%)] p-7 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Not included in any standard package</h2>
          <p className="mt-2 text-sm text-slate-500">
            These require specialist equipment, safety protocols or a separate quote.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {NOT_INCLUDED.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#f0dfe4] bg-white/90 p-4 text-center">
                <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0f3] text-[#be6a7a]">
                  <item.icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm leading-snug text-slate-600">{item.title}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-[#dfe9f4] bg-white/95 p-7 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-800">How it works</h2>
          <div className="relative mt-8 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="pointer-events-none absolute top-5 right-[8%] left-[8%] hidden border-t-2 border-dashed border-[#d4e2ef] lg:block" />
            {HOW_IT_WORKS.map((step, index) => (
              <article key={step.title} className="relative rounded-2xl border border-[#e6edf6] bg-[#fbfdff] p-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e5f2] bg-white text-sm font-semibold text-[#34597E] shadow-sm">
                  {index + 1}
                </span>
                <div className="mt-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#edf3fa] text-[#6b96bc] shadow-sm">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-[#d8e6f3] bg-[linear-gradient(145deg,#f8fbff_8%,#edf5fc_70%,#e6f0fa_100%)] p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_BADGES.map((badge) => (
              <article
                key={badge.title}
                className="rounded-3xl border border-[#dbe7f2] bg-white/88 p-5 shadow-[0_10px_28px_rgba(52,89,126,0.10)]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6b96bc]">
                  <badge.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-base font-semibold text-slate-800">{badge.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{badge.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 mb-8 rounded-4xl border border-[#dbe7f2] bg-[linear-gradient(140deg,#ffffff_8%,#edf4fb_62%,#e5eef8_100%)] p-8 text-center shadow-[0_20px_44px_rgba(52,89,126,0.12)] sm:p-12">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">Ready to book {profile.title}?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
            You&apos;ve compared the options — continue with {profile.title} and get an instant estimate.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={bookingHref}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#34597E] px-7 py-3 text-base font-semibold text-white shadow-[0_10px_24px_rgba(52,89,126,0.32)] transition hover:bg-[#2d4d6f] sm:w-auto"
            >
              Book {profile.title}
            </Link>
            <Link
              href={`/booking?service=${activeId}#pricing`}
              className="inline-flex w-full items-center justify-center rounded-full border border-[#cdddec] bg-white px-7 py-3 text-base font-semibold text-[#34597E] transition hover:border-[#a9c2d9] hover:bg-[#f7fbff] sm:w-auto"
            >
              Calculate price
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
