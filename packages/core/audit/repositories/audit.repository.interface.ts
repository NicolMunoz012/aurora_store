// =============================================================================
// @aurora/core/audit — IAuditRepository
// Contrato del repositorio de auditoría. Define las operaciones de persistencia
// para el módulo de auditoría (Req 10.1, 10.3).
// =============================================================================

import type { CreateAuditLogData, AuditFilters, AuditLogRecord } from "@aurora/shared";

export interface IAuditRepository {
  log(data: CreateAuditLogData): Promise<void>;
  list(filters: AuditFilters): Promise<AuditLogRecord[]>;
}
