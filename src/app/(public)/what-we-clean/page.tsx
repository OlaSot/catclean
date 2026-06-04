import { SitePageShell } from "@/components/layout/SitePageShell";
import { ServiceComparisonView, isServiceId } from "@/features/service-comparison";

type WhatWeCleanPageProps = {
  searchParams?: Promise<{ service?: string }>;
};

export default async function WhatWeCleanPage({ searchParams }: WhatWeCleanPageProps) {
  const params = await searchParams;
  const initialServiceId = isServiceId(params?.service) ? params.service : "home_reset";

  return (
    <SitePageShell contentClassName="py-4 sm:py-6">
      <ServiceComparisonView initialServiceId={initialServiceId} />
    </SitePageShell>
  );
}
