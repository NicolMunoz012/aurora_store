// =============================================================================
// @aurora/core/catalog — Public API (barrel)
// Punto de entrada único del módulo catalog. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases — Products (primary public API)
export { listProductsUseCase } from "./use-cases/list-products.use-case.js";
export { getProductBySlugUseCase } from "./use-cases/get-product-by-slug.use-case.js";
export { searchProductsUseCase } from "./use-cases/search-products.use-case.js";
export { createProductUseCase } from "./use-cases/create-product.use-case.js";
export { updateProductUseCase } from "./use-cases/update-product.use-case.js";
export { toggleProductActiveUseCase } from "./use-cases/toggle-product-active.use-case.js";

// Use cases — Categories
export { createCategoryUseCase } from "./use-cases/create-category.use-case.js";
export { updateCategoryUseCase } from "./use-cases/update-category.use-case.js";
export { toggleCategoryActiveUseCase } from "./use-cases/toggle-category-active.use-case.js";

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
} from "./types.js";

// Repository interfaces (for DI wiring in apps/web)
export type { ICatalogRepository } from "./repositories/catalog.repository.interface.js";
export type { ICategoryRepository } from "./repositories/category.repository.interface.js";

// Repository implementations (for DI wiring in apps/web)
export { PrismaCatalogRepository } from "./repositories/catalog.repository.js";
export { PrismaCategoryRepository } from "./repositories/category.repository.js";

// Services (for DI wiring in apps/web)
export { CatalogService } from "./services/catalog.service.js";
export { CategoryService } from "./services/category.service.js";
