"use client";

import Image from "next/image";
import { BadgeCheck, Headphones, Heart, Leaf, ShieldCheck } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";

const DEFAULT_IMAGE = "/wizard/step-2.png";

type VisualKey = "insured" | "petFriendly" | "eco" | "satisfaction";

const OVERLAY_ITEMS: Array<{ key: VisualKey; icon: typeof ShieldCheck }> = [
  { key: "insured", icon: ShieldCheck },
  { key: "petFriendly", icon: Heart },
  { key: "eco", icon: Leaf },
  { key: "satisfaction", icon: BadgeCheck },
] as const;

type Props = {
  imageSrc?: string;
  imageAlt?: string;
};

export function BookingVisualPanel({
  imageSrc = DEFAULT_IMAGE,
  imageAlt,
}: Props) {
  const { t } = usePublicT();
  const alt = imageAlt ?? t("public.checkout.visual.imageAlt");

  return (
    <aside className="space-y-5 lg:sticky lg:top-6">
      <div className="relative overflow-hidden rounded-3xl shadow-[0_24px_64px_rgba(15,23,42,0.14)]">
        <div className="relative aspect-[4/5] min-h-[320px] w-full sm:aspect-[5/6]">
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 42vw"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-slate-900/10"
            aria-hidden
          />
          <ul className="absolute inset-x-0 bottom-0 space-y-2.5 p-5 sm:p-6">
            {OVERLAY_ITEMS.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="flex items-center gap-2.5 text-sm font-medium text-white/95"
              >
                <Icon className="h-4 w-4 shrink-0 text-white/90" strokeWidth={2.25} aria-hidden />
                {t(`public.checkout.visual.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="checkout-card-hover rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#34597E]/10 text-[#34597E]">
            <Headphones className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {t("public.checkout.help.title")}
            </p>
            <p className="mt-1 text-sm font-medium text-[#34597E]">
              {t("public.checkout.help.chat")}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {t("public.checkout.help.response")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
