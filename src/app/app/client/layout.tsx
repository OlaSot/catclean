import ClientPortalShell from "@/features/client-portal/components/ClientPortalShell";
import { ClientPortalProvider } from "@/features/client-portal/providers/ClientPortalProvider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientPortalProvider>
      <ClientPortalShell>{children}</ClientPortalShell>
    </ClientPortalProvider>
  );
}
