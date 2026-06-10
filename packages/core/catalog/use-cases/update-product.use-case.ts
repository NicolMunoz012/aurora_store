// =============================================================================
// @aurora/core/catalog — updateProductUseCase
// Actualiza un producto existente con registro de auditoría (Req 4.7).
// =============================================================================

import type { ProductDetail, InternalProductDetail } from "@aurora/shared";
import { ProductNotFoundError } from "@aurora/shared";
import type { UpdateProductParams } from "../types.js";
import { AuditActions } from "../../shared/audit-actions.js";

function toPublicProductDetail(internal: InternalProductDetail): ProductDetail {
  const { wholesalePrice, ...publicDetail } = internal;
  return publicDetail;
}

export async function updateProductUseCase(
  params: UpdateProductParams,
): Promise<ProductDetail> {
  const { repository, auditLogger, productId, data } = params;

  // 1. Verify product exists
  const existing = await repository.findById(productId);
  if (!existing) {
    throw new ProductNotFoundError();
  }

  // 2. Update product
  const updated = await repository.updateProduct(productId, data);

  // 3. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.PRODUCT_UPDATED,
    affectedEntity: "products",
    entityId: productId,
    previousData: { name: existing.name },
    newData: data,
  });

  // 4. Return public detail (without wholesalePrice)
  return toPublicProductDetail(updated);
}
