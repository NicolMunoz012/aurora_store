export const metadata = { title: "Categorías — Admin" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/categorias/page.tsx — Category management
// =============================================================================

import { listAllCategoriesAction } from "@/lib/actions/catalog.actions";
import { CategoryManagementPanel } from "@/components/admin/CategoryManagementPanel";

export default async function AdminCategoriasPage() {
  const result = await listAllCategoriesAction();
  const categories = result.data ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Categorías</h1>
      <CategoryManagementPanel categories={categories} />
    </div>
  );
}
