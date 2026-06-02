export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>Cleaner header</header>
      <main>{children}</main>
    </div>
  );
}
