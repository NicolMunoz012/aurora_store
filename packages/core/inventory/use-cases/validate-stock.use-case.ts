// =============================================================================
// @aurora/core/inventory — validateStockUseCase
// Valida que haya stock suficiente para una lista de items (Req 7.8).
// =============================================================================

import type { StockValidationResult } from "@aurora/shared";
import type { ValidateStockParams } from "../types";

export async function validateStockUseCase(
  params: ValidateStockParams,
): Promise<StockValidationResult> {
  const { repository, items } = params;

  return repository.validateStockForItems(items);
}
