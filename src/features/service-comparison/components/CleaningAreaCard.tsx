import Link from "next/link";
import { ArrowRight, Check, ShowerHead, Soup, Sparkles, Sofa } from "lucide-react";
import type { CleaningArea, ServiceId } from "../service-comparison.types";

const AREA_ICONS = {
  kitchen: Soup,
  bathroom: ShowerHead,
  living: Sofa,
} as const;

type Props = {
  area: CleaningArea;
  serviceId: ServiceId;
};

export function CleaningAreaCard({ area, serviceId }: Props) {
  const Icon = AREA_ICONS[area.key];

  return (
    <article className="group rounded-3xl border border-[#dce8f3] bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(52,89,126,0.14)]">
      <div className={`relative h-52 overflow-hidden rounded-2xl bg-linear-to-br ${area.visualAccent}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.85),transparent_46%)]" />
        <div className="absolute top-4 left-4 rounded-full border border-white/85 bg-white/80 px-3 py-1 text-xs font-semibold text-[#456889]">
          {area.visualLabel}
        </div>
        <div className="absolute right-6 bottom-6 h-20 w-20 rounded-full bg-white/80 shadow-[0_12px_24px_rgba(52,89,126,0.16)]" />
        <span className="absolute top-5 right-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#d9e8f5] bg-white text-[#5B8DB8] shadow-sm">
          <Icon className="h-6 w-6" />
        </span>
      </div>
      <div className="-mt-5 flex justify-start px-2">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8e4f0] bg-white text-[#5B8DB8] shadow-[0_8px_20px_rgba(52,89,126,0.12)]">
          <Sparkles className="h-5 w-5" />
        </span>
      </div>
      <div className="px-2 pb-2">
        <h3 className="text-[1.65rem] leading-tight font-semibold tracking-tight text-slate-800">{area.title}</h3>
        <ul className="mt-4 space-y-2.5 text-[15px]">
          {area.items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-slate-600">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#628cb4]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link
          href={`/booking?service=${serviceId}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#34597E] transition hover:text-[#274864]"
        >
          {area.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
