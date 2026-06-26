import type { ReactNode } from "react";
import ClientAppLayout from "./ClientAppLayout";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <ClientAppLayout>{children}</ClientAppLayout>;
}
