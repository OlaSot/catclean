import { PublicI18nProvider } from "@/i18n/public/PublicI18nProvider";

export default function PublicSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PublicI18nProvider>{children}</PublicI18nProvider>;
}
