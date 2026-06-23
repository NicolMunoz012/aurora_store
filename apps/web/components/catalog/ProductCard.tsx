// =============================================================================
// components/catalog/ProductCard.tsx — Product card with discount support
// =============================================================================

import Image from "next/image";
import Link from "next/link";
import type { SerializedProductListItem } from "@/lib/serializers";
import { getDiscountedPrice, formatCOP } from "@/lib/discount";

interface ProductCardProps {
  product: SerializedProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock === 0;
  const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
  const originalPrice = parseFloat(product.retailPrice);
  const finalPrice = hasDiscount
    ? getDiscountedPrice(originalPrice, product.discountPercentage)
    : originalPrice;

  return (
    <article className="group">
      <Link href={`/producto/${product.slug}`} className="block relative aspect-[4/5] bg-warm-gray rounded-md overflow-hidden mb-4">
        <Image
          src={product.mainImageUrl}
          alt={product.mainImageAlt ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
        {outOfStock && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-600 text-[10px] font-semibold px-2.5 py-1 tracking-luxe rounded-sm">
            Agotado
          </span>
        )}
        {hasDiscount && !outOfStock && (
          <span className="absolute top-3 left-3 bg-cerise-600 text-white text-[10px] font-semibold px-2.5 py-1 tracking-luxe rounded-sm">
            -{product.discountPercentage}%
          </span>
        )}
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/producto/${product.slug}`}
            className="block font-serif text-[17px] leading-snug text-gray-900 truncate group-hover:text-cerise-600 transition-colors"
          >
            {product.name}
          </Link>
          <p className="text-[13px] text-gray-400 mt-0.5 truncate">
            {product.category?.name ?? "Sin categoría"}
          </p>
        </div>
        <div className="shrink-0 mt-1 text-right">
          {hasDiscount ? (
            <>
              <span className="text-cerise-600 font-semibold text-sm">{formatCOP(finalPrice)}</span>
              <span className="block text-[11px] text-gray-400 line-through">{formatCOP(originalPrice)}</span>
            </>
          ) : (
            <span className="text-cerise-600 font-semibold text-sm">{formatCOP(originalPrice)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
