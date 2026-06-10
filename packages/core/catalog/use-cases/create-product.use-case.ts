// =============================================================================
// @aurora/core/catalog — createProductUseCase
// Crea un producto con validación de imágenes y slug único (Req 4.5, 4.6).
// =============================================================================

import type { ProductDetail, InternalProductDetail } from "@aurora/shared";
import { ProductRequiresImageError } from "@aurora/shared";
import type { CreateProductParams } from "../types.js";
import { CatalogService } from "../services/catalog.service.js";
import { AuditActions } from "../../shared/audit-actions.js";

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

  // 2. Generate unique slug
  const catalogService = new CatalogService(repository);
  const slug = await catalogService.generateProductSlug(data.name);

  // 3. Create product
  const product = await repository.createProduct({ ...data, slug });

  // 4. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.PRODUCT_CREATED,
    affectedEntity: "products",
    entityId: product.id,
    newData: { name: data.name, slug },
  });

  // 5. Return public detail (without wholesalePrice)
  return toPublicProductDetail(product);
}
