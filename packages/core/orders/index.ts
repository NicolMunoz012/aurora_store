// =============================================================================
// @aurora/core/orders — Public API (barrel)
// Punto de entrada único del módulo orders. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases — Main
export { createOrderUseCase } from "./use-cases/create-order.use-case.js";
export { getOrderUseCase } from "./use-cases/get-order.use-case.js";
export { listOrdersByUserUseCase } from "./use-cases/list-orders-by-user.use-case.js";
export { listOrdersAdminUseCase } from "./use-cases/list-orders-admin.use-case.js";

// Use cases — State management
export { updateOrderStatusUseCase } from "./use-cases/update-order-status.use-case.js";
export { cancelOrderUseCase } from "./use-cases/cancel-order.use-case.js";
export { expirePendingOrdersUseCase } from "./use-cases/expire-pending-orders.use-case.js";
export { generateWhatsappMessageUseCase } from "./use-cases/generate-whatsapp-message.use-case.js";

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
} from "./types.js";

// Repository interface (for DI wiring in apps/web)
export type { IOrdersRepository } from "./repositories/orders.repository.interface.js";

// Repository implementation (for DI wiring in apps/web)
export { PrismaOrdersRepository } from "./repositories/orders.repository.js";

// Re-export order transitions for convenience
export { VALID_ORDER_TRANSITIONS, isValidTransition } from "../shared/order-transitions.js";
