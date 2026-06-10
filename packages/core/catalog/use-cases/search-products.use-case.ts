// =============================================================================
// @aurora/core/catalog — searchProductsUseCase
// Búsqueda ILIKE sobre nombre y descripción (Req 4.3, DT-001).
// =============================================================================

import type { ProductListItem } from "@aurora/shared";
import type { SearchProductsParams } from "../types.js";

export async function searchProductsUseCase(
  params: SearchProductsParams,
): Promise<ProductListItem[]> {
  const { repository, query } = params;
  return repository.searchProducts(query);
}
