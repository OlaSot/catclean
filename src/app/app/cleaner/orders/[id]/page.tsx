import CleanerOrderDetailView from "@/features/orders/components/CleanerOrderDetail";

type CleanerOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CleanerOrderDetailPage({
  params,
}: CleanerOrderDetailPageProps) {
  const { id } = await params;
  return <CleanerOrderDetailView orderId={id} />;
}
