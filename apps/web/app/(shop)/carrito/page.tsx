export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(shop)/carrito/page.tsx — Cart page
// =============================================================================

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { getCartWithPricingAction } from "@/lib/actions/cart.actions";
import { CartItemControls } from "@/components/cart/CartItemControls";
import Link from "next/link";

export const metadata = { title: "Carrito — Aurora Belleza" };

function formatCOP(value: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
}

export default async function CartPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("aurora_session_id")?.value ?? "";
  const session = await auth();

  const result = await getCartWithPricingAction(sessionId);
  const cart = result.data;

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Tu carrito</h1>

      {isEmpty ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 text-5xl">🛒</div>
          <p className="text-gray-500">Tu carrito está vacío.</p>
          <Link
            href="/catalog"
            className="mt-4 inline-block rounded-full bg-cerise-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cerise-600 hover:shadow-md"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Items */}
          <ul className="flex-1 divide-y divide-gray-100">
            {cart.items.map((item) => (
              <li key={item.productId} className="flex gap-4 py-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatCOP(item.unitPrice)}{" "}
                    <span>× {item.quantity}</span>
                    {" "}={" "}
                    <span className="font-medium text-gray-700">
                      {formatCOP(item.lineTotal)}
                    </span>
                  </p>
                  <p className="text-[10px] text-gray-400">IVA incluido</p>
                </div>
                <CartItemControls
                  cartItemId={item.productId}
                  cartId={sessionId}
                  quantity={item.quantity}
                  stock={999}
                />
              </li>
            ))}
          </ul>

          {/* Summary */}
          <aside className="w-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:w-72">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Resumen</h2>

            {cart.wholesaleApplied && (
              <div className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                ✓ Precio mayorista aplicado
              </div>
            )}

            {!cart.wholesaleApplied && cart.amountToThreshold && (
              <div className="mb-4 rounded-lg bg-cerise-50 px-3 py-2 text-sm text-cerise-700">
                Te faltan <strong>{formatCOP(cart.amountToThreshold)}</strong> para precio mayorista.
              </div>
            )}

            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCOP(cart.finalSubtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">IVA incluido</p>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-full bg-cerise-500 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-cerise-600 hover:shadow-md"
            >
              Proceder al checkout
            </Link>

            {!session && (
              <p className="mt-4 text-center text-xs text-gray-400">
                <Link href="/registro" className="text-cerise-600 underline hover:text-cerise-700">
                  Regístrate
                </Link>{" "}
                para guardar tu carrito y hacer seguimiento.
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
