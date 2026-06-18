// =============================================================================
// @aurora/core/audit — logActionUseCase
// Registra una acción de auditoría. Implementa el contrato IAuditLogger
// de shared/interfaces.ts (Req 10.1, 10.2, 10.4).
// Acepta userId = null para procesos automatizados (Req 10.2).
// =============================================================================

import type { LogActionParams } from "../types";

export async function logActionUseCase(params: LogActionParams): Promise<void> {
  const { repository, data } = params;
  await repository.log(data);
}
