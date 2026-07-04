"use client";

import type { ReactNode } from "react";
import { ViewportFit } from "@/components/layout/ViewportFit";

type AdminViewportFitProps = {
  children: ReactNode;
};

export function AdminViewportFit({ children }: AdminViewportFitProps) {
  return <ViewportFit minScale={0.52}>{children}</ViewportFit>;
}
