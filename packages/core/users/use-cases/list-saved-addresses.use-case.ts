// =============================================================================
// @aurora/core/users — listSavedAddressesUseCase
// Retorna las direcciones guardadas de un usuario ordenadas por createdAt DESC
// (Req 3.3).
// =============================================================================

import type { SavedAddressRecord } from "@aurora/shared";
import type { ListSavedAddressesParams } from "../types";

export async function listSavedAddressesUseCase(
  params: ListSavedAddressesParams,
): Promise<SavedAddressRecord[]> {
  const { repository, userId } = params;
  return repository.listSavedAddresses(userId);
}
