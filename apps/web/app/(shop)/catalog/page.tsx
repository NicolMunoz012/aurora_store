// =============================================================================
// app/(shop)/catalog/page.tsx — Catalog listing page
// =============================================================================

import { Suspense } from "react";
import {
  listProductsAction,
  searchProductsAction,
  getStoreConfigAction,
  listActiveCategoriesAction,
} from "@/lib/actions/catalog.actions";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CategoryFilter } from "@/components/catalog/CategoryFilter";

export const revalidate = 60;
export const runtime = "nodejs";

export const metadata = {
  title: "Catálogo — Aurora Belleza",
  description: "Explora nuestros productos de belleza. IVA incluido.",
};

interface CatalogPageProps {
  searchParams: Promise<{ search?: string; categoryIds?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const searchQuery = params.search ?? "";
  const categoryIds = params.categoryIds
    ? params.categoryIds.split(",").filter(Boolean)
    : undefined;

  const categoriesResult = await listActiveCategoriesAction();
  const allCategories = categoriesResult.data ?? [];

  const productsResult = searchQuery
    ? await searchProductsAction(searchQuery)
    : await listProductsAction({ categoryIds });

  const products = productsResult.data ?? [];

  const configResult = await getStoreConfigAction();
  const wholesaleThreshold = configResult.data?.wholesaleThreshold;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuestros productos</h1>
        {wholesaleThreshold && (
          <p className="mt-2 text-sm text-gray-500">
            🎉 Precio mayorista disponible a partir de{" "}
            <span className="font-semibold text-cerise-600">
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              }).format(Number(wholesaleThreshold))}
            </span>
          </p>
        )}
      </div>

      {/* Filters bar */}
      <div className="mb-6">
        {allCategories.length > 0 && (
          <Suspense>
            <CategoryFilter categories={allCategories} />
          </Suspense>
        )}
      </div>

      {/* Results */}
      <div>
        {productsResult.error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">
              Error al cargar los productos. Intenta de nuevo.
            </p>
          </div>
        ) : (
          <>
            {products.length > 0 && (
              <p className="mb-4 text-sm text-gray-400">
                {products.length} producto{products.length !== 1 ? "s" : ""}
              </p>
            )}
            <ProductGrid products={products} />
          </>
        )}
      </div>
    </div>
  );
}
