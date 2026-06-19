// =============================================================================
// @aurora/core/audit — listAuditLogUseCase
// Consulta registros de auditoría con filtros opcionales (Req 10.3).
// =============================================================================

import type { AuditLogRecord } from "@aurora/shared";
import type { ListAuditLogParams } from "../types";

export async function listAuditLogUseCase(
  params: ListAuditLogParams,
): Promise<AuditLogRecord[]> {
  const { repository, filters } = params;
  return repository.list(filters);
}
