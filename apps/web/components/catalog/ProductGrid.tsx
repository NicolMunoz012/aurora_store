// =============================================================================
// components/catalog/ProductGrid.tsx — Responsive product grid
// =============================================================================

import type { SerializedProductListItem } from "@/lib/serializers";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: SerializedProductListItem[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="mb-4 text-5xl">✨</div>
        <p className="text-base font-medium text-gray-500">
          No se encontraron productos.
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Intenta con otra búsqueda o categoría.
        </p>
      </div>
    );
  }

  return (
    <ul
      className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Productos"
    >
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
