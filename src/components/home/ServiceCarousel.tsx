"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

const DESKTOP_SERVICES: HomeService[] = [
  SERVICE_BY_ID.move_out,
  SERVICE_BY_ID.home_reset,
  SERVICE_BY_ID.home_care,
  SERVICE_BY_ID.dry_cleaning,
  SERVICE_BY_ID.office_cleaning,
  SERVICE_BY_ID.window_cleaning,
];

const DESKTOP_BREAKPOINT = "(min-width: 768px)";

/** Avoid SSR/client layout mismatch — resolve compact mode after mount. */
function useCompactCarouselLayout() {
  const [compact, setCompact] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_BREAKPOINT);
    const update = () => setCompact(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return compact;
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
    if (isSelected) {
      return "border-[#34597E]/50 bg-[#34597E]/95 text-white shadow-[0_10px_32px_rgba(52,89,126,0.22)]";
    }
    if (isFeatured) {
      return "border-[#34597E]/20 bg-white/55 text-slate-800 shadow-[0_8px_28px_rgba(52,89,126,0.08)] hover:border-[#34597E]/30 hover:bg-white/70 hover:shadow-[0_10px_32px_rgba(52,89,126,0.12)]";
    }
    if (isSelected) {
      return "border-[#34597E]/35 bg-white/50 shadow-[0_8px_24px_rgba(52,89,126,0.1)] ring-1 ring-[#34597E]/15";
    }
    return "border-white/40 bg-white/40 shadow-[0_4px_18px_rgba(15,23,42,0.04)] hover:border-white/60 hover:bg-white/55 hover:shadow-[0_8px_24px_rgba(52,89,126,0.08)]";
  })();

  const sizeClass =
    layout === "strip"
      ? "min-h-[clamp(8.5rem,28vw,10.5rem)] w-full min-w-0 rounded-[20px] px-3 py-2.5 backdrop-blur-xl min-[420px]:px-4 min-[420px]:py-3 sm:px-4 sm:py-3.5"
      : `min-h-[clamp(8rem,26vw,10rem)] w-full min-w-0 rounded-[20px] px-3 py-2 backdrop-blur-xl min-[420px]:rounded-[22px] min-[420px]:px-3.5 min-[420px]:py-2.5 sm:px-4 sm:py-3 md:min-h-[9rem] md:px-4 md:py-3 lg:min-h-[9.5rem] lg:px-4 lg:py-3 xl:min-h-[8.25rem] xl:px-3 xl:py-2.5 2xl:min-h-[13.5rem] 2xl:px-7 2xl:py-4.5 ${
          isSelected ? "relative z-[2] scale-[1.04]" : "scale-100"
        }`;

  const wrapperClass =
    layout === "strip"
      ? "w-full shrink-0 snap-center"
      : `${isSelected ? "relative z-[2]" : "relative z-0"} min-w-0 py-2 sm:py-2.5`;

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        onClick={() => onSelect(service.id)}
        aria-pressed={isSelected}
        className={`group relative flex cursor-pointer flex-col items-center justify-center border text-center ease-[cubic-bezier(0.22,1,0.36,1)] ${
          layout === "grid" ? "transition-[transform,box-shadow,background-color,border-color,color] duration-500" : "transition-all duration-300"
        } ${sizeClass} ${cardClass}`}
      >
        {isSelected ? (
          <span
            className={`absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center rounded-full sm:top-2.5 sm:right-2.5 sm:h-6 sm:w-6 xl:top-2 xl:right-2 xl:h-5 xl:w-5 2xl:top-3 2xl:right-3 2xl:h-7 2xl:w-7 ${
              isSelected
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
            isSelected
              ? "text-white/95"
              : "text-[#5B8DB8] group-hover:text-[#3f6f98]"
          }`}
        />
        <h3
          className={`${HOME_SERVICE_CARD_TITLE_CLASS} ${isSelected ? "text-white" : "text-slate-700"}`}
        >
          {t(service.titleKey)}
        </h3>
        <p
          className={`${HOME_SERVICE_CARD_SUBTITLE_CLASS} ${
            isSelected ? "text-white/85" : "text-slate-500"
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
  const compact = useCompactCarouselLayout();

  if (compact === null) {
    return <div className="mt-2 h-[clamp(8.5rem,28vw,10.5rem)] min-w-0 sm:mt-2.5" aria-hidden />;
  }

  if (compact) {
    return <MobileServiceStrip selectedId={selectedId} onSelect={onSelect} />;
  }

  return <DesktopServiceStrip selectedId={selectedId} onSelect={onSelect} />;
}

const CAROUSEL_GAP_PX = 12;
const VISIBLE_CARDS = 3;
const SLIDE_DURATION_MS = 540;
const SLIDE_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const SERVICE_COUNT = DESKTOP_SERVICES.length;
const TRACK_SERVICES = [...DESKTOP_SERVICES, ...DESKTOP_SERVICES, ...DESKTOP_SERVICES];

function wrapServiceIndex(index: number) {
  return ((index % SERVICE_COUNT) + SERVICE_COUNT) % SERVICE_COUNT;
}

function nearestTrackIndex(current: number, targetServiceIndex: number) {
  const currentMod = wrapServiceIndex(current);
  const base = current - currentMod;
  let best = base + targetServiceIndex;
  for (const candidate of [best - SERVICE_COUNT, best, best + SERVICE_COUNT]) {
    if (Math.abs(candidate - current) < Math.abs(best - current)) {
      best = candidate;
    }
  }
  return best;
}

function DesktopServiceStrip({ selectedId, onSelect }: Props) {
  const { t } = usePublicT();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackIndexRef = useRef(SERVICE_COUNT + Math.max(0, DESKTOP_SERVICES.findIndex((service) => service.id === selectedId)));
  const dragStartX = useRef<number | null>(null);
  const dragDeltaRef = useRef(0);
  const draggingRef = useRef(false);
  const suppressClick = useRef(false);
  const lastWheelAt = useRef(0);
  const reduceMotionRef = useRef(false);

  const selectedIndex = Math.max(0, DESKTOP_SERVICES.findIndex((service) => service.id === selectedId));
  const [trackIndex, setTrackIndex] = useState(trackIndexRef.current);
  const [step, setStep] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);

  trackIndexRef.current = trackIndex;

  const serviceAt = (index: number) => DESKTOP_SERVICES[wrapServiceIndex(index)];

  const selectOffset = (offset: number) => {
    onSelect(serviceAt(selectedIndex + offset).id);
  };

  const jumpToMiddleCopy = useCallback((index: number) => {
    const normalized = SERVICE_COUNT + wrapServiceIndex(index);
    if (normalized === index) return;
    setEnableTransition(false);
    setTrackIndex(normalized);
  }, []);

  const endDrag = (delta: number) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    dragStartX.current = null;
    dragDeltaRef.current = 0;
    setDragX(0);
    setEnableTransition(true);

    if (step <= 0) return;
    const shift = Math.round(-delta / step) || (Math.abs(delta) >= 48 ? (delta < 0 ? 1 : -1) : 0);
    if (shift === 0) return;
    suppressClick.current = true;
    selectOffset(shift);
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduceMotionRef.current = media.matches;
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => {
      const styles = window.getComputedStyle(viewport);
      const width =
        viewport.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
      const cardWidth = (width - CAROUSEL_GAP_PX * (VISIBLE_CARDS - 1)) / VISIBLE_CARDS;
      setStep(cardWidth + CAROUSEL_GAP_PX);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    setTrackIndex((current) => {
      const next = nearestTrackIndex(current, selectedIndex);
      return next === current ? current : next;
    });
  }, [selectedIndex]);

  useLayoutEffect(() => {
    if (enableTransition || draggingRef.current) return;
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => {
        if (!draggingRef.current) setEnableTransition(true);
      });
    });
    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, [enableTransition, trackIndex]);

  useLayoutEffect(() => {
    if (trackIndex >= SERVICE_COUNT && trackIndex < SERVICE_COUNT * 2) return;
    if (draggingRef.current) return;
    const canAnimate = enableTransition && !reduceMotionRef.current && step > 0;
    if (canAnimate) return;
    jumpToMiddleCopy(trackIndex);
  }, [trackIndex, enableTransition, step, jumpToMiddleCopy]);

  const visualCenter = step > 0 ? trackIndex - Math.round(dragX / step) : trackIndex;
  const sizerServices = [serviceAt(selectedIndex - 1), serviceAt(selectedIndex), serviceAt(selectedIndex + 1)];

  return (
    <div className="relative mt-1.5 min-w-0 sm:mt-2 md:mt-2 lg:mt-2.5 xl:mt-1.5 2xl:mt-4">
      <div className="relative min-w-0 overflow-hidden">
        <div className="grid grid-cols-3 gap-3 px-3 py-2" aria-hidden>
          {sizerServices.map((service) => (
            <div key={`sizer-${service.id}`} className="invisible pointer-events-none">
              <ServiceCard service={service} isSelected={service.id === selectedId} onSelect={() => undefined} layout="grid" />
            </div>
          ))}
        </div>

        <div
          ref={viewportRef}
          className="absolute inset-0 min-w-0 touch-pan-y cursor-grab overflow-hidden px-3 py-2 select-none active:cursor-grabbing"
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            dragStartX.current = event.clientX;
            dragDeltaRef.current = 0;
            draggingRef.current = true;
            suppressClick.current = false;
            setEnableTransition(false);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (dragStartX.current === null) return;
            const delta = event.clientX - dragStartX.current;
            dragDeltaRef.current = delta;
            if (Math.abs(delta) > 8) suppressClick.current = true;
            setDragX(delta);
          }}
          onPointerUp={() => endDrag(dragDeltaRef.current)}
          onPointerCancel={() => endDrag(dragDeltaRef.current)}
          onWheel={(event) => {
            const horizontalDelta = event.shiftKey ? event.deltaY : event.deltaX;
            if (Math.abs(horizontalDelta) < 18) return;
            const now = Date.now();
            if (now - lastWheelAt.current < SLIDE_DURATION_MS * 0.55) return;
            lastWheelAt.current = now;
            selectOffset(horizontalDelta > 0 ? 1 : -1);
          }}
        >
          <div
            className="flex h-full flex-nowrap will-change-transform"
            style={{
              gap: CAROUSEL_GAP_PX,
              transform: step > 0 ? `translate3d(${-(trackIndex - 1) * step + dragX}px, 0, 0)` : undefined,
              transition:
                enableTransition && !draggingRef.current && !reduceMotionRef.current && step > 0
                  ? `transform ${SLIDE_DURATION_MS}ms ${SLIDE_EASING}`
                  : "none",
            }}
            onTransitionEnd={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.propertyName !== "transform") return;
              jumpToMiddleCopy(trackIndexRef.current);
            }}
          >
            {TRACK_SERVICES.map((service, index) => (
              <div
                key={`${service.id}-${index}`}
                className="min-w-0"
                style={{ flex: `0 0 ${step > 0 ? `${step - CAROUSEL_GAP_PX}px` : `calc((100% - ${CAROUSEL_GAP_PX * 2}px) / ${VISIBLE_CARDS})`}` }}
              >
                <ServiceCard
                  service={service}
                  isSelected={index === visualCenter}
                  onSelect={(id) => {
                    if (suppressClick.current) return;
                    onSelect(id);
                  }}
                  layout="grid"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-1 flex min-w-0 items-center justify-center gap-1.5 sm:mt-1.5 md:gap-2 xl:mt-1 xl:gap-1.5 2xl:mt-2 2xl:gap-3">
        <button
          type="button"
          aria-label={t("public.home.carousel.prev")}
          onClick={() => selectOffset(-1)}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-sm transition hover:border-[#34597E] hover:text-[#34597E] sm:h-8 sm:w-8 xl:h-7 xl:w-7 2xl:h-10 2xl:w-10"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 2xl:h-5 2xl:w-5" />
        </button>

        <div className="flex max-w-[min(100%,12rem)] flex-wrap items-center justify-center gap-1.5 sm:max-w-none sm:gap-2">
          {DESKTOP_SERVICES.map((service, index) => (
            <button
              key={service.id}
              type="button"
              aria-label={`${t("public.home.carousel.page")} ${index + 1}`}
              onClick={() => onSelect(service.id)}
              className={`h-1.5 rounded-full transition-all sm:h-2 xl:h-1.5 2xl:h-2.5 ${
                selectedIndex === index ? "w-5 bg-[#34597E] sm:w-6 xl:w-5 2xl:w-8" : "w-1.5 bg-slate-300 sm:w-2 xl:w-1.5 2xl:w-2.5"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label={t("public.home.carousel.next")}
          onClick={() => selectOffset(1)}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-sm transition hover:border-[#34597E] hover:text-[#34597E] sm:h-8 sm:w-8 xl:h-7 xl:w-7 2xl:h-10 2xl:w-10"
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
