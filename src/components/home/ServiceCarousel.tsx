"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  Package,
  RefreshCw,
  Shirt,
  Square,
  type LucideIcon,
} from "lucide-react";

export type HomeServiceId =
  | "home_reset"
  | "move_out"
  | "regular_cleaning"
  | "dry_cleaning"
  | "office_cleaning"
  | "window_cleaning";

type HomeService = {
  id: HomeServiceId;
  title: string;
  subtitle: string;
  icon: LucideIcon;
};

const SERVICES: HomeService[] = [
  {
    id: "home_reset",
    title: "Home Reset",
    subtitle: "Deep apartment refresh",
    icon: HomeIcon,
  },
  {
    id: "move_out",
    title: "Move Out Cleaning",
    subtitle: "Deposit-safe cleaning",
    icon: Package,
  },
  {
    id: "regular_cleaning",
    title: "Regular Cleaning",
    subtitle: "Weekly or bi-weekly care",
    icon: RefreshCw,
  },
  {
    id: "dry_cleaning",
    title: "Dry Cleaning",
    subtitle: "Furniture & textile care",
    icon: Shirt,
  },
  {
    id: "office_cleaning",
    title: "Office Cleaning",
    subtitle: "Professional workspace care",
    icon: Building2,
  },
  {
    id: "window_cleaning",
    title: "Window Cleaning",
    subtitle: "Crystal-clear glass",
    icon: Square,
  },
];

const PAGES = [SERVICES.slice(0, 3), SERVICES.slice(3, 6)];

export function ServiceCarousel() {
  const [page, setPage] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goToPage = useCallback((next: number) => {
    setPage(Math.max(0, Math.min(PAGES.length - 1, next)));
  }, []);

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

  return (
    <div className="relative mt-6 md:mt-7">
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {PAGES.map((pageServices, pageIndex) => (
            <div
              key={pageIndex}
              className="w-full shrink-0 grow-0 basis-full px-1 sm:px-2 md:px-4"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
                {pageServices.map((service) => (
                  <Link
                    key={service.id}
                    href={`/booking?service=${service.id}`}
                    className="group motion-hover-lift flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/94 px-7 py-5 text-center shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#a9c2d9] hover:bg-[#f9fcff] hover:shadow-[0_12px_26px_rgba(52,89,126,0.14)] sm:min-h-[205px] sm:px-8 sm:py-6 md:min-h-[220px] md:px-6 lg:min-h-[235px]"
                  >
                    <service.icon className="mx-auto h-11 w-11 text-[#5B8DB8] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:text-[#3f6f98] sm:h-12 sm:w-12" />
                    <h3 className="mt-3 text-[26px] leading-tight font-bold tracking-tight text-slate-700 sm:text-[29px]">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-base text-slate-500 sm:text-lg">{service.subtitle}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
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
          disabled={page === PAGES.length - 1}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-sm transition hover:border-[#34597E] hover:text-[#34597E] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
