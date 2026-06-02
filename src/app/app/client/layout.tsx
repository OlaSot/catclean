export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>Client header</header>
      <main>{children}</main>
    </div>
  );
}
