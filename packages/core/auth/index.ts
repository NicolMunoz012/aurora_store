// =============================================================================
// @aurora/core/auth — Public API (barrel)
// Punto de entrada único del módulo auth. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases (primary public API)
export { getUserProfileUseCase } from "./use-cases/get-user-profile.use-case.js";
export { upsertUserFromProviderUseCase } from "./use-cases/upsert-user-from-provider.use-case.js";
export { verifyUserRoleUseCase } from "./use-cases/verify-user-role.use-case.js";

// Types (params for use cases)
export type {
  GetUserProfileParams,
  UpsertUserFromProviderParams,
  VerifyUserRoleParams,
} from "./types.js";

// Repository interface (for DI wiring in apps/web)
export type { IAuthRepository } from "./repositories/auth.repository.interface.js";

// Repository implementation (for DI wiring in apps/web)
export { PrismaAuthRepository } from "./repositories/auth.repository.js";
