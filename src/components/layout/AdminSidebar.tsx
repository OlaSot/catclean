"use client";

import { AdminSidebarNav } from "@/components/layout/AdminSidebarNav";

type AdminSidebarProps = {
  userEmail: string;
};

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[#E5EDF5] bg-white shadow-[4px_0_32px_rgba(52,89,126,0.06)] lg:flex">
      <AdminSidebarNav userEmail={userEmail} />
    </aside>
  );
}
