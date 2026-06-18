// =============================================================================
// @aurora/core/pricing — resolveCartPricesUseCase
// Orquesta la resolución de precios del carrito (Req 6.1–6.8).
// =============================================================================

import type { ResolvedCart } from "../../shared/interfaces";
import type { ResolveCartPricesParams } from "../types";

export async function resolveCartPricesUseCase(
  params: ResolveCartPricesParams,
): Promise<ResolvedCart> {
  const { pricingService, items, config } = params;
  return pricingService.resolveCartPrices(items, config);
}
