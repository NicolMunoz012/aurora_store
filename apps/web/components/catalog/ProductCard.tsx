// =============================================================================
// components/catalog/ProductCard.tsx (Req 5.1, 5.3, 5.7)
// Accepts SerializedProductListItem — retailPrice is already a string.
// =============================================================================

import Image from "next/image";
import Link from "next/link";
import type { SerializedProductListItem } from "@/lib/serializers";

function formatCOP(value: string): string {
  const num = parseFloat(value);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(num);
}

interface ProductCardProps {
  product: SerializedProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock === 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <Link href={`/producto/${product.slug}`} className="block overflow-hidden">
        <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={product.mainImageUrl}
            alt={product.mainImageAlt ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900">
                Agotado
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {product.category.name}
        </div>
        <Link
          href={`/producto/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold text-zinc-800 hover:underline dark:text-zinc-100"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-base font-bold text-zinc-900 dark:text-white">
            {formatCOP(product.retailPrice)}
          </span>
          <span className="text-xs text-zinc-400">IVA incluido</span>
        </div>

        {outOfStock && (
          <button
            disabled
            aria-disabled="true"
            className="mt-2 w-full cursor-not-allowed rounded-full bg-zinc-200 py-2 text-sm font-medium text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500"
          >
            Agotado
          </button>
        )}
      </div>
    </article>
  );
}
