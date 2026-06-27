// =============================================================================
// @aurora/core/catalog — updateProductUseCase
// Actualiza un producto existente con registro de auditoría (Req 4.7).
// Valida nombre único (case-insensitive) e imagen mínima cuando se proveen imágenes.
// =============================================================================

import type { ProductDetail, InternalProductDetail } from "@aurora/shared";
import { ProductNotFoundError, ProductDuplicateNameError, ProductRequiresImageError } from "@aurora/shared";
import type { UpdateProductParams } from "../types";
import { AuditActions } from "../../shared/audit-actions";

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

  // 2. If name is changing, check for duplicates (exclude current product)
  if (data.name !== undefined && data.name.trim().toLowerCase() !== existing.name.trim().toLowerCase()) {
    const isDuplicate = await repository.nameExistsForOther(data.name, productId);
    if (isDuplicate) {
      throw new ProductDuplicateNameError(data.name.trim());
    }
  }

  // 3. If images are provided, require at least 1
  if (data.images !== undefined && data.images.length < 1) {
    throw new ProductRequiresImageError();
  }

  // 4. Update product (repository handles image sync internally when data.images is set)
  const updated = await repository.updateProduct(productId, data);

  // 5. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.PRODUCT_UPDATED,
    affectedEntity: "products",
    entityId: productId,
    previousData: { name: existing.name },
    newData: data,
  });

  // 6. Return public detail (without wholesalePrice)
  return toPublicProductDetail(updated);
}
