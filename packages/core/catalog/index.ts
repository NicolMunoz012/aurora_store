// =============================================================================
// @aurora/core/catalog — Public API (barrel)
// Punto de entrada único del módulo catalog. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases — Products (primary public API)
export { listProductsUseCase } from "./use-cases/list-products.use-case";
export { getProductBySlugUseCase } from "./use-cases/get-product-by-slug.use-case";
export { searchProductsUseCase } from "./use-cases/search-products.use-case";
export { createProductUseCase } from "./use-cases/create-product.use-case";
export { updateProductUseCase } from "./use-cases/update-product.use-case";
export { toggleProductActiveUseCase } from "./use-cases/toggle-product-active.use-case";

// Use cases — Categories
export { createCategoryUseCase } from "./use-cases/create-category.use-case";
export { updateCategoryUseCase } from "./use-cases/update-category.use-case";
export { toggleCategoryActiveUseCase } from "./use-cases/toggle-category-active.use-case";
export { deleteCategoryUseCase } from "./use-cases/delete-category.use-case";
export type { DeleteCategoryParams } from "./use-cases/delete-category.use-case";

// Types (params for use cases)
export type {
  ListProductsParams,
  GetProductBySlugParams,
  SearchProductsParams,
  CreateProductParams,
  UpdateProductParams,
  ToggleProductActiveParams,
  CreateCategoryParams,
  UpdateCategoryParams,
  ToggleCategoryActiveParams,
} from "./types";

// Repository interfaces (for DI wiring in apps/web)
export type { ICatalogRepository } from "./repositories/catalog.repository.interface";
export type { ICategoryRepository } from "./repositories/category.repository.interface";

// Repository implementations (for DI wiring in apps/web)
export { PrismaCatalogRepository } from "./repositories/catalog.repository";
export { PrismaCategoryRepository } from "./repositories/category.repository";

// Services (for DI wiring in apps/web)
export { CatalogService } from "./services/catalog.service";
export { CategoryService } from "./services/category.service";
