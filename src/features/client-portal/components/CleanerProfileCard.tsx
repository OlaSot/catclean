import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { PortalPreferredCleaner } from "../types/portal.types";
import { PORTAL_CARD_CLASS } from "../lib/portal-styles";
import PortalPrimaryButton from "./PortalPrimaryButton";

type CleanerProfileCardProps = {
  cleaner: PortalPreferredCleaner;
  variant?: "compact" | "hero";
};

function CleanerAvatar({
  name,
  avatarUrl,
  sizes,
  className,
}: {
  name: string;
  avatarUrl: string | null;
  sizes: string;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        fill
        className={`object-cover ${className ?? ""}`}
        sizes={sizes}
      />
    );
  }

  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#EEF4FA] text-lg font-semibold text-[#34597E] ${className ?? ""}`}>
      {name[0] ?? "?"}
    </div>
  );
}

export default function CleanerProfileCard({
  cleaner,
  variant = "hero",
}: CleanerProfileCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href="/app/client/preferred-cleaner"
        className={`${PORTAL_CARD_CLASS} flex items-center gap-4 p-4 transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)]`}
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#EEF4FA]">
          <CleanerAvatar name={cleaner.name} avatarUrl={cleaner.avatarUrl} sizes="56px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Your cleaner
          </p>
          <p className="font-semibold text-slate-800">{cleaner.name}</p>
        </div>
        <span className="text-sm font-medium text-[#34597E]">View</span>
      </Link>
    );
  }

  return (
    <div className={`${PORTAL_CARD_CLASS} overflow-hidden`}>
      <div className="relative aspect-[4/3] bg-[#EEF4FA]">
        <CleanerAvatar
          name={cleaner.name}
          avatarUrl={cleaner.avatarUrl}
          sizes="(max-width: 640px) 100vw, 480px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-2xl font-semibold text-white">{cleaner.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/90">
            <span>{cleaner.completedOrders} visits completed</span>
            {cleaner.averageRating !== null ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                {cleaner.averageRating.toFixed(1)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <p className="text-sm leading-relaxed text-slate-600">{cleaner.bio}</p>
        <PortalPrimaryButton href="/booking?service=home_reset">
          Book Again
        </PortalPrimaryButton>
      </div>
    </div>
  );
}
