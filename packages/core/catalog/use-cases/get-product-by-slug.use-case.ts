// =============================================================================
// @aurora/core/catalog — getProductBySlugUseCase
// Retorna InternalProductDetail (incluye wholesalePrice).
// La capa de presentación decide qué exponer al cliente.
// =============================================================================

import type { InternalProductDetail } from "@aurora/shared";
import type { GetProductBySlugParams } from "../types";

export async function getProductBySlugUseCase(
  params: GetProductBySlugParams,
): Promise<InternalProductDetail | null> {
  const { repository, slug } = params;
  return repository.findBySlug(slug);
}
