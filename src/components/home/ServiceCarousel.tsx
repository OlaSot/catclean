"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  Package,
  RefreshCw,
  Sofa,
  Sparkles,
  Square,
  type LucideIcon,
} from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";

export type HomeServiceId =
  | "home_reset"
  | "home_care"
  | "move_out"
  | "regular_cleaning"
  | "dry_cleaning"
  | "office_cleaning"
  | "window_cleaning";

type HomeService = {
  id: HomeServiceId;
  titleKey: string;
  subtitleKey: string;
  icon: LucideIcon;
  featured?: boolean;
};

const SERVICES: HomeService[] = [
  {
    id: "home_reset",
    titleKey: "public.home.service.homeReset.title",
    subtitleKey: "public.home.service.homeReset.subtitle",
    icon: HomeIcon,
    featured: true,
  },
  {
    id: "move_out",
    titleKey: "public.home.service.moveOut.title",
    subtitleKey: "public.home.service.moveOut.subtitle",
    icon: Package,
  },
  {
    id: "home_care",
    titleKey: "public.home.service.homeCare.title",
    subtitleKey: "public.home.service.homeCare.subtitle",
    icon: RefreshCw,
  },
  {
    id: "dry_cleaning",
    titleKey: "public.home.service.upholstery.title",
    subtitleKey: "public.home.service.upholstery.subtitle",
    icon: Sofa,
  },
  {
    id: "office_cleaning",
    titleKey: "public.home.service.office.title",
    subtitleKey: "public.home.service.office.subtitle",
    icon: Building2,
  },
  {
    id: "window_cleaning",
    titleKey: "public.home.service.window.title",
    subtitleKey: "public.home.service.window.subtitle",
    icon: Square,
  },
];

const SERVICE_BY_ID = Object.fromEntries(SERVICES.map((service) => [service.id, service])) as Record<
  HomeServiceId,
  HomeService
>;

/** Home Reset centered on the first carousel page. */
const PAGES: HomeService[][] = [
  ["move_out", "home_reset", "home_care"].map((id) => SERVICE_BY_ID[id as HomeServiceId]),
  ["dry_cleaning", "office_cleaning", "window_cleaning"].map(
    (id) => SERVICE_BY_ID[id as HomeServiceId]
  ),
];
const PAGE_COUNT = PAGES.length;
const SLIDE_WIDTH_PERCENT = 100 / PAGE_COUNT;

function getPageIndexForService(id: HomeServiceId): number {
  const index = PAGES.findIndex((page) => page.some((service) => service.id === id));
  return index >= 0 ? index : 0;
}

type Props = {
  selectedId: HomeServiceId;
  onSelect: (id: HomeServiceId) => void;
};

export function ServiceCarousel({ selectedId, onSelect }: Props) {
  const { t } = usePublicT();
  const [page, setPage] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goToPage = useCallback((next: number) => {
    setPage(Math.max(0, Math.min(PAGE_COUNT - 1, next)));
  }, []);

  useEffect(() => {
    const targetPage = getPageIndexForService(selectedId);
    setPage((current) => (current === targetPage ? current : targetPage));
  }, [selectedId]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX == null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const delta = endX - startX;
    if (Math.abs(delta) < 48) return;

    if (delta < 0) goToPage(page + 1);
    else goToPage(page - 1);
  };

  const trackOffsetPercent = page * SLIDE_WIDTH_PERCENT;

  return (
    <div className="relative mt-4 md:mt-5">
      <div
        className="w-full overflow-hidden py-3"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width: `${PAGE_COUNT * 100}%`,
            transform: `translateX(-${trackOffsetPercent}%)`,
          }}
        >
          {PAGES.map((pageServices, pageIndex) => (
            <div
              key={pageIndex}
              className="shrink-0"
              style={{ width: `${SLIDE_WIDTH_PERCENT}%` }}
            >
              <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                {pageServices.map((service) => {
                  const isSelected = selectedId === service.id;
                  const isFeatured = service.featured === true;

                  const cardClass = (() => {
                    if (isFeatured && isSelected) {
                      return "border-[#2d4d6f] bg-[#34597E] text-white shadow-[0_12px_36px_rgba(52,89,126,0.38)]";
                    }
                    if (isFeatured) {
                      return "border-[#34597E]/35 bg-white/98 text-slate-800 shadow-[0_8px_22px_rgba(52,89,126,0.14)] hover:border-[#34597E]/55 hover:shadow-[0_12px_28px_rgba(52,89,126,0.18)]";
                    }
                    if (isSelected) {
                      return "border-[#34597E] bg-[#f9fcff] shadow-[0_10px_24px_rgba(52,89,126,0.16)] ring-2 ring-[#34597E]/25";
                    }
                    return "border-slate-200/80 bg-white/94 shadow-[0_6px_16px_rgba(15,23,42,0.05)] hover:border-[#a9c2d9] hover:bg-[#f9fcff] hover:shadow-[0_10px_24px_rgba(52,89,126,0.12)]";
                  })();

                  return (
                    <div key={service.id} className="min-w-0 py-1.5">
                      <button
                        type="button"
                        onClick={() => onSelect(service.id)}
                        aria-pressed={isSelected}
                        className={`group relative flex min-h-[190px] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border px-6 py-5 text-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:min-h-[205px] sm:px-7 md:min-h-[220px] md:px-8 lg:min-h-[235px] ${cardClass}`}
                      >
                        {isSelected ? (
                          <span
                            className={`absolute top-4 right-4 inline-flex h-7 w-7 items-center justify-center rounded-full ${
                              isFeatured && isSelected
                                ? "bg-white text-[#34597E]"
                                : "bg-[#34597E] text-white"
                            }`}
                            aria-hidden
                          >
                            <Check className="h-4 w-4" strokeWidth={3} />
                          </span>
                        ) : null}

                        {isFeatured ? (
                          <span
                            className={`mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${
                              isSelected
                                ? "border-white/25 bg-white/15 text-white"
                                : "border-[#34597E]/20 bg-[#34597E]/8 text-[#34597E]"
                            }`}
                          >
                            <Sparkles className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                            {t("public.home.badge.signature")}
                          </span>
                        ) : null}

                        <service.icon
                          className={`mx-auto h-11 w-11 transition-all duration-300 group-hover:scale-[1.04] sm:h-12 sm:w-12 ${
                            isFeatured && isSelected
                              ? "text-white/95"
                              : "text-[#5B8DB8] group-hover:text-[#3f6f98]"
                          }`}
                        />
                        <h3
                          className={`mt-2 pr-8 text-[26px] leading-tight font-bold tracking-tight sm:text-[29px] ${
                            isFeatured && isSelected ? "text-white" : "text-slate-700"
                          }`}
                        >
                          {t(service.titleKey)}
                        </h3>
                        <p
                          className={`mt-2 text-sm leading-snug sm:text-base ${
                            isFeatured && isSelected ? "text-white/85" : "text-slate-500"
                          }`}
                        >
                          {t(service.subtitleKey)}
                        </p>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Previous services"
          onClick={() => goToPage(page - 1)}
          disabled={page === 0}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-sm transition hover:border-[#34597E] hover:text-[#34597E] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          {PAGES.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show services page ${index + 1}`}
              onClick={() => goToPage(index)}
              className={`h-2.5 rounded-full transition-all ${
                page === index ? "w-8 bg-[#34597E]" : "w-2.5 bg-slate-300"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Next services"
          onClick={() => goToPage(page + 1)}
          disabled={page === PAGE_COUNT - 1}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-sm transition hover:border-[#34597E] hover:text-[#34597E] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function getHomeServiceBookingHref(id: HomeServiceId): string {
  return `/booking?service=${id}`;
}

export function useHomeServiceCtaLabel(id: HomeServiceId): string {
  const { t } = usePublicT();
  if (id === "home_reset") return t("public.home.cta.homeReset");
  const service = SERVICES.find((s) => s.id === id);
  return service ? `${t("public.common.bookNow")} ${t(service.titleKey)} →` : `${t("public.home.cta.book")}`;
}
