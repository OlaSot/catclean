"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
import {
  HOME_SERVICE_CARD_SUBTITLE_CLASS,
  HOME_SERVICE_CARD_TITLE_CLASS,
  HOME_SIGNATURE_BADGE_CLASS,
} from "./home-styles";

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

/** Home Reset centered on the first carousel page (desktop). */
const DESKTOP_PAGES: HomeService[][] = [
  ["move_out", "home_reset", "home_care"].map((id) => SERVICE_BY_ID[id as HomeServiceId]),
  ["dry_cleaning", "office_cleaning", "window_cleaning"].map(
    (id) => SERVICE_BY_ID[id as HomeServiceId]
  ),
];

const MOBILE_PAGES: HomeService[][] = SERVICES.map((service) => [service]);

const DESKTOP_BREAKPOINT = "(min-width: 768px)";

function subscribeCompactLayout(onStoreChange: () => void) {
  const media = window.matchMedia(DESKTOP_BREAKPOINT);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getCompactLayoutSnapshot() {
  return !window.matchMedia(DESKTOP_BREAKPOINT).matches;
}

function getCompactLayoutServerSnapshot() {
  return true;
}

function useCompactCarouselLayout() {
  return useSyncExternalStore(
    subscribeCompactLayout,
    getCompactLayoutSnapshot,
    getCompactLayoutServerSnapshot
  );
}

function getPages(compact: boolean): HomeService[][] {
  return compact ? MOBILE_PAGES : DESKTOP_PAGES;
}

function getPageIndexForService(id: HomeServiceId, pages: HomeService[][]): number {
  const index = pages.findIndex((page) => page.some((service) => service.id === id));
  return index >= 0 ? index : 0;
}

type ServiceCardProps = {
  service: HomeService;
  isSelected: boolean;
  onSelect: (id: HomeServiceId) => void;
  layout: "strip" | "grid";
};

function ServiceCard({ service, isSelected, onSelect, layout }: ServiceCardProps) {
  const { t } = usePublicT();
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

  const sizeClass =
    layout === "strip"
      ? "min-h-[clamp(8.5rem,28vw,10.5rem)] w-full min-w-0 rounded-xl px-3 py-2.5 min-[420px]:rounded-2xl min-[420px]:px-4 min-[420px]:py-3 sm:rounded-2xl sm:px-4 sm:py-3.5"
      : "min-h-[clamp(8.5rem,28vw,10.5rem)] w-full min-w-0 rounded-xl px-3 py-2.5 min-[420px]:rounded-2xl min-[420px]:px-4 min-[420px]:py-3 sm:rounded-2xl sm:px-4 sm:py-3.5 md:min-h-[9.5rem] md:rounded-2xl md:px-4 md:py-3.5 lg:min-h-[10.5rem] lg:px-5 xl:min-h-[8.75rem] xl:rounded-xl xl:px-3 xl:py-2.5 2xl:min-h-[14.75rem] 2xl:rounded-3xl 2xl:px-8 2xl:py-5";

  const wrapperClass = layout === "strip" ? "w-full shrink-0 snap-center" : "min-w-0 py-0.5 sm:py-1 xl:py-0.5";

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        onClick={() => onSelect(service.id)}
        aria-pressed={isSelected}
        className={`group relative flex cursor-pointer flex-col items-center justify-center border text-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${sizeClass} ${cardClass}`}
      >
        {isSelected ? (
          <span
            className={`absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center rounded-full sm:top-2.5 sm:right-2.5 sm:h-6 sm:w-6 xl:top-2 xl:right-2 xl:h-5 xl:w-5 2xl:top-3 2xl:right-3 2xl:h-7 2xl:w-7 ${
              isFeatured && isSelected
                ? "bg-white text-[#34597E]"
                : "bg-[#34597E] text-white"
            }`}
            aria-hidden
          >
            <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 2xl:h-4 2xl:w-4" strokeWidth={3} />
          </span>
        ) : null}

        {isFeatured ? (
          <span
            className={`${HOME_SIGNATURE_BADGE_CLASS} ${
              isSelected
                ? "border-white/25 bg-white/15 text-white"
                : "border-[#34597E]/20 bg-[#34597E]/8 text-[#34597E]"
            }`}
          >
            <Sparkles className="h-2 w-2 shrink-0 sm:h-2.5 sm:w-2.5 xl:h-2 xl:w-2 2xl:h-3 2xl:w-3" strokeWidth={2} aria-hidden />
            <span className="text-balance">{t("public.home.badge.signature")}</span>
          </span>
        ) : null}

        <service.icon
          className={`mx-auto h-7 w-7 transition-all duration-300 group-hover:scale-[1.04] min-[420px]:h-8 min-[420px]:w-8 sm:h-9 sm:w-9 md:h-9 md:w-9 lg:h-10 lg:w-10 xl:h-7 xl:w-7 2xl:h-12 2xl:w-12 ${
            isFeatured && isSelected
              ? "text-white/95"
              : "text-[#5B8DB8] group-hover:text-[#3f6f98]"
          }`}
        />
        <h3
          className={`${HOME_SERVICE_CARD_TITLE_CLASS} ${isFeatured && isSelected ? "text-white" : "text-slate-700"}`}
        >
          {t(service.titleKey)}
        </h3>
        <p
          className={`${HOME_SERVICE_CARD_SUBTITLE_CLASS} ${
            isFeatured && isSelected ? "text-white/85" : "text-slate-500"
          }`}
        >
          {t(service.subtitleKey)}
        </p>
      </button>
    </div>
  );
}

type Props = {
  selectedId: HomeServiceId;
  onSelect: (id: HomeServiceId) => void;
};

function MobileServiceStrip({ selectedId, onSelect }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Partial<Record<HomeServiceId, HTMLDivElement>>>({});
  const scrollRaf = useRef<number | null>(null);
  const isScrollingToSelection = useRef(false);

  const scrollCardToCenter = useCallback((id: HomeServiceId, behavior: ScrollBehavior = "smooth") => {
    const strip = stripRef.current;
    const card = cardRefs.current[id];
    if (!strip || !card) return;

    const targetLeft = card.offsetLeft - (strip.clientWidth - card.offsetWidth) / 2;
    isScrollingToSelection.current = true;
    strip.scrollTo({ left: targetLeft, behavior });
    window.setTimeout(() => {
      isScrollingToSelection.current = false;
    }, behavior === "smooth" ? 420 : 0);
  }, []);

  useEffect(() => {
    scrollCardToCenter(selectedId, "instant");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- initial center only

  const syncSelectionToScroll = useCallback(() => {
    const strip = stripRef.current;
    if (!strip || isScrollingToSelection.current) return;

    const stripCenter = strip.scrollLeft + strip.clientWidth / 2;
    let closestId: HomeServiceId | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const service of SERVICES) {
      const card = cardRefs.current[service.id];
      if (!card) continue;

      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(stripCenter - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = service.id;
      }
    }

    if (closestId && closestId !== selectedId) {
      onSelect(closestId);
    }
  }, [onSelect, selectedId]);

  const handleScroll = () => {
    if (scrollRaf.current != null) return;
    scrollRaf.current = window.requestAnimationFrame(() => {
      scrollRaf.current = null;
      syncSelectionToScroll();
    });
  };

  return (
    <div className="relative mt-2 min-w-0 sm:mt-2.5">
      <div
        ref={stripRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto overscroll-x-contain px-[5%] py-1.5 scroll-px-[5%] [scrollbar-width:none] snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
      >
        {SERVICES.map((service) => (
          <div
            key={service.id}
            ref={(node) => {
              if (node) cardRefs.current[service.id] = node;
              else delete cardRefs.current[service.id];
            }}
            className="w-[90%] shrink-0 snap-center"
          >
            <ServiceCard
              service={service}
              isSelected={selectedId === service.id}
              onSelect={(id) => {
                onSelect(id);
                scrollCardToCenter(id);
              }}
              layout="strip"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ServiceCarousel({ selectedId, onSelect }: Props) {
  const { t } = usePublicT();
  const compact = useCompactCarouselLayout();
  const [page, setPage] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const pages = getPages(compact);
  const pageCount = pages.length;
  const slideWidthPercent = 100 / pageCount;

  const goToPage = useCallback(
    (next: number) => {
      setPage(Math.max(0, Math.min(pageCount - 1, next)));
    },
    [pageCount]
  );

  useEffect(() => {
    const targetPage = getPageIndexForService(selectedId, pages);
    setPage((current) => (current === targetPage ? current : targetPage));
  }, [selectedId, pages]);

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

  const trackOffsetPercent = page * slideWidthPercent;

  if (compact) {
    return <MobileServiceStrip selectedId={selectedId} onSelect={onSelect} />;
  }

  return (
    <div className="relative mt-2 min-w-0 sm:mt-2.5 md:mt-3 lg:mt-4 xl:mt-2 2xl:mt-5">
      <div
        className="w-full overflow-hidden py-1.5 sm:py-2 md:py-2.5 xl:py-1.5 2xl:py-3"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width: `${pageCount * 100}%`,
            transform: `translateX(-${trackOffsetPercent}%)`,
          }}
        >
          {pages.map((pageServices, pageIndex) => (
            <div
              key={pageIndex}
              className="shrink-0"
              style={{ width: `${slideWidthPercent}%` }}
            >
              <div className="grid min-w-0 grid-cols-1 gap-2 min-[420px]:gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-2.5 lg:gap-3 xl:gap-2 2xl:gap-4">
                {pageServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={selectedId === service.id}
                    onSelect={onSelect}
                    layout="grid"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-1.5 flex min-w-0 items-center justify-center gap-2 sm:mt-2 md:gap-3 xl:mt-1.5 xl:gap-2 2xl:mt-3 2xl:gap-4">
        <button
          type="button"
          aria-label={t("public.home.carousel.prev")}
          onClick={() => goToPage(page - 1)}
          disabled={page === 0}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-sm transition hover:border-[#34597E] hover:text-[#34597E] disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8 xl:h-7 xl:w-7 2xl:h-10 2xl:w-10"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 2xl:h-5 2xl:w-5" />
        </button>

        <div className="flex max-w-[min(100%,12rem)] flex-wrap items-center justify-center gap-1.5 sm:max-w-none sm:gap-2">
          {pages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`${t("public.home.carousel.page")} ${index + 1}`}
              onClick={() => goToPage(index)}
              className={`h-1.5 rounded-full transition-all sm:h-2 xl:h-1.5 2xl:h-2.5 ${
                page === index ? "w-5 bg-[#34597E] sm:w-6 xl:w-5 2xl:w-8" : "w-1.5 bg-slate-300 sm:w-2 xl:w-1.5 2xl:w-2.5"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label={t("public.home.carousel.next")}
          onClick={() => goToPage(page + 1)}
          disabled={page === pageCount - 1}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-sm transition hover:border-[#34597E] hover:text-[#34597E] disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8 xl:h-7 xl:w-7 2xl:h-10 2xl:w-10"
        >
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 2xl:h-5 2xl:w-5" />
        </button>
      </div>
    </div>
  );
}

export function getHomeServiceBookingHref(id: HomeServiceId): string {
  if (id === "dry_cleaning") return "/booking?service=upholstery";
  if (id === "regular_cleaning") return "/booking?service=home_care";
  if (id === "office_cleaning") return "/booking?service=office_cleaning";
  return `/booking?service=${id}`;
}

export function useHomeServiceCtaLabel(id: HomeServiceId): string {
  const { t } = usePublicT();
  if (id === "home_reset") return t("public.home.cta.homeReset");
  const service = SERVICES.find((s) => s.id === id);
  return service ? `${t("public.common.bookNow")} ${t(service.titleKey)} →` : `${t("public.home.cta.book")}`;
}
