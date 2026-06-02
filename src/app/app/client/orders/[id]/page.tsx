import ClientOrderDetailView from "@/features/orders/components/ClientOrderDetailView";

type ClientOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientOrderDetailPage({
  params,
}: ClientOrderDetailPageProps) {
  const { id } = await params;

  return <ClientOrderDetailView orderId={id} />;
}
