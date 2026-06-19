// =============================================================================
// @aurora/core/catalog — toggleProductActiveUseCase
// Activa o desactiva un producto con registro de auditoría (Req 4.8).
// =============================================================================

import { ProductNotFoundError } from "@aurora/shared";
import type { ToggleProductActiveParams } from "../types";
import { AuditActions } from "../../shared/audit-actions";

export async function toggleProductActiveUseCase(
  params: ToggleProductActiveParams,
): Promise<void> {
  const { repository, auditLogger, productId, isActive } = params;

  // 1. Verify product exists
  const existing = await repository.findById(productId);
  if (!existing) {
    throw new ProductNotFoundError();
  }

  // 2. Toggle active status
  await repository.setActiveStatus(productId, isActive);

  // 3. Log audit with appropriate action
  const action = isActive
    ? AuditActions.PRODUCT_REACTIVATED
    : AuditActions.PRODUCT_DEACTIVATED;

  await auditLogger.log({
    userId: null,
    action,
    affectedEntity: "products",
    entityId: productId,
    previousData: { isActive: existing.isActive },
    newData: { isActive },
  });
}
