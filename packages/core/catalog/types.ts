// =============================================================================
// @aurora/core/catalog — Internal Types
// Tipos internos del módulo catalog: parámetros de Use Cases con inyección
// de dependencias via interfaz de repositorio (Req 4.1–4.12).
// =============================================================================

import type {
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  CreateCategoryData,
  UpdateCategoryData,
} from "@aurora/shared";
import type { ICatalogRepository } from "./repositories/catalog.repository.interface.js";
import type { ICategoryRepository } from "./repositories/category.repository.interface.js";
import type { IAuditLogger } from "../shared/interfaces.js";

// ─── Product Use Case Params ──────────────────────────────────────────────────

/** Parámetros para listProductsUseCase */
export interface ListProductsParams {
  repository: ICatalogRepository;
  filters?: ProductFilters;
}

/** Parámetros para getProductBySlugUseCase */
export interface GetProductBySlugParams {
  repository: ICatalogRepository;
  slug: string;
}

/** Parámetros para searchProductsUseCase */
export interface SearchProductsParams {
  repository: ICatalogRepository;
  query: string;
}

/** Parámetros para createProductUseCase */
export interface CreateProductParams {
  repository: ICatalogRepository;
  auditLogger: IAuditLogger;
  data: CreateProductData;
}

/** Parámetros para updateProductUseCase */
export interface UpdateProductParams {
  repository: ICatalogRepository;
  auditLogger: IAuditLogger;
  productId: string;
  data: UpdateProductData;
}

/** Parámetros para toggleProductActiveUseCase */
export interface ToggleProductActiveParams {
  repository: ICatalogRepository;
  auditLogger: IAuditLogger;
  productId: string;
  isActive: boolean;
}

// ─── Category Use Case Params ─────────────────────────────────────────────────

/** Parámetros para createCategoryUseCase */
export interface CreateCategoryParams {
  categoryRepository: ICategoryRepository;
  auditLogger: IAuditLogger;
  data: CreateCategoryData;
}

/** Parámetros para updateCategoryUseCase */
export interface UpdateCategoryParams {
  categoryRepository: ICategoryRepository;
  auditLogger: IAuditLogger;
  categoryId: string;
  data: UpdateCategoryData;
}

/** Parámetros para toggleCategoryActiveUseCase */
export interface ToggleCategoryActiveParams {
  categoryRepository: ICategoryRepository;
  auditLogger: IAuditLogger;
  categoryId: string;
  isActive: boolean;
}
