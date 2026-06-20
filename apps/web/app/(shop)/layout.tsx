// =============================================================================
// app/(shop)/layout.tsx — Shop layout
// =============================================================================

import { Suspense } from "react";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { getOrCreateCartAction } from "@/lib/actions/cart.actions";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("aurora_session_id")?.value ?? "";
  const session = await auth();

  let cartItemCount = 0;
  if (sessionId) {
    const result = await getOrCreateCartAction(sessionId);
    if (result.data) {
      cartItemCount = result.data.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <Navbar
          cartItemCount={cartItemCount}
          userEmail={session?.user?.email ?? null}
          userRole={session?.user?.role ?? null}
        />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
