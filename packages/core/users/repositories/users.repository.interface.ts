// =============================================================================
// @aurora/core/users — IUsersRepository
// Contrato puro de persistencia para el módulo de usuarios (Req 1.6, 3.1–3.5).
// Sin dependencias de Prisma ni de ninguna implementación concreta.
// =============================================================================

import type {
  UserProfile,
  SavedAddressRecord,
  UpdateProfileData,
  CreateAddressData,
} from "@aurora/shared";

/**
 * Repositorio de usuarios.
 * Define las operaciones de lectura/escritura que los Use Cases
 * del módulo users necesitan, sin acoplarse a la capa de infraestructura.
 */
export interface IUsersRepository {
  /**
   * Busca un usuario por su ID.
   * @returns El perfil público del usuario o null si no existe.
   */
  findById(id: string): Promise<UserProfile | null>;

  /**
   * Actualiza el perfil de un usuario.
   * @returns El perfil actualizado.
   */
  updateProfile(userId: string, data: UpdateProfileData): Promise<UserProfile>;

  /**
   * Busca un usuario por su email.
   * Retorna solo id y email para validaciones de unicidad.
   */
  findByEmail(email: string): Promise<{ id: string; email: string } | null>;

  /**
   * Lista las direcciones guardadas de un usuario, ordenadas por createdAt DESC.
   */
  listSavedAddresses(userId: string): Promise<SavedAddressRecord[]>;

  /**
   * Crea una dirección guardada para un usuario.
   * @returns La dirección creada.
   */
  createSavedAddress(
    userId: string,
    data: CreateAddressData,
  ): Promise<SavedAddressRecord>;

  /**
   * Elimina una dirección guardada.
   * Verifica que la dirección pertenezca al usuario antes de eliminar.
   * @throws AuroraError si la dirección no pertenece al usuario.
   */
  deleteSavedAddress(addressId: string, userId: string): Promise<void>;
}
