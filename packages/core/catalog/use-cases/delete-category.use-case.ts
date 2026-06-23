// =============================================================================
// @aurora/core/catalog — deleteCategoryUseCase
// Elimina permanentemente una categoría. Los productos quedan con
// categoryId = null gracias a onDelete: SetNull en el schema.
// =============================================================================

import { AuditActions } from "../../shared/audit-actions";
import type { IAuditLogger } from "../../shared/interfaces";
import type { ICategoryRepository } from "../repositories/category.repository.interface";

export interface DeleteCategoryParams {
  categoryRepository: ICategoryRepository;
  auditLogger: IAuditLogger;
  categoryId: string;
}

export async function deleteCategoryUseCase(
  params: DeleteCategoryParams,
): Promise<void> {
  const { categoryRepository, auditLogger, categoryId } = params;

  // 1. Delete — products are automatically orphaned (categoryId → null)
  await categoryRepository.deleteCategory(categoryId);

  // 2. Audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.CATEGORY_DEACTIVATED, // reuse existing constant
    affectedEntity: "categories",
    entityId: categoryId,
    newData: { deleted: true },
  });
}
