// =============================================================================
// @aurora/core — Root Public API
// Re-exports all modules for convenient single-import access.
// Consumers can import from "@aurora/core" or from individual modules
// like "@aurora/core/auth", "@aurora/core/cart", etc. (Req 1.2)
// =============================================================================

// ─── Module re-exports ────────────────────────────────────────────────────────

export * from "./auth/index.js";
export * from "./users/index.js";
export * from "./catalog/index.js";
export * from "./pricing/index.js";
export * from "./cart/index.js";
export * from "./inventory/index.js";
export * from "./orders/index.js";
export * from "./store-config/index.js";
export * from "./audit/index.js";

// ─── Shared utilities (only what's not already re-exported by modules) ────────

export type { Clock } from "./shared/clock.js";
export { SystemClock, createTestClock } from "./shared/clock.js";
export type { IAuditLogger, IInventoryService, IPricingService } from "./shared/interfaces.js";
