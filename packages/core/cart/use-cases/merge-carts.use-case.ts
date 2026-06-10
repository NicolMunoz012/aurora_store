// =============================================================================
// @aurora/core/cart — mergeCartsUseCase
// Fusiona el carrito anónimo con el carrito del usuario autenticado (Req 5.5).
// Implementa invariante DA-002: al fusionar, clearSessionId=true es CRÍTICO
// para liberar el constraint unique de sessionId.
// =============================================================================

import type { CartWithItems } from "@aurora/shared";
import { CartStatus } from "@aurora/shared";
import type { MergeCartsParams } from "../types.js";

export async function mergeCartsUseCase(
  params: MergeCartsParams,
): Promise<CartWithItems> {
  const { repository, userId, sessionId } = params;

  // 1. Buscar el carrito anónimo por sessionId
  const anonymousCart = await repository.findActiveCartBySessionId(sessionId);

  // 2. Buscar o crear el carrito del usuario autenticado
  let userCart = await repository.findActiveCartByUserId(userId);

  if (!userCart) {
    await repository.createCart({ userId });
    userCart = await repository.findActiveCartByUserId(userId);
  }

  // 3. Si no hay carrito anónimo, retornar el carrito del usuario (Req 5.6)
  if (!anonymousCart) {
    return userCart!;
  }

  // 4. Fusionar items del carrito anónimo al carrito del usuario
  await repository.mergeCartItems(anonymousCart.id, userCart!.id);

  // 5. Marcar carrito anónimo como MERGED y limpiar sessionId (DA-002 CRITICAL)
  await repository.setCartStatus(anonymousCart.id, CartStatus.MERGED, true);

  // 6. Retornar el carrito actualizado del usuario
  const refreshedCart = await repository.findActiveCartByUserId(userId);
  return refreshedCart!;
}
