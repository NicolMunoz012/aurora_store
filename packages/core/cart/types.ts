// =============================================================================
// @aurora/core/cart — Internal Types
// Tipos internos del módulo cart: parámetros de Use Cases con inyección
// de dependencias via interfaz de repositorio (Req 1.6, 5.1–5.7).
// =============================================================================

import type { StoreConfigRecord } from "@aurora/shared";
import type { IPricingService } from "../shared/interfaces";
import type { ICartRepository } from "./repositories/cart.repository.interface";

/** Parámetros para getOrCreateCartUseCase */
export interface GetOrCreateCartParams {
  repository: ICartRepository;
  userId?: string | null;
  sessionId?: string | null;
}

/** Parámetros para addItemToCartUseCase */
export interface AddItemToCartParams {
  repository: ICartRepository;
  cartId: string;
  productId: string;
  quantity: number;
}

/** Parámetros para updateCartItemUseCase */
export interface UpdateCartItemParams {
  repository: ICartRepository;
  cartItemId: string;
  quantity: number;
  cartId: string;
}

/** Parámetros para removeCartItemUseCase */
export interface RemoveCartItemParams {
  repository: ICartRepository;
  cartItemId: string;
}

/** Parámetros para mergeCartsUseCase */
export interface MergeCartsParams {
  repository: ICartRepository;
  userId: string;
  sessionId: string;
}

/** Parámetros para getCartWithPricingUseCase */
export interface GetCartWithPricingParams {
  repository: ICartRepository;
  pricingService: IPricingService;
  config: StoreConfigRecord;
  userId?: string | null;
  sessionId?: string | null;
}
