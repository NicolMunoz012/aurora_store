// =============================================================================
// @aurora/core — Root Public API
// Re-exports all modules for convenient single-import access.
// Consumers can import from "@aurora/core" or from individual modules
// like "@aurora/core/auth", "@aurora/core/cart", etc. (Req 1.2)
// =============================================================================

// ─── Module re-exports ────────────────────────────────────────────────────────

export * from "./auth/index";
export * from "./users/index";
export * from "./catalog/index";
export * from "./pricing/index";
export * from "./cart/index";
export * from "./inventory/index";
export * from "./orders/index";
export * from "./store-config/index";
export * from "./audit/index";

// ─── Shared utilities (only what's not already re-exported by modules) ────────

export type { Clock } from "./shared/clock";
export { SystemClock, createTestClock } from "./shared/clock";
export type { IAuditLogger, IInventoryService, IPricingService } from "./shared/interfaces";
