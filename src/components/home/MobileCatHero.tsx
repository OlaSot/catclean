"use client";

import { type ReactNode } from "react";
import { useHeroVideo } from "./useHeroVideo";

type MobileCatHeroProps = {
  src: string;
  poster?: string;
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Mobile mascot hero — cat face on the right, copy on the lower left.
 */
export function MobileCatHero({
  src,
  poster = "",
  header,
  children,
  footer,
}: MobileCatHeroProps) {
  const { videoRef } = useHeroVideo(src);

  return (
    <section
      className="relative w-full shrink-0 overflow-hidden bg-[#F4F7FB]"
      style={{ height: "clamp(280px, 40dvh, 360px)" }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full scale-[1.04] object-cover object-[62%_22%]"
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        {...(poster ? { poster } : {})}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.08) 34%, rgba(244,247,251,0.02) 55%, rgba(238,242,247,0.45) 86%, #EEF2F7 100%), linear-gradient(90deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.28) 42%, transparent 68%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="shrink-0 px-5 pt-[max(0.5rem,env(safe-area-inset-top))]">{header}</div>

        <div className="relative mt-auto px-5 pb-4">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-[#EEF2F7] via-[#EEF2F7]/70 to-transparent"
            aria-hidden
          />
          <div className="relative max-w-[78%] space-y-2 pt-1">{children}</div>
          {footer ? <div className="relative mt-4 max-w-[78%]">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}
