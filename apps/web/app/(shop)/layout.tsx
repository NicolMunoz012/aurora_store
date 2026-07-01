// =============================================================================
// app/(shop)/layout.tsx — Shop layout
// =============================================================================

import { Suspense } from "react";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";
import { getOrCreateCartAction } from "@/lib/actions/cart.actions";
import { listActiveCategoriesAction, getStoreConfigAction } from "@/lib/actions/catalog.actions";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("aurora_session_id")?.value ?? "";
  const session = await auth();

  // Run all 3 queries in parallel — previously sequential (holding connections longer)
  const [cartResult, categoriesResult, configResult] = await Promise.all([
    sessionId ? getOrCreateCartAction(sessionId) : Promise.resolve(null),
    listActiveCategoriesAction(),
    getStoreConfigAction(),
  ]);

  const cartItemCount = cartResult?.data
    ? cartResult.data.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const categories = (categoriesResult.data ?? []).map((c) => ({ id: c.id, name: c.name }));
  const config = configResult.data;

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <Navbar
          cartItemCount={cartItemCount}
          userEmail={session?.user?.email ?? null}
          userRole={session?.user?.role ?? null}
          categories={categories}
          announcementText={config?.announcementText ?? null}
        />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer
        instagramUrl={config?.instagramUrl ?? null}
        facebookUrl={config?.facebookUrl ?? null}
        tiktokUrl={config?.tiktokUrl ?? null}
      />
      {config?.whatsappNumber && (
        <WhatsAppFloat whatsappNumber={config.whatsappNumber} />
      )}
    </div>
  );
}
