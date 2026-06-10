// =============================================================================
// @aurora/core/orders — updateOrderStatusUseCase
// Actualiza el estado de un pedido con validación de transición,
// deducción de stock condicional y auditoría (Req 8.7, 8.8, 8.9).
// =============================================================================

import { OrderStatus } from "@aurora/shared";
import { OrderNotFoundError, InvalidOrderTransitionError } from "@aurora/shared";
import { isValidTransition } from "../../shared/order-transitions.js";
import { AuditActions } from "../../shared/audit-actions.js";
import type { UpdateOrderStatusParams } from "../types.js";
import type { OrderRecord } from "@aurora/shared";

export async function updateOrderStatusUseCase(
  params: UpdateOrderStatusParams,
): Promise<OrderRecord> {
  const { repository, inventoryService, auditLogger, orderId, newStatus, trackingNumber } = params;

  // 1. Find order
  const order = await repository.findById(orderId);
  if (!order) {
    throw new OrderNotFoundError();
  }

  // 2. Validate transition
  if (!isValidTransition(order.status, newStatus)) {
    throw new InvalidOrderTransitionError(order.status, newStatus);
  }

  // 3. Deduct stock if transitioning to IN_PREPARATION or SHIPPED and not yet deducted
  let stockDeducted = order.stockDeducted;
  if (
    (newStatus === OrderStatus.IN_PREPARATION || newStatus === OrderStatus.SHIPPED) &&
    order.stockDeducted === false
  ) {
    await inventoryService.deductStockForOrder(orderId);
    await repository.markStockDeducted(orderId);
    stockDeducted = true;
  }

  // 4. Update status
  const updatedOrder = await repository.updateStatus(orderId, newStatus, {
    trackingNumber: trackingNumber ?? undefined,
    stockDeducted,
  });

  // 5. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.ORDER_STATUS_UPDATED,
    affectedEntity: "orders",
    entityId: orderId,
    previousData: { status: order.status },
    newData: { status: newStatus },
  });

  // 6. Return updated order
  return updatedOrder;
}
