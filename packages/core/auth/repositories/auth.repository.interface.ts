// =============================================================================
// @aurora/core/auth — IAuthRepository
// Contrato puro de persistencia para el módulo de autenticación (Req 1.6, 2.1).
// Sin dependencias de Prisma ni de ninguna implementación concreta.
// =============================================================================

import type { UserProfile, UpsertUserFromProviderData } from "@aurora/shared";

/**
 * Repositorio de autenticación.
 * Define las operaciones de lectura/escritura de usuario que los Use Cases
 * del módulo auth necesitan, sin acoplarse a la capa de infraestructura.
 */
export interface IAuthRepository {
  /**
   * Busca un usuario por su ID.
   * @returns El perfil público del usuario o null si no existe.
   */
  findUserById(id: string): Promise<UserProfile | null>;

  /**
   * Busca un usuario por su email.
   * @returns El perfil público del usuario o null si no existe.
   */
  findUserByEmail(email: string): Promise<UserProfile | null>;

  /**
   * Crea o actualiza un usuario a partir de datos del proveedor OAuth externo.
   * Si el email ya existe, actualiza fullName y emailVerified.
   * Si no existe, crea el registro con role CLIENT por defecto.
   */
  upsertUserFromProvider(data: UpsertUserFromProviderData): Promise<UserProfile>;
}
