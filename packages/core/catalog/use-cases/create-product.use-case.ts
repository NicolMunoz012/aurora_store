// =============================================================================
// @aurora/core/catalog — createProductUseCase
// Crea un producto con validación de imágenes, nombre único y slug único (Req 4.5, 4.6).
// =============================================================================

import type { ProductDetail, InternalProductDetail } from "@aurora/shared";
import { ProductRequiresImageError, ProductDuplicateNameError } from "@aurora/shared";
import type { CreateProductParams } from "../types";
import { CatalogService } from "../services/catalog.service";
import { AuditActions } from "../../shared/audit-actions";

function toPublicProductDetail(internal: InternalProductDetail): ProductDetail {
  const { wholesalePrice, ...publicDetail } = internal;
  return publicDetail;
}

export async function createProductUseCase(
  params: CreateProductParams,
): Promise<ProductDetail> {
  const { repository, auditLogger, data } = params;

  // 1. Validate at least 1 image
  if (data.images.length < 1) {
    throw new ProductRequiresImageError();
  }

  // 2. Check for duplicate name (case-insensitive, trim-aware)
  const isDuplicate = await repository.nameExistsForOther(data.name);
  if (isDuplicate) {
    throw new ProductDuplicateNameError(data.name.trim());
  }

  // 3. Generate unique slug
  const catalogService = new CatalogService(repository);
  const slug = await catalogService.generateProductSlug(data.name);

  // 4. Create product
  const product = await repository.createProduct({ ...data, slug });

  // 5. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.PRODUCT_CREATED,
    affectedEntity: "products",
    entityId: product.id,
    newData: { name: data.name, slug },
  });

  // 6. Return public detail (without wholesalePrice)
  return toPublicProductDetail(product);
}
