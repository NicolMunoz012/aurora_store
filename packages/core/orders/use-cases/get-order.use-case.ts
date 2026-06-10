// =============================================================================
// @aurora/core/orders — getOrderUseCase
// Obtiene un pedido por ID con validación opcional de propiedad (Req 8.14).
// =============================================================================

import type { OrderWithItems } from "@aurora/shared";
import { OrderNotFoundError } from "@aurora/shared";
import type { GetOrderParams } from "../types.js";

export async function getOrderUseCase(
  params: GetOrderParams,
): Promise<OrderWithItems> {
  const { repository, orderId, userId } = params;

  // 1. Find order by ID
  const order = await repository.findById(orderId);
  if (!order) {
    throw new OrderNotFoundError();
  }

  // 2. If userId provided, validate ownership (security — client can't see other users' orders)
  if (userId && order.userId !== userId) {
    throw new OrderNotFoundError();
  }

  // 3. Return order with items
  return order;
}
