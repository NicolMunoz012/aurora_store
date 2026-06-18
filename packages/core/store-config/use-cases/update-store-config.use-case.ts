// =============================================================================
// @aurora/core/store-config — updateStoreConfigUseCase
// Actualiza la configuración de la tienda y registra auditoría (Req 9.3, 9.4).
// =============================================================================

import type { StoreConfigRecord } from "@aurora/shared";
import { AuditActions } from "../../shared/audit-actions";
import type { UpdateStoreConfigParams } from "../types";

export async function updateStoreConfigUseCase(
  params: UpdateStoreConfigParams,
): Promise<StoreConfigRecord> {
  const { repository, auditLogger, data } = params;

  // 1. Get current config (for audit previousData)
  const currentConfig = await repository.get();

  // 2. Update config
  const updatedConfig = await repository.update(data);

  // 3. Log audit
  await auditLogger.log({
    userId: null,
    action: AuditActions.STORE_CONFIG_UPDATED,
    affectedEntity: "store_config",
    entityId: currentConfig.id,
    previousData: currentConfig,
    newData: data,
  });

  // 4. Return updated config
  return updatedConfig;
}
