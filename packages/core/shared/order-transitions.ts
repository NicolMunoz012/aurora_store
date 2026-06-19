import { OrderStatus } from "@aurora/shared";

/**
 * Mapa de transiciones válidas para estados de pedido (RF008.8).
 * Cada clave define los estados destino permitidos desde ese estado.
 */
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_CONFIRMATION]: [
    OrderStatus.PENDING,
    OrderStatus.CANCELLED,
    OrderStatus.AUTO_CANCELLED,
  ],
  [OrderStatus.PENDING]: [OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED],
  [OrderStatus.IN_PREPARATION]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.AUTO_CANCELLED]: [],
};

/**
 * Verifica si una transición de estado de pedido es válida.
 */
export function isValidTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  const allowed = VALID_ORDER_TRANSITIONS[from];
  return allowed.includes(to);
}
