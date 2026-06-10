// =============================================================================
// @aurora/core/cart — Public API (barrel)
// Punto de entrada único del módulo cart. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases (primary public API)
export { getOrCreateCartUseCase } from "./use-cases/get-or-create-cart.use-case.js";
export { addItemToCartUseCase } from "./use-cases/add-item-to-cart.use-case.js";
export { updateCartItemUseCase } from "./use-cases/update-cart-item.use-case.js";
export { removeCartItemUseCase } from "./use-cases/remove-cart-item.use-case.js";
export { mergeCartsUseCase } from "./use-cases/merge-carts.use-case.js";
export { getCartWithPricingUseCase } from "./use-cases/get-cart-with-pricing.use-case.js";

// Types (params for use cases)
export type {
  GetOrCreateCartParams,
  AddItemToCartParams,
  UpdateCartItemParams,
  RemoveCartItemParams,
  MergeCartsParams,
  GetCartWithPricingParams,
} from "./types.js";

// Repository interface (for DI wiring in apps/web)
export type { ICartRepository } from "./repositories/cart.repository.interface.js";

// Repository implementation (for DI wiring in apps/web)
export { PrismaCartRepository } from "./repositories/cart.repository.js";
