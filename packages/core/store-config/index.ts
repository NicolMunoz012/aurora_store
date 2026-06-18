// =============================================================================
// @aurora/core/store-config — Public API (barrel)
// Punto de entrada único del módulo store-config. Los consumidores (apps/web)
// deben importar exclusivamente desde este archivo (Req 1.2).
// =============================================================================

// Use cases (primary public API)
export { getStoreConfigUseCase } from "./use-cases/get-store-config.use-case";
export { updateStoreConfigUseCase } from "./use-cases/update-store-config.use-case";

// Types (params for use cases)
export type {
  GetStoreConfigParams,
  UpdateStoreConfigParams,
} from "./types";

// Repository interface (for DI wiring in apps/web)
export type { IStoreConfigRepository } from "./repositories/store-config.repository.interface";

// Repository implementation (for DI wiring in apps/web)
export { PrismaStoreConfigRepository } from "./repositories/store-config.repository";
