// =============================================================================
// app/(admin)/admin/categorias/page.tsx — Category management (Req 17.1–17.4)
// =============================================================================

import { listAllCategoriesAction } from "@/lib/actions/catalog.actions";
import { CategoryManagementPanel } from "@/components/admin/CategoryManagementPanel";

export const metadata = { title: "Categorías — Admin" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const result = await listAllCategoriesAction();
  const categories = result.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">Categorías</h1>
      <CategoryManagementPanel categories={categories} />
    </div>
  );
}
