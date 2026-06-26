// =============================================================================
// app/checkout/page.tsx — Multi-step checkout wrapper (Req 10.1, 10.2, 11.5)
// Server Component. Passes serialized data to CheckoutFlow Client Component.
// =============================================================================

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCartWithPricingAction } from "@/lib/actions/cart.actions";
import { getStoreConfigAction } from "@/lib/actions/catalog.actions";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { prisma } from "@/lib/db";
import {
  getProfileUseCase,
  listSavedAddressesUseCase,
  PrismaUsersRepository,
} from "@aurora/core/users";

export const metadata = { title: "Finalizar la compra" };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("aurora_session_id")?.value ?? "";
  const session = await auth();

  // Need a valid cart to proceed
  const cartResult = await getCartWithPricingAction(sessionId);
  if (!cartResult.data || cartResult.data.items.length === 0) {
    redirect("/carrito");
  }

  const cart = cartResult.data;

  // Store config for STORE_PICKUP address and wholesale threshold display
  const configResult = await getStoreConfigAction();
  const storeConfig = configResult.data ?? null;

  // Pre-populate Step 1 fields + saved addresses for authenticated users (Req 10.2, 11.5)
  let prefillName = "";
  let prefillPhone = "";
  let prefillEmail = "";
  let savedAddresses: Array<{
    id: string;
    addressName: string;
    department: string;
    municipality: string;
    address: string;
    neighborhood: string | null;
  }> = [];

  if (session?.user?.id) {
    const usersRepo = new PrismaUsersRepository(prisma);
    const [profile, addresses] = await Promise.all([
      getProfileUseCase({ repository: usersRepo, userId: session.user.id }),
      listSavedAddressesUseCase({ repository: usersRepo, userId: session.user.id }),
    ]);
    if (profile) {
      prefillName = profile.fullName;
      prefillEmail = profile.email;
    }
    savedAddresses = addresses.map((a) => ({
      id: a.id,
      addressName: a.addressName,
      department: a.department,
      municipality: a.municipality,
      address: a.address,
      neighborhood: a.neighborhood,
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con logo */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="font-serif text-2xl font-bold text-gray-900">Aurora Belleza</span>
          </Link>
          <Link 
            href="/carrito" 
            className="text-sm text-gray-500 hover:text-cerise-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al carrito
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutFlow
          cart={cart}
          storeConfig={
            storeConfig
              ? {
                  storePhysicalAddress: storeConfig.storePhysicalAddress,
                  wholesaleThreshold: storeConfig.wholesaleThreshold.toString(),
                  whatsappNumber: storeConfig.whatsappNumber,
                  anonOrderExpiryDays: storeConfig.anonOrderExpiryDays,
                  registeredOrderExpiryDays: storeConfig.registeredOrderExpiryDays,
                }
              : null
          }
          isAuthenticated={!!session}
          prefill={{ name: prefillName, phone: prefillPhone, email: prefillEmail }}
          savedAddresses={savedAddresses}
          sessionId={sessionId}
          userId={session?.user?.id ?? null}
        />
      </main>
    </div>
  );
}
