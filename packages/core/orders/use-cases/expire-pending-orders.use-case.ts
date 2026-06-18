// =============================================================================
// @aurora/core/orders — expirePendingOrdersUseCase
// Auto-cancela pedidos PENDING_CONFIRMATION cuyo tiempo de expiración
// ha pasado. Registra auditoría por cada uno (Req 8.12).
// =============================================================================

import { OrderStatus } from "@aurora/shared";
import { AuditActions } from "../../shared/audit-actions";
import type { ExpirePendingOrdersParams } from "../types";

export async function expirePendingOrdersUseCase(
  params: ExpirePendingOrdersParams,
): Promise<number> {
  const { repository, auditLogger, clock } = params;

  // 1. Get current time
  const now = clock.now();

  // 2. Find expired pending orders
  const expiredOrders = await repository.findExpiredPendingOrders(now);

  // 3. For each expired order: update status and log audit
  for (const order of expiredOrders) {
    await repository.updateStatus(order.id, OrderStatus.AUTO_CANCELLED);

    await auditLogger.log({
      userId: null,
      action: AuditActions.ORDER_AUTO_CANCELLED,
      affectedEntity: "orders",
      entityId: order.id,
      previousData: { status: "PENDING_CONFIRMATION" },
      newData: { status: "AUTO_CANCELLED" },
    });
  }

  // 4. Return count of expired orders
  return expiredOrders.length;
}
