// =============================================================================
// @aurora/core/catalog — toggleCategoryActiveUseCase
// Activa o desactiva una categoría con advertencia de productos activos
// y registro de auditoría (Req 4.10, 4.11).
// =============================================================================

import { AuditActions } from "../../shared/audit-actions.js";
import { CategoryService } from "../services/category.service.js";
import type { ToggleCategoryActiveParams } from "../types.js";

export async function toggleCategoryActiveUseCase(
  params: ToggleCategoryActiveParams,
): Promise<{ activeProductCount: number }> {
  const { categoryRepository, auditLogger, categoryId, isActive } = params;

  // 1. Get active product count for warning
  const categoryService = new CategoryService(categoryRepository);
  const activeProductCount =
    await categoryService.getActiveProductCount(categoryId);

  // 2. Toggle active status
  await categoryRepository.setActiveStatus(categoryId, isActive);

  // 3. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.CATEGORY_DEACTIVATED,
    affectedEntity: "categories",
    entityId: categoryId,
    newData: { isActive, activeProductsAffected: activeProductCount },
  });

  // 4. Return active product count for caller to show as warning/info
  return { activeProductCount };
}
