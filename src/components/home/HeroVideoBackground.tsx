"use client";

import { useCallback, useEffect, useRef } from "react";

type HeroVideoBackgroundProps = {
  src: string;
  poster: string;
};

/**
 * Mobile: dedicated top video band with focal point on the cat (object-position).
 * Desktop: full-bleed background behind the hero.
 */
export function HeroVideoBackground({ src, poster }: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const ensurePlaying = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    void video.play().then(() => {
      video.removeAttribute("poster");
    }).catch(() => {
      // Retried by load/visibility/gesture handlers.
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => ensurePlaying();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") ensurePlaying();
    };
    const unlockOnGesture = () => ensurePlaying();

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("canplaythrough", onReady);
    video.addEventListener("playing", onReady, { once: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onReady);
    document.addEventListener("touchstart", unlockOnGesture, { passive: true });
    document.addEventListener("click", unlockOnGesture);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) ensurePlaying();
      },
      { threshold: 0.01 },
    );
    observer.observe(video);

    video.load();
    ensurePlaying();

    const retryTimers = [150, 400, 900, 1800].map((delay) =>
      window.setTimeout(ensurePlaying, delay),
    );

    return () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("canplaythrough", onReady);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onReady);
      document.removeEventListener("touchstart", unlockOnGesture);
      document.removeEventListener("click", unlockOnGesture);
      observer.disconnect();
      retryTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [ensurePlaying, src]);

  return (
    <div
      className="pointer-events-none relative h-[32svh] min-h-[200px] max-h-[280px] w-full overflow-hidden sm:h-[34svh] sm:max-h-[300px] md:h-[36svh] md:max-h-[320px] lg:absolute lg:inset-0 lg:h-full lg:max-h-none"
      aria-hidden
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-[52%_28%] min-[390px]:object-[50%_30%] sm:object-[50%_32%] md:object-[50%_38%] lg:object-[50%_42%] xl:object-center"
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        {...(poster ? { poster } : {})}
      />

      {/* Mobile: frosted fade under the cat into the page background */}
      <div className="absolute inset-0 lg:hidden" aria-hidden>
        <div className="absolute inset-0 bg-linear-to-b from-white/25 via-transparent via-45% to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-linear-to-b from-transparent via-white/30 to-[#EEF2F7]/92 backdrop-blur-md backdrop-saturate-150" />
      </div>

      {/* Desktop: very subtle bottom fade only — no white wash */}
      <div className="absolute inset-0 hidden bg-linear-to-b from-transparent via-transparent to-black/15 lg:block" />
    </div>
  );
}
