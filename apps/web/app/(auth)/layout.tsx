// =============================================================================
// app/(auth)/layout.tsx — Auth route group layout
// Fetches branding ONCE per request and distributes it to all client pages
// (login, registro, recuperar-password, reset-password) via BrandingProvider.
// No auth page ever calls getBranding() independently.
// =============================================================================

import { BrandingProvider } from "@/components/ui/BrandingProvider";
import { getBranding } from "@/lib/branding";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await getBranding();

  return (
    <BrandingProvider value={branding}>
      {children}
    </BrandingProvider>
  );
}
