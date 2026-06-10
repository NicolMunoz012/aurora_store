// =============================================================================
// @aurora/core/catalog — updateCategoryUseCase
// Actualiza una categoría existente con registro de auditoría (Req 4.9).
// =============================================================================

import type { CategoryRecord } from "@aurora/shared";
import { AuditActions } from "../../shared/audit-actions.js";
import type { UpdateCategoryParams } from "../types.js";

export async function updateCategoryUseCase(
  params: UpdateCategoryParams,
): Promise<CategoryRecord> {
  const { categoryRepository, auditLogger, categoryId, data } = params;

  // 1. Update category
  const category = await categoryRepository.updateCategory(categoryId, data);

  // 2. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.CATEGORY_UPDATED,
    affectedEntity: "categories",
    entityId: categoryId,
    newData: data,
  });

  return category;
}
