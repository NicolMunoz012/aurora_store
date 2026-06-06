// =============================================================================
// @aurora/core/auth — upsertUserFromProviderUseCase
// Sincroniza un usuario desde un callback OAuth externo (Req 2.1).
// =============================================================================

import type { UserProfile } from "@aurora/shared";
import type { UpsertUserFromProviderParams } from "../types.js";

export async function upsertUserFromProviderUseCase(
  params: UpsertUserFromProviderParams,
): Promise<UserProfile> {
  const { repository, data } = params;
  return repository.upsertUserFromProvider(data);
}
