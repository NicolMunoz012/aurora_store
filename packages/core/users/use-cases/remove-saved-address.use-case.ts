// =============================================================================
// @aurora/core/users — removeSavedAddressUseCase
// Elimina una dirección guardada de un usuario (Req 3.5).
// La validación de pertenencia se maneja en el repositorio.
// =============================================================================

import type { RemoveSavedAddressParams } from "../types";

export async function removeSavedAddressUseCase(
  params: RemoveSavedAddressParams,
): Promise<void> {
  const { repository, addressId, userId } = params;
  return repository.deleteSavedAddress(addressId, userId);
}
