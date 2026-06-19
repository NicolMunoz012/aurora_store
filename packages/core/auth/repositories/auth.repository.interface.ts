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
   * Busca un usuario por su email incluyendo el passwordHash.
   * Usado exclusivamente por el proveedor Credentials de Auth.js para verificar
   * la contraseña. Nunca exponer el hash fuera de la capa de autenticación.
   * @returns UserProfile extendido con passwordHash, o null si no existe.
   */
  findUserByEmailWithHash(
    email: string,
  ): Promise<(UserProfile & { passwordHash: string }) | null>;

  /**
   * Crea un nuevo usuario con credenciales (email + contraseña hasheada).
   * El role se asigna como CLIENT por defecto. Lanza error si el email ya existe.
   * @returns El perfil público del usuario recién creado.
   */
  createUserWithCredentials(data: {
    email: string;
    fullName: string;
    passwordHash: string;
    termsAccepted: boolean;
  }): Promise<UserProfile>;

  /**
   * Crea o actualiza un usuario a partir de datos del proveedor OAuth externo.
   * Si el email ya existe, actualiza fullName y emailVerified.
   * Si no existe, crea el registro con role CLIENT por defecto.
   */
  upsertUserFromProvider(data: UpsertUserFromProviderData): Promise<UserProfile>;
}
