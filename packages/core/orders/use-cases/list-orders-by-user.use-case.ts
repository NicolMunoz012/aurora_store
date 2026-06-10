// =============================================================================
// @aurora/core/orders — listOrdersByUserUseCase
// Lista los pedidos de un usuario específico (Req 8.14).
// =============================================================================

import type { OrderSummary } from "@aurora/shared";
import type { ListOrdersByUserParams } from "../types.js";

export async function listOrdersByUserUseCase(
  params: ListOrdersByUserParams,
): Promise<OrderSummary[]> {
  const { repository, userId } = params;

  return repository.listByUserId(userId);
}
