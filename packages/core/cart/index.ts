// =============================================================================
// @aurora/core/cart — Public API (barrel)
// Punto de entrada único del módulo cart. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases (primary public API)
export { getOrCreateCartUseCase } from "./use-cases/get-or-create-cart.use-case";
export { addItemToCartUseCase } from "./use-cases/add-item-to-cart.use-case";
export { updateCartItemUseCase } from "./use-cases/update-cart-item.use-case";
export { removeCartItemUseCase } from "./use-cases/remove-cart-item.use-case";
export { mergeCartsUseCase } from "./use-cases/merge-carts.use-case";
export { getCartWithPricingUseCase } from "./use-cases/get-cart-with-pricing.use-case";

// Types (params for use cases)
export type {
  GetOrCreateCartParams,
  AddItemToCartParams,
  UpdateCartItemParams,
  RemoveCartItemParams,
  MergeCartsParams,
  GetCartWithPricingParams,
} from "./types";

// Repository interface (for DI wiring in apps/web)
export type { ICartRepository } from "./repositories/cart.repository.interface";

// Repository implementation (for DI wiring in apps/web)
export { PrismaCartRepository } from "./repositories/cart.repository";
