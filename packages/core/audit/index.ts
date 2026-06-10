// =============================================================================
// @aurora/core/audit — Public API (barrel)
// Punto de entrada único del módulo audit. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases (primary public API)
export { logActionUseCase } from "./use-cases/log-action.use-case.js";
export { listAuditLogUseCase } from "./use-cases/list-audit-log.use-case.js";

// Types (params for use cases)
export type { LogActionParams, ListAuditLogParams } from "./types.js";

// Repository interface (for DI wiring in apps/web)
export type { IAuditRepository } from "./repositories/audit.repository.interface.js";

// Repository implementation (for DI wiring in apps/web)
export { PrismaAuditRepository } from "./repositories/audit.repository.js";

// Re-export audit actions from shared for convenience
export { AuditActions } from "../shared/audit-actions.js";
export type { AuditAction } from "../shared/audit-actions.js";
