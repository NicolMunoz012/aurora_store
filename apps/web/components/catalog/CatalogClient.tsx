"use client";
// =============================================================================
// components/catalog/CatalogClient.tsx
// Handles client-side pagination with numbered pages (not "load more")
// - Shows PAGE_SIZE products per page
// - Pagination controls with numbered buttons
// - Preserves active filters when changing pages
// =============================================================================

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { listProductsAction } from "@/lib/actions/catalog.actions";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import type { SerializedProductListItem } from "@/lib/serializers";

const PAGE_SIZE = 16;

interface CatalogClientProps {
  initialProducts: SerializedProductListItem[];
  initialTotal: number;
  initialPage: number;
  /** Active category IDs — kept stable across page changes */
  categoryIds: string[] | undefined;
  /** If true, only show products with a discount (applied client-side) */
  discountOnly: boolean;
}

export function CatalogClient({
  initialProducts,
  initialTotal,
  initialPage,
  categoryIds,
  discountOnly,
}: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isPending, startTransition] = useTransition();

  // Reset state when initialProducts change (new filter applied)
  useEffect(() => {
    setProducts(initialProducts);
    setTotal(initialTotal);
    setCurrentPage(initialPage);
  }, [initialProducts, initialTotal, initialPage]);

  // Calculate pagination
  const totalPages = Math.ceil(total / PAGE_SIZE);
  
  // After client-side discount filter
  const visible = discountOnly
    ? products.filter((p) => p.discountPercentage && p.discountPercentage > 0)
    : products;

  function goToPage(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    // Update URL with new page
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
    
    // Fetch new page data
    startTransition(async () => {
      const offset = (page - 1) * PAGE_SIZE;
      const result = await listProductsAction({
        categoryIds,
        limit: PAGE_SIZE,
        offset,
      });
      if (result.data) {
        setProducts(result.data.products);
        setTotal(result.data.total);
        setCurrentPage(page);
        // Scroll to top of catalog
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // Generate page numbers to show
  function getPageNumbers() {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Max page numbers to show
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination: 1 ... 4 5 [6] 7 8 ... 20
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      // Show 2 pages before and after current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  }

  if (visible.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-2xl mb-2">Sin resultados</p>
        <p className="text-gray-400 text-sm">Intenta con otra búsqueda o categoría.</p>
      </div>
    );
  }

  return (
    <>
      <ProductGrid products={visible} />

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <nav className="flex items-center gap-1" aria-label="Paginación">
            {/* Previous button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="px-3 py-2 text-sm text-gray-600 hover:text-cerise-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              ← Anterior
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-2">
              {getPageNumbers().map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-2 text-gray-400"
                    >
                      ...
                    </span>
                  );
                }
                
                const pageNum = page as number;
                const isActive = pageNum === currentPage;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    disabled={isPending}
                    className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded transition-colors ${
                      isActive
                        ? "bg-cerise-600 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-cerise-600"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                    aria-label={`Página ${pageNum}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="px-3 py-2 text-sm text-gray-600 hover:text-cerise-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Página siguiente"
            >
              Siguiente →
            </button>
          </nav>

          {/* Status text */}
          <p className="text-[11px] text-gray-400">
            Página {currentPage} de {totalPages} · {total} producto{total !== 1 ? "s" : ""} total{total !== 1 ? "es" : ""}
          </p>

          {/* Loading indicator */}
          {isPending && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="h-4 w-4 rounded-full border-2 border-cerise-300 border-t-cerise-600 animate-spin" />
              Cargando...
            </div>
          )}
        </div>
      )}
    </>
  );
}
