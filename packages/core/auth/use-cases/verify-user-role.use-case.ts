// =============================================================================
// @aurora/core/auth — verifyUserRoleUseCase
// Verifica si un usuario tiene un rol esperado (Req 2.3).
// =============================================================================

import type { VerifyUserRoleParams } from "../types.js";

export async function verifyUserRoleUseCase(
  params: VerifyUserRoleParams,
): Promise<boolean> {
  const { repository, userId, expectedRole } = params;
  const user = await repository.findUserById(userId);
  if (user === null) {
    return false;
  }
  return user.role === expectedRole;
}
