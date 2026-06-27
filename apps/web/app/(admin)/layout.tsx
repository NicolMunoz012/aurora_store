// =============================================================================
// app/(admin)/layout.tsx — Admin backoffice layout
// Desktop: fixed sidebar + content with left margin.
// Mobile: sticky topbar + full-width content.
// =============================================================================

import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-warm-gray">
      {/* Sidebar (desktop fixed) + Topbar & Drawer (mobile) */}
      <AdminSidebar />

      {/* Main content area - offset by sidebar width on desktop */}
      <main className="md:ml-64 p-4 sm:p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
