export const metadata = { title: "Categorías — Admin" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/categorias/page.tsx — Category management
// =============================================================================

import { listAllCategoriesAction } from "@/lib/actions/catalog.actions";
import { CategoryManagementPanel } from "@/components/admin/CategoryManagementPanel";
import { getCategoryProductCountsAction } from "@/lib/actions/admin.catalog.actions";

export default async function AdminCategoriasPage() {
  const [categoriesResult, countsResult] = await Promise.all([
    listAllCategoriesAction(),
    getCategoryProductCountsAction(),
  ]);
  const categories = categoriesResult.data ?? [];
  const productCounts = countsResult.data ?? {};

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl mb-2 text-gray-900">Categorías</h1>
      <p className="text-gray-400 text-sm mb-8">Organiza tu catálogo con categorías.</p>
      <CategoryManagementPanel categories={categories} productCounts={productCounts} />
    </div>
  );
}
