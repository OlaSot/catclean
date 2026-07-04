"use client";

import { useEffect, useState } from "react";
import { HomeDesktopLayout } from "./HomeDesktopLayout";
import { HomeMobileLayout } from "./HomeMobileLayout";

const DESKTOP_MQ = "(min-width: 1024px)";

export function HomePageContent() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (isDesktop === null) {
    return <main className="min-h-dvh bg-[#EEF2F7]" aria-hidden />;
  }

  return isDesktop ? <HomeDesktopLayout /> : <HomeMobileLayout />;
}
