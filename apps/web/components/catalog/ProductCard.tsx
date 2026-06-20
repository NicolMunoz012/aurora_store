// =============================================================================
// components/catalog/ProductCard.tsx — Product card for catalog grid
// =============================================================================

import Image from "next/image";
import Link from "next/link";
import type { SerializedProductListItem } from "@/lib/serializers";

function formatCOP(value: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
}

interface ProductCardProps {
  product: SerializedProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock === 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <Link href={`/producto/${product.slug}`} className="block overflow-hidden">
        <div className="relative aspect-[4/5] w-full bg-gray-50">
          <Image
            src={product.mainImageUrl}
            alt={product.mainImageAlt ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <span className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-500 shadow-sm">
                Agotado
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[11px] font-medium uppercase tracking-widest text-cerise-400">
          {product.category.name}
        </span>
        <Link
          href={`/producto/${product.slug}`}
          className="line-clamp-2 text-sm font-medium text-gray-800 transition-colors group-hover:text-cerise-700"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <span className="text-lg font-bold text-gray-900">
            {formatCOP(product.retailPrice)}
          </span>
          <span className="text-[10px] text-gray-400">IVA incl.</span>
        </div>
      </div>
    </article>
  );
}
