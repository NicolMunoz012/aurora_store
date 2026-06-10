// =============================================================================
// @aurora/core/users — getProfileUseCase
// Obtiene el perfil público de un usuario por su ID (Req 3.1).
// Retorna UserProfile sin passwordHash.
// =============================================================================

import type { UserProfile } from "@aurora/shared";
import type { GetProfileParams } from "../types.js";

export async function getProfileUseCase(
  params: GetProfileParams,
): Promise<UserProfile | null> {
  const { repository, userId } = params;
  return repository.findById(userId);
}
