import Link from "next/link";
import Image from "next/image";
import { Clock3, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { ServiceCarousel } from "@/components/home/ServiceCarousel";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "What we clean", href: "/what-we-clean" },
  { label: "Services", href: "#services" },
  { label: "About Us", href: "#about" },
  { label: "Contacts", href: "#contacts" },
];

const TRUST_BADGES = [
  { label: "Pet-friendly", icon: Sparkles },
  { label: "Reliable", icon: ShieldCheck },
  { label: "Fast & Easy", icon: Zap },
  { label: "Insured", icon: ShieldCheck },
];

export default function Home() {
  const heroVideo = "/videos/catclean-hero.mp4";
  const heroFallbackImage = "/images/catclean-hero-placeholder.jpg";

  return (
    <main className="min-h-screen bg-[#EEF2F7] text-slate-700">
      <section className="relative min-h-screen overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover motion-fade-in"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          poster={heroFallbackImage}
        />
        <div className="relative mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-4 py-4 sm:px-6 lg:px-10 xl:px-12">
          {/* TODO: later replace static video file with dynamic streaming video background setup. */}
          <header className="motion-reveal motion-delay-80 flex items-center justify-between gap-4 py-2">
          <div className="motion-float-soft flex items-center gap-2.5 sm:gap-3">
            <Image
              src="/logo_main.svg"
              alt="CatClean logo"
              width={190}
              height={56}
              className="h-10 w-auto sm:h-12 md:h-14"
              priority
            />
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 lg:flex">
            {NAV_LINKS.map((item) => (
              <a key={item.label} href={item.href} className="motion-hover-lift transition hover:text-[#34597E]">
                {item.label}
              </a>
            ))}
          </nav>

          <Link
            href="/booking"
            className="motion-cta-glow motion-hover-lift inline-flex items-center gap-2 rounded-full bg-[#34597E] px-3.5 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(52,89,126,0.35)] transition hover:bg-[#2d4d6f] sm:px-5 sm:text-sm"
          >
            <Clock3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Book Cleaning
          </Link>
          </header>

          <div className="mt-6 flex flex-1 flex-col justify-center pb-8 sm:mt-8 sm:pb-10">
            <div className="motion-reveal motion-delay-180 max-w-xl xl:max-w-2xl">
              <h1 className="text-4xl leading-tight font-semibold tracking-tight text-slate-800 sm:text-5xl lg:text-6xl xl:text-7xl">
              Spotless homes with
              <br />
              cat-like precision
              </h1>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-700 sm:text-xl xl:max-w-xl xl:text-2xl">
              Professional home reset service
              <br />
              for pet-friendly homes
              </p>
            </div>

            <section
              id="booking"
              className="motion-reveal motion-delay-260 mt-10 w-full rounded-3xl border border-white/80 bg-[linear-gradient(225deg,rgba(255,255,255,0.98)_8%,rgba(255,255,255,0.42)_46%,rgba(255,255,255,0.08)_66%,rgba(255,255,255,0)_82%)] p-4 shadow-[0_16px_45px_rgba(15,23,42,0.10)] backdrop-blur-md sm:mt-14 sm:p-6"
            >
              <h2 className="text-center text-2xl font-medium tracking-tight text-slate-700 sm:text-3xl">
              What do you need today?
              </h2>

              <div id="services">
                <ServiceCarousel />
              </div>

              <div className="mt-5 flex flex-col items-center">
                <Link
                  href="/booking?service=home_reset"
                    className="motion-cta-glow motion-hover-lift inline-flex w-full items-center justify-center rounded-full bg-[#34597E] px-7 py-3 text-xl font-medium text-white shadow-[0_10px_24px_rgba(52,89,126,0.32)] transition hover:bg-[#2d4d6f] sm:w-auto sm:text-2xl"
                >
                  Start your reset →
                </Link>
                <Link
                  href="/booking"
                  className="mt-3 text-base font-medium text-slate-500 transition hover:text-[#34597E] sm:text-lg"
                >
                  Or calculate price directly
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-3.5">
                {TRUST_BADGES.map((badge) => (
                  <span
                    key={badge.label}
                    className="motion-reveal motion-hover-lift inline-flex items-center gap-3 rounded-full border border-[#c9d8e8]/80 bg-linear-to-br from-white/98 via-[#eef5fb]/94 to-[#dce9f5]/88 px-6 py-2.5 text-base font-semibold text-slate-700 shadow-[0_10px_24px_rgba(52,89,126,0.14)] sm:px-7 sm:py-3 sm:text-lg"
                  >
                    <badge.icon className="h-4.5 w-4.5 text-[#5B8DB8] sm:h-5 sm:w-5" />
                    {badge.label}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
