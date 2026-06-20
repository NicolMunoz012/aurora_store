export const metadata = { title: "Nuevo producto — Admin" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(admin)/admin/productos/nuevo/page.tsx — Create product
// =============================================================================

import Link from "next/link";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { listActiveCategoriesAction } from "@/lib/actions/catalog.actions";

export default async function NuevoProductoPage() {
  const result = await listActiveCategoriesAction();
  const categories = result.data ?? [];

  if (categories.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Nuevo producto</h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-sm text-amber-800">
            Primero debes crear al menos una categoría antes de agregar productos.
          </p>
          <Link
            href="/admin/categorias"
            className="mt-3 inline-block text-sm font-medium text-cerise-600 hover:text-cerise-700"
          >
            Ir a categorías →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Nuevo producto</h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <AdminProductForm categories={categories} mode="create" />
      </div>
    </div>
  );
}
