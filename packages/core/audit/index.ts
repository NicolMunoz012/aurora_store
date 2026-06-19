// =============================================================================
// @aurora/core/audit — Public API (barrel)
// Punto de entrada único del módulo audit. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases (primary public API)
export { logActionUseCase } from "./use-cases/log-action.use-case";
export { listAuditLogUseCase } from "./use-cases/list-audit-log.use-case";

// Types (params for use cases)
export type { LogActionParams, ListAuditLogParams } from "./types";

// Repository interface (for DI wiring in apps/web)
export type { IAuditRepository } from "./repositories/audit.repository.interface";

// Repository implementation (for DI wiring in apps/web)
export { PrismaAuditRepository } from "./repositories/audit.repository";

// Re-export audit actions from shared for convenience
export { AuditActions } from "../shared/audit-actions";
export type { AuditAction } from "../shared/audit-actions";
