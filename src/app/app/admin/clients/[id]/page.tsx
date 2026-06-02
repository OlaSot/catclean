import AdminClientDetailView from "@/features/clients/components/AdminClientDetailView";

type AdminClientDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminClientDetailPage({
  params,
}: AdminClientDetailPageProps) {
  const { id } = await params;

  return <AdminClientDetailView clientId={id} />;
}
