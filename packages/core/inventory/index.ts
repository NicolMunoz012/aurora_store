// =============================================================================
// @aurora/core/inventory — Public API (barrel)
// Punto de entrada único del módulo inventory. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases (primary public API)
export { adjustStockUseCase } from "./use-cases/adjust-stock.use-case";
export { deductStockForOrderUseCase } from "./use-cases/deduct-stock-for-order.use-case";
export { revertStockForOrderUseCase } from "./use-cases/revert-stock-for-order.use-case";
export { getLowStockProductsUseCase } from "./use-cases/get-low-stock-products.use-case";
export { validateStockUseCase } from "./use-cases/validate-stock.use-case";

// Types (params for use cases)
export type {
  AdjustStockParams,
  DeductStockForOrderParams,
  RevertStockForOrderParams,
  GetLowStockProductsParams,
  ValidateStockParams,
} from "./types";

// Repository interface (for DI wiring in apps/web)
export type { IInventoryRepository } from "./repositories/inventory.repository.interface";

// Repository implementation (for DI wiring in apps/web)
export { PrismaInventoryRepository } from "./repositories/inventory.repository";

// Service (for DI wiring — implements IInventoryService cross-module contract)
export { InventoryService } from "./services/inventory.service";
export type { GetOrderItemsFn } from "./services/inventory.service";
