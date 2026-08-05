// =============================================================================
// apps/web/lib/branding.ts — Centralized branding service
//
// Single point of truth for logo URLs across all components.
// Components MUST import logos from here — never hardcode image paths directly.
//
// Uses React.cache() for per-request deduplication: no matter how many server
// components call getBranding() in the same request, Prisma is only hit once.
//
// Fallback strategy:
//   • If the store owner has uploaded a logo via Admin > Configuración,
//     the DB URL is returned.
//   • If no logo has been uploaded yet, the static public-folder fallback is
//     used so the store looks correct on a fresh deployment.
//
// The fallback files (/auroraa.png, /footer.png) are kept in public/ only as
// zero-downtime safety nets. They are NOT imported in any component.
// =============================================================================

import { cache } from "react";
import { prisma } from "@/lib/db";

// Static fallbacks (files that live in /public).
// These are only used when the owner has not yet uploaded their own logos.
const FALLBACK_PRIMARY_LOGO = "/footer.png";
const FALLBACK_SECONDARY_LOGO = "/auroraa.png";

export interface BrandingConfig {
  /** Wordmark logo — used in footer, auth pages, emails, invoices. */
  primaryLogoUrl: string;
  /** Icon logo — used in navbar, mobile nav, admin sidebar. */
  secondaryLogoUrl: string;
  /** Storage key for the primary logo (used internally for deletion, null if fallback). */
  primaryLogoKey: string | null;
  /** Storage key for the secondary logo (used internally for deletion, null if fallback). */
  secondaryLogoKey: string | null;
}

/**
 * Fetches the current branding configuration from the database.
 * Falls back to static /public files if no logos have been uploaded yet.
 *
 * Server-only. Wrapped with React.cache() — multiple calls within the same
 * request are deduplicated to a single Prisma query automatically.
 */
export const getBranding = cache(async (): Promise<BrandingConfig> => {
  try {
    const config = await prisma.storeConfig.findFirst({
      select: {
        primaryLogoUrl: true,
        primaryLogoKey: true,
        secondaryLogoUrl: true,
        secondaryLogoKey: true,
      },
    });

    return {
      primaryLogoUrl: config?.primaryLogoUrl ?? FALLBACK_PRIMARY_LOGO,
      secondaryLogoUrl: config?.secondaryLogoUrl ?? FALLBACK_SECONDARY_LOGO,
      primaryLogoKey: config?.primaryLogoKey ?? null,
      secondaryLogoKey: config?.secondaryLogoKey ?? null,
    };
  } catch {
    // If the DB is unreachable, fall back silently so the storefront still renders.
    return {
      primaryLogoUrl: FALLBACK_PRIMARY_LOGO,
      secondaryLogoUrl: FALLBACK_SECONDARY_LOGO,
      primaryLogoKey: null,
      secondaryLogoKey: null,
    };
  }
});
