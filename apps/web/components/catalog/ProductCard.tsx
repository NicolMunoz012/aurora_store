"use client";
// =============================================================================
// components/catalog/ProductCard.tsx — Product card with hover second image
// Stable image rendering with fallback for empty/invalid URLs.
// =============================================================================

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SerializedProductListItem } from "@/lib/serializers";
import { getDiscountedPrice, formatCOP } from "@/lib/discount";

interface ProductCardProps {
  product: SerializedProductListItem;
}

/**
 * Validates that a URL string is non-empty and not just whitespace.
 * Returns true when the URL is safe to use with next/image.
 */
function isValidImageUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.trim().length > 0;
}

export function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock === 0;
  const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
  const originalPrice = parseFloat(product.retailPrice);
  const finalPrice = hasDiscount
    ? getDiscountedPrice(originalPrice, product.discountPercentage)
    : originalPrice;

  // Safe image URL resolution
  const mainImage = isValidImageUrl(product.mainImageUrl) ? product.mainImageUrl : null;
  const secondImage = isValidImageUrl(product.secondImageUrl) ? product.secondImageUrl : null;
  const hasSecondImage = !!secondImage;
  const [hovered, setHovered] = useState(false);

  const displayImage = hasSecondImage && hovered ? secondImage : mainImage;

  return (
    <article className="group">
      <Link
        href={`/producto/${product.slug}`}
        className="block relative aspect-[4/5] bg-warm-gray rounded-md overflow-hidden mb-4"
        onMouseEnter={() => hasSecondImage && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {displayImage ? (
          <>
            <Image
              src={displayImage}
              alt={product.mainImageAlt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-all duration-500"
              loading="lazy"
            />
            {/* Smooth second image crossfade */}
            {hasSecondImage && (
              <Image
                src={secondImage}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover absolute inset-0 transition-opacity duration-700 ease-in-out ${hovered ? "opacity-100" : "opacity-0"}`}
                loading="eager"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
            Sin imagen
          </div>
        )}
        {outOfStock && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-600 text-[10px] font-semibold px-2.5 py-1 tracking-luxe rounded-sm z-10">
            Agotado
          </span>
        )}
        {hasDiscount && !outOfStock && (
          <span className="absolute top-3 left-3 bg-cerise-600 text-white text-[10px] font-semibold px-2.5 py-1 tracking-luxe rounded-sm z-10">
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
