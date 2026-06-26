// =============================================================================
// @aurora/core/orders — IOrdersRepository Interface
// Contrato del repositorio de pedidos (Req 1.6, 8.1–8.15).
// Define las operaciones de acceso a datos de pedidos sin acoplar a Prisma.
// =============================================================================

import type {
  OrderWithItems,
  OrderSummary,
  OrderRecord,
  CreateOrderData,
  AdminOrderFilters,
  OrderStatus,
  UpdateOrderExtra,
} from "@aurora/shared";

export interface IOrdersRepository {
  createOrder(data: CreateOrderData): Promise<OrderRecord>;
  findById(id: string): Promise<OrderWithItems | null>;
  listByUserId(userId: string): Promise<OrderSummary[]>;
  listAll(filters: AdminOrderFilters): Promise<OrderSummary[]>;
  updateStatus(id: string, status: OrderStatus, extra?: UpdateOrderExtra): Promise<OrderRecord>;
  findExpiredPendingOrders(now: Date): Promise<OrderRecord[]>;
  markStockDeducted(orderId: string): Promise<void>;
  deleteById(id: string): Promise<void>;
}
