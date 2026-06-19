// =============================================================================
// app/(shop)/catalog/page.tsx — Catalog listing page (Req 5.1, 5.2, 5.3, 5.8)
// Server Component with ISR revalidation.
// All Decimal fields are serialized before reaching Client Components.
// =============================================================================

import { Suspense } from "react";
import { listProductsAction, searchProductsAction, getStoreConfigAction, listActiveCategoriesAction } from "@/lib/actions/catalog.actions";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SearchBar } from "@/components/catalog/SearchBar";
import { CategoryFilter } from "@/components/catalog/CategoryFilter";

export const revalidate = 60; // ISR: revalidate every 60 seconds
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

  // Fetch categories for the filter (active only)
  const categoriesResult = await listActiveCategoriesAction();
  const allCategories = categoriesResult.data ?? [];

  // Fetch products: search takes priority over filter
  const productsResult = searchQuery
    ? await searchProductsAction(searchQuery)
    : await listProductsAction({ categoryIds });

  const products = productsResult.data ?? [];

  // Fetch store config for wholesaleThreshold display (Req 5.8)
  const configResult = await getStoreConfigAction();
  const wholesaleThreshold = configResult.data?.wholesaleThreshold;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Catálogo</h1>
        {wholesaleThreshold && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Precio mayorista disponible cuando tu carrito supere{" "}
            <span className="font-semibold">
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              }).format(Number(wholesaleThreshold))}{" "}
              COP
            </span>
            .
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-56 shrink-0">
          <div className="mb-4">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
          {allCategories.length > 0 && (
            <Suspense>
              <CategoryFilter categories={allCategories} />
            </Suspense>
          )}
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {productsResult.error ? (
            <p className="text-sm text-red-500">
              Error al cargar los productos. Intenta de nuevo.
            </p>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
}
