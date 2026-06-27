"use client";
// =============================================================================
// components/catalog/ProductImageGallery.tsx (Req 5.6)
// Client Component image carousel with stable image rendering.
// Filters invalid URLs and respects displayOrder.
// =============================================================================

import { useState } from "react";
import Image from "next/image";
import type { ProductImageRecord } from "@aurora/shared";

interface ProductImageGalleryProps {
  images: Pick<ProductImageRecord, "id" | "url" | "altText" | "displayOrder">[];
  productName: string;
}

/**
 * Validates that a URL string is non-empty and not just whitespace.
 */
function isValidImageUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.trim().length > 0;
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  // Filter out invalid URLs, then sort by displayOrder
  const validImages = images
    .filter((img) => isValidImageUrl(img.url))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const [activeIndex, setActiveIndex] = useState(0);
  const active = validImages[activeIndex];

  if (!active) {
    return (
      <div className="aspect-square w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 text-sm">
        Sin imágenes disponibles
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={active.url}
          alt={active.altText ?? productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div
          role="tablist"
          aria-label="Imágenes del producto"
          className="flex gap-2 overflow-x-auto"
        >
          {validImages.map((img, i) => (
            <button
              key={img.id}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Imagen ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === activeIndex
                  ? "border-zinc-900 dark:border-white"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productName} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
