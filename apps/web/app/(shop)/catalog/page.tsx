// =============================================================================
// app/(shop)/catalog/page.tsx — Catalog listing page (editorial style)
// =============================================================================

import { Suspense } from "react";
import {
  listProductsAction,
  searchProductsAction,
  getStoreConfigAction,
  listActiveCategoriesAction,
} from "@/lib/actions/catalog.actions";
import { CategoryFilter } from "@/components/catalog/CategoryFilter";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { ProductGrid } from "@/components/catalog/ProductGrid";

export const revalidate = 60;
export const runtime = "nodejs";

export const metadata = {
  title: "Catálogo — LunaRose",
  description: "Explora nuestros productos de belleza.",
};

interface CatalogPageProps {
  searchParams: Promise<{ search?: string; categoryIds?: string; discount?: string; page?: string }>;
}

const PAGE_SIZE = 16;

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const searchQuery = params.search ?? "";
  const categoryIds = params.categoryIds
    ? params.categoryIds.split(",").filter(Boolean)
    : undefined;
  const discountFilter = params.discount === "true";
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));

  // Debug logging
  console.log("🔍 Catalog Page - Search Params:", {
    raw: params,
    searchQuery,
    categoryIds,
    discountFilter,
    currentPage,
  });

  const categoriesResult = await listActiveCategoriesAction();
  const allCategories = categoriesResult.data ?? [];

  const configResult = await getStoreConfigAction();
  const wholesaleThreshold = configResult.data?.wholesaleThreshold;

  // Use new pagination-aware action when no search query
  let productsResult;
  let useClientPagination = false;

  if (searchQuery) {
    // Search still uses in-memory filter (search is a small set)
    productsResult = await searchProductsAction(searchQuery);
  } else {
    // Use paginated action
    const offset = (currentPage - 1) * PAGE_SIZE;
    console.log("🔍 Calling listProductsAction with:", {
      categoryIds,
      limit: PAGE_SIZE,
      offset,
    });
    productsResult = await listProductsAction({
      categoryIds,
      limit: PAGE_SIZE,
      offset,
    });
    console.log("🔍 Products result:", {
      count: productsResult.data?.products.length,
      total: productsResult.data?.total,
      error: productsResult.error,
    });
    useClientPagination = true;
  }

  return (
    <div>
      {/* Hero banner */}
      <section className="bg-blush border-b border-gray-100/60 py-16 md:py-20">
        <div className="container-aurora text-center max-w-2xl mx-auto">
          <span className="text-cerise-600 text-[11px] tracking-luxe font-semibold">
            La colección
          </span>
          <h1 className="font-serif text-5xl md:text-6xl mt-3 text-balance">
            Nuestros <span className="italic">productos</span>
          </h1>
          <p className="text-gray-500 mt-4">
            Belleza consciente, formulación precisa.
          </p>
          {wholesaleThreshold && (
            <p className="text-sm text-cerise-600 mt-3 font-medium">
              Precio mayorista a partir de{" "}
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              }).format(Number(wholesaleThreshold))}
            </p>
          )}
        </div>
      </section>

      {/* Filters + grid */}
      <section className="container-aurora py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          {/* Category filter pills */}
          {allCategories.length > 0 && (
            <Suspense>
              <CategoryFilter categories={allCategories} />
            </Suspense>
          )}

          {/* Result count - shown for paginated results */}
          {useClientPagination && productsResult.data && productsResult.data.total > 0 && (
            <p className="text-[11px] tracking-luxe text-gray-400 font-medium">
              {productsResult.data.total} producto{productsResult.data.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Results */}
        {productsResult.error ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl mb-2">Error al cargar</p>
            <p className="text-gray-400 text-sm">Intenta de nuevo más tarde.</p>
          </div>
        ) : useClientPagination ? (
          // Client-paginated catalog (numbered pages)
          productsResult.data && productsResult.data.products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl mb-2">Sin resultados</p>
              <p className="text-gray-400 text-sm">Intenta con otra búsqueda o categoría.</p>
            </div>
          ) : (
            <CatalogClient
              initialProducts={productsResult.data?.products ?? []}
              initialTotal={productsResult.data?.total ?? 0}
              initialPage={currentPage}
              categoryIds={categoryIds}
              discountOnly={discountFilter}
            />
          )
        ) : (
          // Search results (legacy in-memory filter)
          (() => {
            const allProducts = (productsResult.data ?? []).filter(
              (p) => !discountFilter || (p.discountPercentage && p.discountPercentage > 0),
            );
            return allProducts.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-serif text-2xl mb-2">Sin resultados</p>
                <p className="text-gray-400 text-sm">Intenta con otra búsqueda o categoría.</p>
              </div>
            ) : (
              <ProductGrid products={allProducts} />
            );
          })()
        )}
      </section>
    </div>
  );
}
