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
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CategoryFilter } from "@/components/catalog/CategoryFilter";

export const revalidate = 60;
export const runtime = "nodejs";

export const metadata = {
  title: "Catálogo — Aurora Belleza",
  description: "Explora nuestros productos de belleza.",
};

interface CatalogPageProps {
  searchParams: Promise<{ search?: string; categoryIds?: string; page?: string; discount?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const searchQuery = params.search ?? "";
  const categoryIds = params.categoryIds
    ? params.categoryIds.split(",").filter(Boolean)
    : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const discountFilter = params.discount === "true";
  const PAGE_SIZE = 16;

  const categoriesResult = await listActiveCategoriesAction();
  const allCategories = categoriesResult.data ?? [];

  const productsResult = searchQuery
    ? await searchProductsAction(searchQuery)
    : await listProductsAction({ categoryIds });

  const allProducts = (productsResult.data ?? []).filter(
    (p) => !discountFilter || (p.discountPercentage && p.discountPercentage > 0),
  );
  const products = allProducts.slice(0, page * PAGE_SIZE);
  const hasMore = allProducts.length > products.length;

  const configResult = await getStoreConfigAction();
  const wholesaleThreshold = configResult.data?.wholesaleThreshold;

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

          {/* Result count */}
          {allProducts.length > 0 && (
            <p className="text-[11px] tracking-luxe text-gray-400 font-medium">
              {products.length} de {allProducts.length} producto{allProducts.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Results */}
        {productsResult.error ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl mb-2">Error al cargar</p>
            <p className="text-gray-400 text-sm">Intenta de nuevo más tarde.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl mb-2">Sin resultados</p>
            <p className="text-gray-400 text-sm">Intenta con otra búsqueda o categoría.</p>
          </div>
        ) : (
          <>
            <ProductGrid products={products} />
            {hasMore && (
              <div className="mt-12 text-center">
                <a
                  href={`/catalog?${new URLSearchParams({
                    ...(searchQuery ? { search: searchQuery } : {}),
                    ...(categoryIds ? { categoryIds: categoryIds.join(",") } : {}),
                    page: String(page + 1),
                  }).toString()}`}
                  className="inline-flex px-8 py-3 border border-gray-200 text-[12px] tracking-luxe font-semibold text-gray-600 rounded-full hover:border-cerise-300 hover:text-cerise-600 transition-colors"
                >
                  Ver más productos
                </a>
                <p className="text-[11px] text-gray-400 mt-3">
                  Mostrando {products.length} de {allProducts.length}
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
