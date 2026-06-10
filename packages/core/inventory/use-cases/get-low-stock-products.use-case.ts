// =============================================================================
// @aurora/core/inventory — getLowStockProductsUseCase
// Retorna todos los productos cuyo stock está por debajo del umbral (Req 7.7).
// =============================================================================

import type { LowStockProduct } from "@aurora/shared";
import type { GetLowStockProductsParams } from "../types.js";

export async function getLowStockProductsUseCase(
  params: GetLowStockProductsParams,
): Promise<LowStockProduct[]> {
  const { repository } = params;

  return repository.findLowStockProducts();
}
