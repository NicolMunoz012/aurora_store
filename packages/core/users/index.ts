// =============================================================================
// @aurora/core/users — Public API (barrel)
// Punto de entrada único del módulo users. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases (primary public API)
export { getProfileUseCase } from "./use-cases/get-profile.use-case.js";
export { updateProfileUseCase } from "./use-cases/update-profile.use-case.js";
export { addSavedAddressUseCase } from "./use-cases/add-saved-address.use-case.js";
export { removeSavedAddressUseCase } from "./use-cases/remove-saved-address.use-case.js";
export { listSavedAddressesUseCase } from "./use-cases/list-saved-addresses.use-case.js";

// Types (params for use cases)
export type {
  GetProfileParams,
  UpdateProfileParams,
  ListSavedAddressesParams,
  AddSavedAddressParams,
  RemoveSavedAddressParams,
} from "./types.js";

// Repository interface (for DI wiring in apps/web)
export type { IUsersRepository } from "./repositories/users.repository.interface.js";

// Repository implementation (for DI wiring in apps/web)
export { PrismaUsersRepository } from "./repositories/users.repository.js";
