import PortalOrderDetailView from "@/features/client-portal/views/PortalOrderDetailView";

type ClientOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientOrderDetailPage({
  params,
}: ClientOrderDetailPageProps) {
  const { id } = await params;

  return <PortalOrderDetailView orderId={id} />;
}
