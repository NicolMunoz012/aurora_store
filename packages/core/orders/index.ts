// =============================================================================
// @aurora/core/orders — Public API (barrel)
// Punto de entrada único del módulo orders. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases — Main
export { createOrderUseCase } from "./use-cases/create-order.use-case";
export { getOrderUseCase } from "./use-cases/get-order.use-case";
export { listOrdersByUserUseCase } from "./use-cases/list-orders-by-user.use-case";
export { listOrdersAdminUseCase } from "./use-cases/list-orders-admin.use-case";

// Use cases — State management
export { updateOrderStatusUseCase } from "./use-cases/update-order-status.use-case";
export { cancelOrderUseCase } from "./use-cases/cancel-order.use-case";
export { expirePendingOrdersUseCase } from "./use-cases/expire-pending-orders.use-case";
export { generateWhatsappMessageUseCase } from "./use-cases/generate-whatsapp-message.use-case";

// Types (params for use cases)
export type {
  CreateOrderParams,
  GetOrderParams,
  ListOrdersByUserParams,
  ListOrdersAdminParams,
  UpdateOrderStatusParams,
  CancelOrderParams,
  ExpirePendingOrdersParams,
  GenerateWhatsappMessageParams,
} from "./types";

// Repository interface (for DI wiring in apps/web)
export type { IOrdersRepository } from "./repositories/orders.repository.interface";

// Repository implementation (for DI wiring in apps/web)
export { PrismaOrdersRepository } from "./repositories/orders.repository";

// Re-export order transitions for convenience
export { VALID_ORDER_TRANSITIONS, isValidTransition } from "../shared/order-transitions";
