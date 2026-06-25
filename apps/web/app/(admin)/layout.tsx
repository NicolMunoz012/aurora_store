// =============================================================================
// app/(admin)/layout.tsx — Admin backoffice layout
// Desktop: sidebar + scrollable main area side-by-side.
// Mobile: sticky topbar (rendered inside AdminSidebar) + full-width main.
// =============================================================================

import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // On desktop: flex row (sidebar | content).
    // On mobile: flex column — the AdminSidebar renders a sticky topbar first,
    // then the content stretches full-width below it.
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-warm-gray">
      {/* Sidebar (desktop) + Topbar & Drawer (mobile) */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col md:overflow-hidden min-w-0">
        <main className="flex-1 md:overflow-y-auto p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
