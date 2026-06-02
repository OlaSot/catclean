import AdminOrderEditView from "@/features/orders/components/AdminOrderEditView";

type AdminOrderEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderEditPage({ params }: AdminOrderEditPageProps) {
  const { id } = await params;
  return <AdminOrderEditView orderId={id} />;
}

