// =============================================================================
// @aurora/core/inventory — Internal Types
// Tipos internos del módulo inventory: parámetros de Use Cases con inyección
// de dependencias via interfaz de repositorio (Req 1.6, 7.1–7.8).
// =============================================================================

import type { IAuditLogger } from "../shared/interfaces.js";
import type { IInventoryRepository } from "./repositories/inventory.repository.interface.js";

/** Parámetros para adjustStockUseCase (RF032) */
export interface AdjustStockParams {
  repository: IInventoryRepository;
  auditLogger: IAuditLogger;
  productId: string;
  newStock: number;
  note?: string;
}

/** Parámetros para deductStockForOrderUseCase (RF028) */
export interface DeductStockForOrderParams {
  repository: IInventoryRepository;
  auditLogger: IAuditLogger;
  orderId: string;
  items: Array<{ productId: string; productName: string; quantity: number }>;
}

/** Parámetros para revertStockForOrderUseCase (RF047) */
export interface RevertStockForOrderParams {
  repository: IInventoryRepository;
  auditLogger: IAuditLogger;
  orderId: string;
  items: Array<{ productId: string; productName: string; quantity: number }>;
}

/** Parámetros para getLowStockProductsUseCase (RF031) */
export interface GetLowStockProductsParams {
  repository: IInventoryRepository;
}

/** Parámetros para validateStockUseCase (RF029) */
export interface ValidateStockParams {
  repository: IInventoryRepository;
  items: Array<{ productId: string; quantity: number }>;
}
