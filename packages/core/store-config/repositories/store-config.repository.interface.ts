// =============================================================================
// @aurora/core/store-config — IStoreConfigRepository
// Contrato de acceso a datos para la configuración de la tienda (DA-003 singleton).
// =============================================================================

import type { StoreConfigRecord, UpdateStoreConfigData } from "@aurora/shared";

export interface IStoreConfigRepository {
  get(): Promise<StoreConfigRecord>;
  update(data: UpdateStoreConfigData): Promise<StoreConfigRecord>;
}
