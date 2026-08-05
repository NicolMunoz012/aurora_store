"use client";
// =============================================================================
// components/ui/BrandingProvider.tsx
// Client-side context that distributes server-fetched branding data to all
// client components in the subtree without extra DB calls.
//
// Usage pattern (App Router):
//   Server layout   → getBranding() → <BrandingProvider value={branding}>
//   Client page/component → useBranding()
// =============================================================================

import { createContext, useContext } from "react";
import type { BrandingConfig } from "@/lib/branding";

// Fallback values mirror the static-file default in branding.ts so the hook
// is always safe to call even outside a provider (e.g. in tests or Storybook).
const FALLBACK: BrandingConfig = {
  logoUrl: "/aurora.png",
  logoKey: null,
};

const BrandingContext = createContext<BrandingConfig>(FALLBACK);

// ── Provider ─────────────────────────────────────────────────────────────────

interface BrandingProviderProps {
  value: BrandingConfig;
  children: React.ReactNode;
}

/**
 * Wrap a server layout's children with this provider after fetching branding
 * server-side.  All client components inside can then call useBranding().
 */
export function BrandingProvider({ value, children }: BrandingProviderProps) {
  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns the branding config that was fetched once at the layout boundary.
 * Safe to call in any client component inside a BrandingProvider.
 */
export function useBranding(): BrandingConfig {
  return useContext(BrandingContext);
}
