// =============================================================================
// @aurora/core/inventory — InventoryService
// Implementación de IInventoryService (cross-module contract) para que el módulo
// de orders pueda validar/deducir/revertir stock sin importar use cases concretos.
// Usa un callback `getOrderItems` inyectado en construcción para obtener los items
// de un pedido sin depender del módulo orders (Req 1.6, 7.1–7.8).
// =============================================================================

import type { StockValidationResult } from "@aurora/shared";
import type { IInventoryService, IAuditLogger } from "../../shared/interfaces.js";
import { AuditActions } from "../../shared/audit-actions.js";
import type { IInventoryRepository } from "../repositories/inventory.repository.interface.js";

/** Tipo del callback para obtener items de un pedido (inyectado desde apps/web) */
export type GetOrderItemsFn = (
  orderId: string,
) => Promise<Array<{ productId: string; productName: string; quantity: number }>>;

/**
 * Servicio de inventario cross-module.
 *
 * Implementa `IInventoryService` para que el módulo de orders pueda:
 * - Validar stock antes del checkout (RF029)
 * - Deducir stock al confirmar un pedido (RF028)
 * - Revertir stock al cancelar/expirar un pedido (RF047)
 *
 * La función `getOrderItems` se inyecta en el constructor para evitar que
 * el módulo inventory dependa directamente del módulo orders.
 */
export class InventoryService implements IInventoryService {
  private readonly repository: IInventoryRepository;
  private readonly auditLogger: IAuditLogger;
  private readonly getOrderItems: GetOrderItemsFn;

  constructor(
    repository: IInventoryRepository,
    auditLogger: IAuditLogger,
    getOrderItems: GetOrderItemsFn,
  ) {
    this.repository = repository;
    this.auditLogger = auditLogger;
    this.getOrderItems = getOrderItems;
  }

  async validateStockForItems(
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<StockValidationResult> {
    return this.repository.validateStockForItems(items);
  }

  async deductStockForOrder(orderId: string): Promise<void> {
    const items = await this.getOrderItems(orderId);

    for (const item of items) {
      await this.repository.deductStock(item.productId, item.quantity);
    }

    await this.auditLogger.log({
      userId: null,
      action: AuditActions.STOCK_DEDUCTED,
      affectedEntity: "orders",
      entityId: orderId,
      newData: { items },
    });
  }

  async revertStockForOrder(orderId: string): Promise<void> {
    const items = await this.getOrderItems(orderId);

    for (const item of items) {
      await this.repository.addStock(item.productId, item.quantity);
    }

    await this.auditLogger.log({
      userId: null,
      action: AuditActions.STOCK_REVERTED,
      affectedEntity: "orders",
      entityId: orderId,
      newData: { items },
    });
  }
}
