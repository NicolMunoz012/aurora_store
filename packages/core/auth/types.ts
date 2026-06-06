// =============================================================================
// @aurora/core/auth — Internal Types
// Tipos internos del módulo auth: parámetros de Use Cases con inyección
// de dependencias via interfaz de repositorio (Req 1.6, 2.1, 2.2, 2.3).
// =============================================================================

import type { Role, UpsertUserFromProviderData } from "@aurora/shared";
import type { IAuthRepository } from "./repositories/auth.repository.interface.js";

/** Parámetros para getUserProfileUseCase */
export interface GetUserProfileParams {
  repository: IAuthRepository;
  userId: string;
}

/** Parámetros para upsertUserFromProviderUseCase */
export interface UpsertUserFromProviderParams {
  repository: IAuthRepository;
  data: UpsertUserFromProviderData;
}

/** Parámetros para verifyUserRoleUseCase */
export interface VerifyUserRoleParams {
  repository: IAuthRepository;
  userId: string;
  expectedRole: Role;
}
