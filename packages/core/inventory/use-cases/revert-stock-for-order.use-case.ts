// =============================================================================
// @aurora/core/inventory — revertStockForOrderUseCase
// Revierte la deducción de stock para un pedido cancelado o expirado (Req 7.4, 7.5).
// =============================================================================

import { AuditActions } from "../../shared/audit-actions.js";
import type { RevertStockForOrderParams } from "../types.js";

export async function revertStockForOrderUseCase(
  params: RevertStockForOrderParams,
): Promise<void> {
  const { repository, auditLogger, orderId, items } = params;

  // 1. Add stock back for each item
  for (const item of items) {
    await repository.addStock(item.productId, item.quantity);
  }

  // 2. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.STOCK_REVERTED,
    affectedEntity: "orders",
    entityId: orderId,
    newData: { items },
  });
}
