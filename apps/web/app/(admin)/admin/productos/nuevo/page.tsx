export const metadata = { title: "Nuevo producto — Admin" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { listActiveCategoriesAction } from "@/lib/actions/catalog.actions";
import { listActiveProductBrandsAction } from "@/lib/actions/admin.product-brands.actions";

export default async function NuevoProductoPage() {
  const [categoriesResult, brandsResult] = await Promise.all([
    listActiveCategoriesAction(),
    listActiveProductBrandsAction(),
  ]);
  const categories = categoriesResult.data ?? [];
  const productBrands = brandsResult.data ?? [];

  if (categories.length === 0) {
    return (
      <div className="max-w-3xl">
        <h1 className="font-serif text-3xl mb-2 text-gray-900">Nuevo producto</h1>
        <p className="text-gray-400 text-sm mb-8">Completa los datos para agregar un producto al catálogo.</p>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-sm text-amber-800">
            Primero debes crear al menos una categoría antes de agregar productos.
          </p>
          <Link href="/admin/categorias" className="mt-3 inline-block text-sm font-medium text-cerise-600 hover:text-cerise-700">
            Ir a categorías →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl mb-2 text-gray-900">Nuevo producto</h1>
      <p className="text-gray-400 text-sm mb-8">Completa los datos para agregar un producto al catálogo.</p>
      <div className="bg-white border border-gray-100 rounded-md p-8">
        <AdminProductForm categories={categories} productBrands={productBrands} mode="create" />
      </div>
    </div>
  );
}
