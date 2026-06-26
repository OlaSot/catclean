import Image from "next/image";
import Link from "next/link";
import type { PortalService } from "../lib/service-catalog";
import { PORTAL_CARD_CLASS } from "../lib/portal-styles";

type ServiceBookingCardProps = {
  service: PortalService;
};

export default function ServiceBookingCard({ service }: ServiceBookingCardProps) {
  return (
    <Link
      href={service.bookingHref}
      className={`${PORTAL_CARD_CLASS} group block overflow-hidden transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] lg:hover:-translate-y-0.5`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#EEF4FA] lg:aspect-[5/4]">
        <Image
          src={service.imageUrl}
          alt={service.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent transition group-hover:from-slate-900/65" />
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
          <h3 className="text-base font-semibold text-white lg:text-lg">
            {service.title}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-white/85 lg:text-sm">
            {service.subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}
