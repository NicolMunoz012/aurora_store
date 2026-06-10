// =============================================================================
// @aurora/core/catalog — listProductsUseCase
// Lista productos activos con filtros opcionales (Req 4.1, 4.2).
// =============================================================================

import type { ProductListItem } from "@aurora/shared";
import type { ListProductsParams } from "../types.js";

export async function listProductsUseCase(
  params: ListProductsParams,
): Promise<ProductListItem[]> {
  const { repository, filters } = params;
  return repository.listActiveProducts(filters ?? {});
}
