// =============================================================================
// @aurora/core/users — addSavedAddressUseCase
// Persiste una nueva dirección guardada para un usuario (Req 3.4).
// Retorna el SavedAddressRecord creado.
// =============================================================================

import type { SavedAddressRecord } from "@aurora/shared";
import type { AddSavedAddressParams } from "../types.js";

export async function addSavedAddressUseCase(
  params: AddSavedAddressParams,
): Promise<SavedAddressRecord> {
  const { repository, userId, data } = params;
  return repository.createSavedAddress(userId, data);
}
