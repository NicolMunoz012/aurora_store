// =============================================================================
// @aurora/core/orders — createOrderUseCase
// Crea un pedido validando stock, persistiendo y registrando auditoría (Req 8.1–8.6).
// =============================================================================

import type { OrderRecord } from "@aurora/shared";
import { InsufficientStockError } from "@aurora/shared";
import { AuditActions } from "../../shared/audit-actions";
import type { CreateOrderParams } from "../types";

export async function createOrderUseCase(
  params: CreateOrderParams,
): Promise<OrderRecord> {
  const { repository, inventoryService, auditLogger, data, cartItems } = params;

  // 1. Validate stock availability for all cart items
  const stockResult = await inventoryService.validateStockForItems(cartItems);
  if (!stockResult.valid) {
    throw new InsufficientStockError(stockResult.insufficientItems[0].productId);
  }

  // 2. Create order (data already contains expiresAt calculated by the caller)
  const order = await repository.createOrder(data);

  // 3. Log audit
  await auditLogger.log({
    userId: data.userId,
    action: AuditActions.ORDER_CREATED,
    affectedEntity: "orders",
    entityId: order.id,
    newData: { status: "PENDING_CONFIRMATION", itemCount: data.items.length },
  });

  // 4. Return created order
  return order;
}
