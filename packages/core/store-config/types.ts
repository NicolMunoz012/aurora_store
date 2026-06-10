// =============================================================================
// @aurora/core/store-config — Types
// Parámetros para los use cases de configuración de tienda.
// =============================================================================

import type { UpdateStoreConfigData } from "@aurora/shared";
import type { IStoreConfigRepository } from "./repositories/store-config.repository.interface.js";
import type { IAuditLogger } from "../shared/interfaces.js";

export interface GetStoreConfigParams {
  repository: IStoreConfigRepository;
}

export interface UpdateStoreConfigParams {
  repository: IStoreConfigRepository;
  auditLogger: IAuditLogger;
  data: UpdateStoreConfigData;
}
