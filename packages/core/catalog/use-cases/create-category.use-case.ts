// =============================================================================
// @aurora/core/catalog — createCategoryUseCase
// Crea una categoría con slug único y registro de auditoría (Req 4.9).
// =============================================================================

import type { CategoryRecord } from "@aurora/shared";
import { AuditActions } from "../../shared/audit-actions";
import { CategoryService } from "../services/category.service";
import type { CreateCategoryParams } from "../types";

export async function createCategoryUseCase(
  params: CreateCategoryParams,
): Promise<CategoryRecord> {
  const { categoryRepository, auditLogger, data } = params;

  // 1. Generate unique slug
  const categoryService = new CategoryService(categoryRepository);
  const slug = await categoryService.generateCategorySlug(data.name);

  // 2. Create category
  const category = await categoryRepository.createCategory({ ...data, slug });

  // 3. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.CATEGORY_CREATED,
    affectedEntity: "categories",
    entityId: category.id,
    newData: { name: data.name, slug },
  });

  return category;
}
