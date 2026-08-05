// =============================================================================
// apps/web/lib/branding.ts — Centralized branding service
//
// Single point of truth for the store logo across all components.
// Components MUST import the logo from here — never hardcode image paths directly.
//
// Uses React.cache() for per-request deduplication: no matter how many server
// components call getBranding() in the same request, Prisma is only hit once.
//
// Fallback strategy:
//   • If the store owner has uploaded a logo via Admin › Configuración, the DB
//     URL is returned.
//   • If no logo has been uploaded yet, the static public-folder fallback is
//     used so the store looks correct on a fresh deployment.
//
// The fallback file (/aurora.png) lives in public/ only as a zero-downtime
// safety net. It is NOT imported directly in any component.
// =============================================================================

import { cache } from "react";
import { prisma } from "@/lib/db";

// Static fallback (file in /public). Used when no logo has been uploaded yet.
const FALLBACK_LOGO = "/aurora.png";

export interface BrandingConfig {
  /** Store logo — used across navbar, footer, auth pages, emails, etc. */
  logoUrl: string;
  /** Storage key for the logo (used internally for deletion, null if fallback). */
  logoKey: string | null;
}

/**
 * Fetches the current branding configuration from the database.
 * Falls back to the static /public file if no logo has been uploaded yet.
 *
 * Server-only. Wrapped with React.cache() — multiple calls within the same
 * request are deduplicated to a single Prisma query automatically.
 */
export const getBranding = cache(async (): Promise<BrandingConfig> => {
  try {
    const config = await prisma.storeConfig.findFirst({
      select: {
        logoUrl: true,
        logoKey: true,
      },
    });

    return {
      logoUrl: config?.logoUrl ?? FALLBACK_LOGO,
      logoKey: config?.logoKey ?? null,
    };
  } catch {
    // If the DB is unreachable, fall back silently so the storefront still renders.
    return {
      logoUrl: FALLBACK_LOGO,
      logoKey: null,
    };
  }
});
