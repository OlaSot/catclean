import ClientPortalShell from "@/features/client-portal/components/ClientPortalShell";
import { ClientPortalProvider } from "@/features/client-portal/providers/ClientPortalProvider";
import { PublicI18nProvider } from "@/i18n/public/PublicI18nProvider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicI18nProvider>
      <ClientPortalProvider>
        <ClientPortalShell>{children}</ClientPortalShell>
      </ClientPortalProvider>
    </PublicI18nProvider>
  );
}
