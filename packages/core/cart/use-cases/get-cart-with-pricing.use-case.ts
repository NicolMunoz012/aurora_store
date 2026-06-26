// =============================================================================
// @aurora/core/cart — getCartWithPricingUseCase
// Obtiene el carrito con precios resueltos según la configuración de tienda (Req 5.7).
// Nota: wholesalePrice está en ResolvedCartItem pero apps/web debe eliminarlo
// antes de enviar al cliente.
// =============================================================================

import type { ResolvedCart } from "../../shared/interfaces";
import type { GetCartWithPricingParams } from "../types";

export async function getCartWithPricingUseCase(
  params: GetCartWithPricingParams,
): Promise<ResolvedCart | null> {
  const { repository, pricingService, config, userId, sessionId } = params;

  // 1. Obtener el carrito: priorizar userId, luego sessionId
  let cart = null;

  if (userId) {
    cart = await repository.findActiveCartByUserId(userId);
  }

  if (!cart && sessionId) {
    cart = await repository.findActiveCartBySessionId(sessionId);
  }

  // 2. Si no hay carrito, retornar null
  if (!cart) {
    return null;
  }

  // 3. Calcular precios con el servicio de pricing
  return pricingService.resolveCartPrices(cart.items, config, cart.id);
}
