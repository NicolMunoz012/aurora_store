// =============================================================================
// @aurora/core/orders — cancelOrderUseCase
// Cancela un pedido con validación de transición, reversión de stock
// condicional y auditoría (Req 8.10, 8.11).
// =============================================================================

import { OrderStatus } from "@aurora/shared";
import { OrderNotFoundError, InvalidOrderTransitionError } from "@aurora/shared";
import { isValidTransition } from "../../shared/order-transitions.js";
import { AuditActions } from "../../shared/audit-actions.js";
import type { CancelOrderParams } from "../types.js";
import type { OrderRecord } from "@aurora/shared";

export async function cancelOrderUseCase(
  params: CancelOrderParams,
): Promise<OrderRecord> {
  const { repository, inventoryService, auditLogger, orderId } = params;

  // 1. Find order
  const order = await repository.findById(orderId);
  if (!order) {
    throw new OrderNotFoundError();
  }

  // 2. Validate transition
  if (!isValidTransition(order.status, OrderStatus.CANCELLED)) {
    throw new InvalidOrderTransitionError(order.status, OrderStatus.CANCELLED);
  }

  // 3. Revert stock if it was deducted
  if (order.stockDeducted === true) {
    await inventoryService.revertStockForOrder(orderId);
  }

  // 4. Update status
  const updatedOrder = await repository.updateStatus(orderId, OrderStatus.CANCELLED);

  // 5. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.ORDER_CANCELLED,
    affectedEntity: "orders",
    entityId: orderId,
    previousData: { status: order.status },
    newData: { status: "CANCELLED" },
  });

  // 6. Return updated order
  return updatedOrder;
}
