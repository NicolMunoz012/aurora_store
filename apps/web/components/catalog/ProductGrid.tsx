// =============================================================================
// components/catalog/ProductGrid.tsx (Req 5.1)
// Responsive grid: 1 col mobile → 2 tablet → 3–4 desktop.
// =============================================================================

import type { SerializedProductListItem } from "@/lib/serializers";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: SerializedProductListItem[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          No se encontraron productos.
        </p>
      </div>
    );
  }

  return (
    <ul
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
