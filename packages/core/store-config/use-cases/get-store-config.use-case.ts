// =============================================================================
// @aurora/core/store-config — getStoreConfigUseCase
// Obtiene la configuración singleton de la tienda (Req 9.1, 9.2).
// =============================================================================

import type { StoreConfigRecord } from "@aurora/shared";
import type { GetStoreConfigParams } from "../types";

export async function getStoreConfigUseCase(
  params: GetStoreConfigParams,
): Promise<StoreConfigRecord> {
  const { repository } = params;
  return repository.get();
}
