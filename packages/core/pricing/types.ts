// =============================================================================
// @aurora/core/pricing — Internal Types
// Tipos internos del módulo pricing: re-exportaciones de contratos cross-module
// y parámetros de Use Cases con inyección de dependencias (Req 1.6, 6.1–6.8).
// =============================================================================

// Re-exports from shared interfaces (cross-module contract)
export type { ResolvedCart, ResolvedCartItem } from "../shared/interfaces";

// Use case params
import type { CartItemWithProduct, StoreConfigRecord } from "@aurora/shared";
import type { IPricingService } from "../shared/interfaces";

/** Parámetros para resolveCartPricesUseCase */
export interface ResolveCartPricesParams {
  pricingService: IPricingService;
  items: CartItemWithProduct[];
  config: StoreConfigRecord;
}
