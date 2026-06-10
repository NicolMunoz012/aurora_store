// =============================================================================
// @aurora/core/users — updateProfileUseCase
// Actualiza el perfil de un usuario. Valida unicidad de email (Req 3.2).
// Lanza EmailAlreadyInUseError si el nuevo email ya pertenece a otro usuario.
// =============================================================================

import type { UserProfile } from "@aurora/shared";
import { EmailAlreadyInUseError } from "@aurora/shared";
import type { UpdateProfileParams } from "../types.js";

export async function updateProfileUseCase(
  params: UpdateProfileParams,
): Promise<UserProfile> {
  const { repository, userId, data } = params;

  // Si se está cambiando el email, verificar unicidad
  if (data.email !== undefined) {
    const existingUser = await repository.findByEmail(data.email);

    // Si ya existe un usuario con ese email y NO es el mismo usuario, error
    if (existingUser && existingUser.id !== userId) {
      throw new EmailAlreadyInUseError();
    }
  }

  return repository.updateProfile(userId, data);
}
