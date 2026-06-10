// =============================================================================
// @aurora/core/audit — Internal Types
// Tipos internos del módulo audit: parámetros de Use Cases con inyección
// de dependencias via interfaz de repositorio (Req 1.6, 10.1, 10.3).
// =============================================================================

import type { CreateAuditLogData, AuditFilters } from "@aurora/shared";
import type { IAuditRepository } from "./repositories/audit.repository.interface.js";

/** Parámetros para logActionUseCase */
export interface LogActionParams {
  repository: IAuditRepository;
  data: CreateAuditLogData;
}

/** Parámetros para listAuditLogUseCase */
export interface ListAuditLogParams {
  repository: IAuditRepository;
  filters: AuditFilters;
}
