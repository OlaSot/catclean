import type { ReactNode } from "react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
