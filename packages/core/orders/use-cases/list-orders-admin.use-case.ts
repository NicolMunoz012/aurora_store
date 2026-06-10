// =============================================================================
// @aurora/core/orders — listOrdersAdminUseCase
// Lista todos los pedidos con filtros para el panel de administración (Req 8.15).
// =============================================================================

import type { OrderSummary } from "@aurora/shared";
import type { ListOrdersAdminParams } from "../types.js";

export async function listOrdersAdminUseCase(
  params: ListOrdersAdminParams,
): Promise<OrderSummary[]> {
  const { repository, filters } = params;

  return repository.listAll(filters);
}
