// =============================================================================
// @aurora/core/cart — updateCartItemUseCase
// Actualiza la cantidad de un item del carrito.
// Si quantity <= 0, elimina el item automáticamente (Req 5.4).
// =============================================================================

import type { CartItemRecord } from "@aurora/shared";
import type { UpdateCartItemParams } from "../types.js";

export async function updateCartItemUseCase(
  params: UpdateCartItemParams,
): Promise<CartItemRecord | null> {
  const { repository, cartItemId, quantity } = params;

  // Si la cantidad es 0 o negativa, eliminar el item
  if (quantity <= 0) {
    await repository.removeItem(cartItemId);
    return null;
  }

  // Actualizar la cantidad
  return repository.updateItemQuantity(cartItemId, quantity);
}
