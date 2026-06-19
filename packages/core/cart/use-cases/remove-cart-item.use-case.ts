// =============================================================================
// @aurora/core/cart — removeCartItemUseCase
// Elimina un item del carrito (Req 5.4).
// =============================================================================

import type { RemoveCartItemParams } from "../types";

export async function removeCartItemUseCase(
  params: RemoveCartItemParams,
): Promise<void> {
  const { repository, cartItemId } = params;
  await repository.removeItem(cartItemId);
}
