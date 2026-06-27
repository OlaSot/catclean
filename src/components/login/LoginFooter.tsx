import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Support", href: "mailto:support@catclean.de" },
] as const;

export function LoginFooter() {
  return (
    <nav
      className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400 sm:mt-10"
      aria-label="Legal and support"
    >
      {FOOTER_LINKS.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="transition hover:text-[#34597E]"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
