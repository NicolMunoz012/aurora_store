// =============================================================================
// @aurora/core/catalog — getProductBySlugUseCase
// Obtiene un producto por su slug, ocultando wholesalePrice (Req 4.4, 4.12).
// =============================================================================

import type { ProductDetail, InternalProductDetail } from "@aurora/shared";
import type { GetProductBySlugParams } from "../types.js";

function toPublicProductDetail(internal: InternalProductDetail): ProductDetail {
  const { wholesalePrice, ...publicDetail } = internal;
  return publicDetail;
}

export async function getProductBySlugUseCase(
  params: GetProductBySlugParams,
): Promise<ProductDetail | null> {
  const { repository, slug } = params;
  const product = await repository.findBySlug(slug);

  if (!product) {
    return null;
  }

  return toPublicProductDetail(product);
}
