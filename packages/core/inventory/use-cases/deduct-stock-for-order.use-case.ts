// =============================================================================
// @aurora/core/inventory — deductStockForOrderUseCase
// Deduce stock para cada item de un pedido confirmado (Req 7.1, 7.3).
// Si un item no tiene stock suficiente, InsufficientStockError se propaga.
// En producción esto debería ejecutarse en una transacción; para el MVP,
// el UPDATE atómico del repositorio previene stock negativo.
// =============================================================================

import { AuditActions } from "../../shared/audit-actions";
import type { DeductStockForOrderParams } from "../types";

export async function deductStockForOrderUseCase(
  params: DeductStockForOrderParams,
): Promise<void> {
  const { repository, auditLogger, orderId, items } = params;

  // 1. Deduct stock for each item (InsufficientStockError propagates on failure)
  for (const item of items) {
    await repository.deductStock(item.productId, item.quantity);
  }

  // 2. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.STOCK_DEDUCTED,
    affectedEntity: "orders",
    entityId: orderId,
    newData: { items },
  });
}
