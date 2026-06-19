// =============================================================================
// app/(shop)/layout.tsx — Shop layout (Req 6.3)
// Server Component: wraps all public shop pages with Navbar + Footer.
// Cart item count and auth state are resolved server-side.
// =============================================================================

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

  // Resolve cart item count server-side so it's in the initial HTML
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
      <Navbar
        cartItemCount={cartItemCount}
        userEmail={session?.user?.email ?? null}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
