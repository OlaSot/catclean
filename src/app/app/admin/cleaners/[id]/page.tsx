import AdminCleanerDetailView from "@/features/cleaners/components/AdminCleanerDetailView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCleanerDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminCleanerDetailView cleanerId={id} />;
}
