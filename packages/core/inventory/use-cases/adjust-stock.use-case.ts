// =============================================================================
// @aurora/core/inventory — adjustStockUseCase
// Ajusta el stock de un producto a un valor exacto y registra auditoría (Req 7.6).
// =============================================================================

import type { StockRecord } from "@aurora/shared";
import { AuditActions } from "../../shared/audit-actions.js";
import type { AdjustStockParams } from "../types.js";

export async function adjustStockUseCase(
  params: AdjustStockParams,
): Promise<StockRecord> {
  const { repository, auditLogger, productId, newStock, note } = params;

  // 1. Get current stock
  const currentStock = await repository.findProductStock(productId);

  // 2. Set new stock
  const updated = await repository.setStock(productId, newStock);

  // 3. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.STOCK_ADJUSTED,
    affectedEntity: "products",
    entityId: productId,
    previousData: { stock: currentStock?.stock ?? null },
    newData: { stock: newStock },
    note,
  });

  // 4. Return updated StockRecord
  return updated;
}
