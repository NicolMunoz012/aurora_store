// =============================================================================
// @aurora/core/auth — Public API (barrel)
// Punto de entrada único del módulo auth. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases (primary public API)
export { getUserProfileUseCase } from "./use-cases/get-user-profile.use-case";
export { upsertUserFromProviderUseCase } from "./use-cases/upsert-user-from-provider.use-case";
export { verifyUserRoleUseCase } from "./use-cases/verify-user-role.use-case";
export { registerClientUseCase } from "./use-cases/register-client.use-case";

// Types (params for use cases)
export type {
  GetUserProfileParams,
  UpsertUserFromProviderParams,
  VerifyUserRoleParams,
} from "./types";
export type { RegisterClientParams } from "./use-cases/register-client.use-case";

// Repository interface (for DI wiring in apps/web)
export type { IAuthRepository } from "./repositories/auth.repository.interface";

// Repository implementation (for DI wiring in apps/web)
export { PrismaAuthRepository } from "./repositories/auth.repository";

// Password reset use cases
export { requestPasswordResetUseCase } from "./use-cases/request-password-reset.use-case";
export { resetPasswordUseCase } from "./use-cases/reset-password.use-case";
export type { RequestPasswordResetParams } from "./use-cases/request-password-reset.use-case";
export type { ResetPasswordParams } from "./use-cases/reset-password.use-case";

// Token repository
export type { IVerificationTokenRepository } from "./repositories/token.repository.interface";
export { PrismaVerificationTokenRepository } from "./repositories/token.repository";
