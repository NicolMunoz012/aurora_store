// =============================================================================
// @aurora/core/pricing — Public API (barrel)
// Punto de entrada único del módulo pricing. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases (primary public API)
export { resolveCartPricesUseCase } from "./use-cases/resolve-cart-prices.use-case.js";

// Types (params for use cases + resolved cart types)
export type { ResolveCartPricesParams, ResolvedCart, ResolvedCartItem } from "./types.js";

// Service implementation (for DI wiring in apps/web)
export { PricingService } from "./services/pricing.service.js";
