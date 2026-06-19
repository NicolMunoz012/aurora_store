// =============================================================================
// @aurora/core/users — Internal Types
// Tipos internos del módulo users: parámetros de Use Cases con inyección
// de dependencias via interfaz de repositorio (Req 1.6, 3.1–3.5).
// =============================================================================

import type { UpdateProfileData, CreateAddressData } from "@aurora/shared";
import type { IUsersRepository } from "./repositories/users.repository.interface";

/** Parámetros para getProfileUseCase */
export interface GetProfileParams {
  repository: IUsersRepository;
  userId: string;
}

/** Parámetros para updateProfileUseCase */
export interface UpdateProfileParams {
  repository: IUsersRepository;
  userId: string;
  data: UpdateProfileData;
}

/** Parámetros para listSavedAddressesUseCase */
export interface ListSavedAddressesParams {
  repository: IUsersRepository;
  userId: string;
}

/** Parámetros para addSavedAddressUseCase */
export interface AddSavedAddressParams {
  repository: IUsersRepository;
  userId: string;
  data: CreateAddressData;
}

/** Parámetros para removeSavedAddressUseCase */
export interface RemoveSavedAddressParams {
  repository: IUsersRepository;
  addressId: string;
  userId: string;
}
