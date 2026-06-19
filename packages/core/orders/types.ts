// =============================================================================
// @aurora/core/orders — Module Types
// Parámetros tipados para cada use case del módulo orders (Req 8.1–8.15, 1.6).
// Cada interfaz encapsula las dependencias y datos necesarios para un use case,
// siguiendo el patrón de inyección explícita de dependencias.
// =============================================================================

import type { CreateOrderData, AdminOrderFilters, OrderStatus } from "@aurora/shared";
import type { IOrdersRepository } from "./repositories/orders.repository.interface";
import type { IAuditLogger, IInventoryService } from "../shared/interfaces";
import type { Clock } from "../shared/clock";

export interface CreateOrderParams {
  repository: IOrdersRepository;
  inventoryService: IInventoryService;
  auditLogger: IAuditLogger;
  clock: Clock;
  data: CreateOrderData;
  cartItems: Array<{ productId: string; quantity: number }>;
}

export interface GetOrderParams {
  repository: IOrdersRepository;
  orderId: string;
  userId?: string | null; // if provided, validate ownership
}

export interface ListOrdersByUserParams {
  repository: IOrdersRepository;
  userId: string;
}

export interface ListOrdersAdminParams {
  repository: IOrdersRepository;
  filters: AdminOrderFilters;
}

export interface UpdateOrderStatusParams {
  repository: IOrdersRepository;
  inventoryService: IInventoryService;
  auditLogger: IAuditLogger;
  orderId: string;
  newStatus: OrderStatus;
  trackingNumber?: string | null;
}

export interface CancelOrderParams {
  repository: IOrdersRepository;
  inventoryService: IInventoryService;
  auditLogger: IAuditLogger;
  orderId: string;
}

export interface ExpirePendingOrdersParams {
  repository: IOrdersRepository;
  auditLogger: IAuditLogger;
  clock: Clock;
}

export interface GenerateWhatsappMessageParams {
  repository: IOrdersRepository;
  orderId: string;
  whatsappNumber: string;
}
