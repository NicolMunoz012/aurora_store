// =============================================================================
// @aurora/core/auth — getUserProfileUseCase
// Obtiene el perfil público de un usuario por su ID (Req 2.2).
// =============================================================================

import type { UserProfile } from "@aurora/shared";
import type { GetUserProfileParams } from "../types.js";

export async function getUserProfileUseCase(
  params: GetUserProfileParams,
): Promise<UserProfile | null> {
  const { repository, userId } = params;
  return repository.findUserById(userId);
}
