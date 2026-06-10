// =============================================================================
// @aurora/core/inventory — Public API (barrel)
// Punto de entrada único del módulo inventory. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases (primary public API)
export { adjustStockUseCase } from "./use-cases/adjust-stock.use-case.js";
export { deductStockForOrderUseCase } from "./use-cases/deduct-stock-for-order.use-case.js";
export { revertStockForOrderUseCase } from "./use-cases/revert-stock-for-order.use-case.js";
export { getLowStockProductsUseCase } from "./use-cases/get-low-stock-products.use-case.js";
export { validateStockUseCase } from "./use-cases/validate-stock.use-case.js";

// Types (params for use cases)
export type {
  AdjustStockParams,
  DeductStockForOrderParams,
  RevertStockForOrderParams,
  GetLowStockProductsParams,
  ValidateStockParams,
} from "./types.js";

// Repository interface (for DI wiring in apps/web)
export type { IInventoryRepository } from "./repositories/inventory.repository.interface.js";

// Repository implementation (for DI wiring in apps/web)
export { PrismaInventoryRepository } from "./repositories/inventory.repository.js";

// Service (for DI wiring — implements IInventoryService cross-module contract)
export { InventoryService } from "./services/inventory.service.js";
export type { GetOrderItemsFn } from "./services/inventory.service.js";
