// =============================================================================
// @aurora/core/cart — addItemToCartUseCase
// Agrega un producto al carrito. Si el producto ya existe, suma cantidades (Req 5.3).
// =============================================================================

import type { CartItemRecord } from "@aurora/shared";
import type { AddItemToCartParams } from "../types.js";

export async function addItemToCartUseCase(
  params: AddItemToCartParams,
): Promise<CartItemRecord> {
  const { repository, cartId, productId, quantity } = params;

  // Verificar si el producto ya existe en el carrito
  const existingItem = await repository.findCartItemByProduct(cartId, productId);

  if (existingItem) {
    // Sumar cantidades al item existente
    return repository.updateItemQuantity(
      existingItem.id,
      existingItem.quantity + quantity,
    );
  }

  // Crear nuevo item en el carrito
  return repository.addItem(cartId, productId, quantity);
}
