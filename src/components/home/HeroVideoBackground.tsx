"use client";

type HeroVideoBackgroundProps = {
  src: string;
  poster: string;
};

/**
 * Mobile: dedicated top video band with focal point on the cat (object-position).
 * Desktop: full-bleed background behind the hero.
 */
export function HeroVideoBackground({ src, poster }: HeroVideoBackgroundProps) {
  return (
    <div
      className="pointer-events-none relative h-[36dvh] min-h-[210px] max-h-[300px] w-full overflow-hidden sm:h-[38dvh] sm:max-h-[320px] md:h-[40dvh] md:max-h-[360px] lg:absolute lg:inset-0 lg:h-full lg:max-h-none"
      aria-hidden
    >
      <video
        className="absolute inset-0 h-full w-full motion-fade-in object-cover object-[52%_28%] min-[390px]:object-[50%_30%] sm:object-[50%_32%] md:object-[50%_38%] lg:object-[50%_42%] xl:object-center"
        src={src}
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
      />

      {/* Mobile: light overlay + fade into content area below */}
      <div className="absolute inset-0 bg-linear-to-b from-white/25 via-transparent via-55% to-[#EEF2F7] lg:hidden" />

      {/* Desktop: very subtle bottom fade only — no white wash */}
      <div className="absolute inset-0 hidden bg-linear-to-b from-transparent via-transparent to-black/15 lg:block" />
    </div>
  );
}
