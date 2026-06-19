// =============================================================================
// app/(admin)/admin/productos/nuevo/page.tsx — Create product (Req 16.1–16.5)
// =============================================================================

import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { listActiveCategoriesAction } from "@/lib/actions/catalog.actions";

export const metadata = { title: "Nuevo producto — Admin" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const result = await listActiveCategoriesAction();
  const categories = result.data ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">Nuevo producto</h1>
      <AdminProductForm categories={categories} mode="create" />
    </div>
  );
}