import Image from "next/image";
import Link from "next/link";
import { Headphones, MessageCircle } from "lucide-react";
import { PORTAL_CARD_CLASS } from "../lib/portal-styles";

type SupportCardProps = {
  compact?: boolean;
};

export default function SupportCard({ compact = false }: SupportCardProps) {
  if (compact) {
    return (
      <div className={`${PORTAL_CARD_CLASS} overflow-hidden`}>
        <div className="bg-gradient-to-br from-[#34597E] to-[#2d4d6f] p-5 text-white">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Headphones className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h3 className="text-base font-semibold">Need help?</h3>
              <p className="mt-1 text-sm text-white/85">
                Contact our concierge for rescheduling or special requests.
              </p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <a
            href="mailto:support@catclean.de"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#EEF4FA] px-4 py-2.5 text-sm font-semibold text-[#34597E] transition hover:bg-[#e3edf7]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Contact support
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`${PORTAL_CARD_CLASS} overflow-hidden`}>
      <div className="bg-gradient-to-br from-[#34597E] to-[#2d4d6f] p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Headphones className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Need help?</h3>
            <p className="mt-1 text-sm text-white/85">
              Our concierge team is here for rescheduling, special requests, or
              anything about your visit.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-5 sm:flex-row">
        <a
          href="mailto:support@catclean.de"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#EEF4FA] px-4 py-3 text-sm font-semibold text-[#34597E] transition hover:bg-[#e3edf7]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Message us
        </a>
        <Link
          href="/app/client/notifications"
          className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          View updates
        </Link>
      </div>
    </div>
  );
}
